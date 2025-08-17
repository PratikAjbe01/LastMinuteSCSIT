import { create } from "zustand";
import axios from "axios";
import { API_URL } from "../utils/urls";

const URL = `${API_URL}/api/auth`;

axios.defaults.withCredentials = true;

export const useAuthStore = create((set) => ({
    user: localStorage.getItem("user") && JSON.parse(localStorage.getItem("user")) || null,
    isAuthenticated: !!localStorage.getItem("user"),
    error: null,
    isLoading: false,
    isCheckingAuth: false,
    message: null,

    clearError: () => set({ error: null }),

    signup: async (email, password, name) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${URL}/signup`, { email, password, name });
            localStorage.setItem("user", JSON.stringify(response.data.user));
            set({ user: response.data.user, isAuthenticated: true, isLoading: false });
        } catch (error) {
            set({ error: error.response.data.message || "Error signing up", isLoading: false });
            throw error;
        }
    },
    login: async (email, password, role) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${URL}/login`, { email, password, role });

            if (role === 'admin' && response?.data?.user?.isAdmin === 'admin') {
                set({ isLoading: false });
                return response;
            }

            localStorage.setItem("user", JSON.stringify(response.data.user));
            set({
                isAuthenticated: true,
                user: response.data.user,
                isLoading: false,
            });
            return response;
        } catch (error) {
            set({ error: error.response?.data?.message || "Error logging in", isLoading: false });
            throw error;
        }
    },
    verifyAdminOtp: async (email, code) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${URL}/verify-admin-otp`, { email, code });
            localStorage.setItem("user", JSON.stringify(response.data.user));
            set({
                isAuthenticated: true,
                user: response.data.user,
                error: null,
                isLoading: false,
            });
        } catch (error) {
            set({ error: error.response?.data?.message || "Invalid OTP", isLoading: false });
            throw error;
        }
    },
    logout: async () => {
        set({ isLoading: true, error: null });
        try {
            localStorage.removeItem("user");
            set({ user: null, isAuthenticated: false, error: null, isLoading: false });
        } catch (error) {
            set({ error: "Error logging out", isLoading: false });
            throw error;
        }
    },
    verifyEmail: async (code) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${URL}/verify-email`, { code });
            localStorage.setItem("user", JSON.stringify(response.data.user));
            set({ user: response.data.user, isAuthenticated: true, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error verifying email", isLoading: false });
            throw error;
        }
    },
    checkAuth: async () => {
        set({ isCheckingAuth: true, error: null });
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            set({ user: JSON.parse(storedUser), isAuthenticated: true, isCheckingAuth: false });
        } else {
            set({ user: null, isAuthenticated: false, isCheckingAuth: false });
        }
    },
    forgotPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${URL}/forgot-password`, { email });
            set({ message: response.data.message, isLoading: false });
        } catch (error) {
            set({
                isLoading: false,
                error: error.response.data.message || "Error sending reset password email",
            });
            throw error;
        }
    },
    resetPassword: async (token, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${URL}/reset-password/${token}`, { password });
            set({ message: response.data.message, isLoading: false });
        } catch (error) {
            set({
                isLoading: false,
                error: error.response.data.message || "Error resetting password",
            });
            throw error;
        }
    },
    setUser: (user) => {
        localStorage.setItem("user", JSON.stringify(user));
        set({ user, isAuthenticated: true });
    },
}));