import { create } from "zustand";
import axios from "axios";
import { API_URL } from "../utils/urls";

const URL = `${API_URL}/api/auth`;

axios.defaults.withCredentials = true;

const api = axios.create({
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('authToken');
        }
        return Promise.reject(error);
    }
);

export const useAuthStore = create((set, get) => ({
    user: null,
    isAuthenticated: false,
    error: null,
    isLoading: false,
    isCheckingAuth: true,
    message: null,
    lastLoginEmail: null,

    clearError: () => set({ error: null }),

    setAuthData: (user, token) => {
        if (token) {
            localStorage.setItem('authToken', token);
        }
        if (user?.email) {
            localStorage.setItem('lastLoginEmail', user.email);
        }
        set({
            user,
            isAuthenticated: true,
            error: null,
            isLoading: false,
            lastLoginEmail: user?.email
        });
    },

    attemptAutoRelogin: async () => {
        try {
            const storedEmail = localStorage.getItem('lastLoginEmail');
            if (!storedEmail) return false;

            // Try to get a new token using stored email
            const response = await api.post(`${URL}/auto-relogin`, { email: storedEmail });
            const { user, token } = response.data;

            get().setAuthData(user, token);
            return true;
        } catch (error) {
            console.log("Auto-relogin failed:", error);
            // Clear stored email if auto-relogin fails
            localStorage.removeItem('lastLoginEmail');
            return false;
        }
    },

    clearAuthData: () => {
        localStorage.removeItem('authToken');
        set({
            user: null,
            isAuthenticated: false,
            error: null,
            isLoading: false
        });
    },

    signup: async (email, password, name) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post(`${URL}/signup`, { email, password, name });
            const { user, token } = response.data;
            get().setAuthData(user, token);
        } catch (error) {
            set({ error: error.response?.data?.message || "Error signing up", isLoading: false });
            throw error;
        }
    },

    login: async (email, password, role) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post(`${URL}/login`, { email, password, role });

            if (role === 'admin' && response?.data?.user?.isAdmin === 'admin' && !response.data.token) {
                set({ isLoading: false });
                return response;
            }

            const { user, token } = response.data;
            get().setAuthData(user, token);
            return response;
        } catch (error) {
            set({ error: error.response?.data?.message || "Error logging in", isLoading: false });
            throw error;
        }
    },

    verifyAdminOtp: async (email, code) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post(`${URL}/verify-admin-otp`, { email, code });
            const { user, token } = response.data;
            get().setAuthData(user, token);
        } catch (error) {
            set({ error: error.response?.data?.message || "Invalid OTP", isLoading: false });
            throw error;
        }
    },

    logout: async () => {
        set({ isLoading: true, error: null });
        try {
            await api.post(`${URL}/logout`);
        } catch (error) {
            console.log("Logout error:", error);
        } finally {
            localStorage.removeItem('lastLoginEmail'); 
            get().clearAuthData();
        }
    },

    verifyEmail: async (code) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post(`${URL}/verify-email`, { code });
            const { user, token } = response.data;
            get().setAuthData(user, token);
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message || "Error verifying email", isLoading: false });
            throw error;
        }
    },

    checkAuth: async () => {
        set({ isCheckingAuth: true, error: null });
        try {
            const storedToken = localStorage.getItem('authToken');

            if (!storedToken) {
                const reloginSuccess = await get().attemptAutoRelogin();
                if (!reloginSuccess) {
                    set({ user: null, isAuthenticated: false, isCheckingAuth: false });
                }
                return;
            }

            const response = await api.get(`${URL}/check-auth`);
            const { user } = response.data;

            set({
                user,
                isAuthenticated: true,
                isCheckingAuth: false,
                error: null,
                lastLoginEmail: user?.email
            });
        } catch (error) {
            console.log("Auth check failed, trying auto-relogin:", error);

            const reloginSuccess = await get().attemptAutoRelogin();
            if (!reloginSuccess) {
                get().clearAuthData();
            }
            set({ isCheckingAuth: false });
        }
    },

    forgotPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post(`${URL}/forgot-password`, { email });
            set({ message: response.data.message, isLoading: false });
        } catch (error) {
            set({
                isLoading: false,
                error: error.response?.data?.message || "Error sending reset password email",
            });
            throw error;
        }
    },

    resetPassword: async (token, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post(`${URL}/reset-password/${token}`, { password });
            set({ message: response.data.message, isLoading: false });
        } catch (error) {
            set({
                isLoading: false,
                error: error.response?.data?.message || "Error resetting password",
            });
            throw error;
        }
    },

    updateUserInStore: (updatedUser) => {
        set((state) => {
            const newUser = state.user ? { ...state.user, ...updatedUser } : updatedUser;
            return { user: newUser };
        });
    },

    initializeAuth: () => {
        try {
            const storedToken = localStorage.getItem('authToken');
            const storedEmail = localStorage.getItem('lastLoginEmail');

            if (storedToken || storedEmail) {
                set({
                    user: null,
                    isAuthenticated: false,
                    isCheckingAuth: true,
                    lastLoginEmail: storedEmail
                });
                get().checkAuth();
            } else {
                set({
                    user: null,
                    isAuthenticated: false,
                    isCheckingAuth: false
                });
            }
        } catch (error) {
            console.error("Error initializing auth:", error);
            get().clearAuthData();
            set({ isCheckingAuth: false });
        }
    },
}));

export { api };