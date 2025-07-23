import { Navigate, Route, Routes } from "react-router-dom";
import FloatingShape from "./components/FloatingShape";

import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
// import DashboardPage from "./pages/DashboardPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import Home from "./pages/Home";
import LoadingSpinner from "./components/LoadingSpinner";

import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "./components/Header";
import Courses from "./pages/Courses";
import SemestersPage from "./pages/Semesters";
import UploadDocumentPage from "./pages/UploadDocumentPage";
import DocumentsPage from "./pages/DocumentsPage";
import Footer from "./components/Footer";


// protect routes that require authentication
const ProtectedRoute = ({ children }) => {
	const { isAuthenticated, user } = useAuthStore();

	if (!isAuthenticated) {
		return <Navigate to='/login' replace />;
	}

	if (!user?.isVerified) {
		return <Navigate to='/verify-email' replace />;
	}

	return children;
};

// redirect authenticated users to the home page
const RedirectAuthenticatedUser = ({ children }) => {
	const { isAuthenticated, user } = useAuthStore();

	if (isAuthenticated && user?.isVerified) {
		return <Navigate to='/' replace />;
	}

	return children;
};

function App() {
	const { isCheckingAuth, checkAuth } = useAuthStore();
	const location = useLocation();

	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	if (isCheckingAuth) return <LoadingSpinner />;

	// Define routes that should have floating shapes
	const floatingRoutes = [
		"/login",
		"/signup",
		"/forgot-password",
		"/reset-password",
		"/verify-email"
	];

	// Check if current route matches any floating route (including /reset-password/:token)
	const isFloatingPage = floatingRoutes.some(route => {
		if (route.includes(":")) {
			// handle dynamic route
			const base = route.split(":")[0];
			return location.pathname.startsWith(base);
		}
		return location.pathname === route;
	}) || location.pathname.startsWith("/reset-password");

	return (
	<>
<Header />
	<div
			className={`min-h-full flex items-center justify-center relative overflow-hidden ${
				isFloatingPage
					? "bg-gradient-to-br from-gray-900 via-blue-900 to-black-900"
					: "bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900"
			}`}
		>
			{isFloatingPage && (
				<>
					<FloatingShape color='bg-blue-500' size='w-64 h-64' top='-5%' left='10%' delay={0} />
					<FloatingShape color='bg-black-500' size='w-48 h-48' top='70%' left='80%' delay={5} />
					<FloatingShape color='bg-gray-500' size='w-32 h-32' top='40%' left='-10%' delay={2} />
				</>
			)}
			</div>
			<Routes>
				<Route
					path='/'
					element={
						<ProtectedRoute>
						<Home/>
						{/* <DashboardPage/> */}
						</ProtectedRoute>
					}
				/>
				<Route
					path='/signup'
					element={
						<RedirectAuthenticatedUser>
							<SignUpPage />
						</RedirectAuthenticatedUser>
					}
				/>
				<Route
					path='/login'
					element={
						<RedirectAuthenticatedUser>
							<LoginPage />
						</RedirectAuthenticatedUser>
					}
				/>
					<Route
					path='/upload'
					element={
						<ProtectedRoute>
							<UploadDocumentPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path='/scsit/courses'
					element={
						<ProtectedRoute>
						<Courses/>
						</ProtectedRoute>
					}
				/>
					<Route
					path='/scsit/:course/semesters'
					element={
						<ProtectedRoute>
						<SemestersPage />
						</ProtectedRoute>
					}
				/>
					<Route
					path='/scsit/:course/semesters/:semesterId'
					element={
						<ProtectedRoute>
						<DocumentsPage />
						</ProtectedRoute>
					}
				/>
				<Route path='/verify-email' element={<EmailVerificationPage />} />
				<Route
					path='/forgot-password'
					element={
						<RedirectAuthenticatedUser>
							<ForgotPasswordPage />
						</RedirectAuthenticatedUser>
					}
				/>

				<Route
					path='/reset-password/:token'
					element={
						<RedirectAuthenticatedUser>
							<ResetPasswordPage />
						</RedirectAuthenticatedUser>
					}
				/>
				{/* catch all routes */}
				<Route path='*' element={<Navigate to='/' replace />} />
			</Routes>
			<Footer />
			<Toaster />
	</>
	);
}

export default App;
