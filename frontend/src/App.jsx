import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSwipeable } from "react-swipeable";
import { Toaster } from "react-hot-toast";

import FloatingShape from "./components/FloatingShape";
import LoadingSpinner from "./components/LoadingSpinner";
import Header from "./components/Header";
import Footer from "./components/Footer";

import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import Home from "./pages/Home";
import Courses from "./pages/Courses";
import SemestersPage from "./pages/Semesters";
import UploadDocumentPage from "./pages/UploadDocumentPage";
import DocumentsPage from "./pages/DocumentsPage";
import MyFilesPage from "./pages/UserFilesPage";
import AllFilesPage from "./pages/AllFilesPage";
import AboutPage from "./pages/About";
import ShareFilePage from "./pages/ShareFilePage";
import AttendanceManager from "./pages/AttendanceManagerPage";
import CalculatorPage from "./pages/ToolsPage";

import { useAuthStore } from "./store/authStore";
import { ValuesContext } from "./context/ValuesContext";
import PlannerPage from "./pages/PlannerPage";
import AdminFilesPage from "./pages/AdminFilesPage";
import UsersPage from "./pages/AllUsersPage";
import VerifyUserEmail from "./pages/VerifyEmailPage";

const ProtectedRoute = ({ children }) => {
	const { user } = useAuthStore();
	if (!user) return <Navigate to='/login' replace />;
	return children;
};

const RedirectAuthenticatedUser = ({ children }) => {
	const { user } = useAuthStore();
	if (user) return <Navigate to='/' replace />;
	return children;
};

function App() {
	const { isCheckingAuth, checkAuth, user } = useAuthStore();
	const location = useLocation();
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
	const navigate = useNavigate();

	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.ctrlKey) {
				switch (e.key.toLowerCase()) {
					case 's':
						e.preventDefault();
						setIsSidebarOpen(prev => !prev);
						break;
					case 'p':
						e.preventDefault();
						navigate('/scsit/courses');
						break;
					case 'a':
						e.preventDefault();
						navigate('/allfiles');
						break;
					case 'c':
						e.preventDefault();
						navigate('/calculations/tools/cgpa');
						break;
					case 'h':
						e.preventDefault();
						navigate('/home');
						break;
					case 'm':
						if (user?._id) {
							e.preventDefault();
							navigate(`/scsit/mca/semesters/3`);
						}
						break;
					case 'b':
						if (user?._id) {
							e.preventDefault();
							navigate(`/scsit/bca/semesters/1`);
						}
						break;
					default:
						break;
				}
			}
		};

		window.addEventListener('keydown', handleKeyDown);

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [navigate, setIsSidebarOpen, user]);

	const floatingRoutes = [
		"/login",
		"/signup",
		"/forgot-password",
		"/reset-password",
		"/verify-email",
	];

	const isFloatingPage = floatingRoutes.some(route => {
		if (route.includes(":")) {
			const base = route.split(":")[0];
			return location.pathname.startsWith(base);
		}
		return location.pathname === route;
	}) || location.pathname.startsWith("/reset-password");

	return (
		<>
			<ValuesContext.Provider value={{ isSidebarOpen, setIsSidebarOpen }}>
				<Header />
				<div
					className={`min-h-full flex items-center justify-center relative overflow-hidden ${isFloatingPage
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
							<Home />
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
							<Courses />
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
						path='/scsit/:course/semesters'
						element={
							<SemestersPage />
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
					<Route
						path='/profile/files'
						element={
							<ProtectedRoute>
								<MyFilesPage />
							</ProtectedRoute>
						}
					/>
					<Route path='/share/file/:id' element={<ShareFilePage />} />
					<Route
						path='/allfiles'
						element={
							<AllFilesPage />
						}
					/>
					<Route
						path='/attendance/manager/user/:userId'
						element={
							<ProtectedRoute>
								<AttendanceManager />
							</ProtectedRoute>
						}
					/>
					<Route
						path='/planner/todos'
						element={
							<ProtectedRoute>
								<PlannerPage />
							</ProtectedRoute>
						}
					/>
					<Route path='/calculations/tools/:toolName' element={<CalculatorPage />} />
					<Route
						path='/about'
						element={
							<AboutPage />
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
					<Route
						path='/allfiles/admin'
						element={
							<ProtectedRoute>
								<AdminFilesPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path='/allusers'
						element={
							<ProtectedRoute>
								<UsersPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path='/verify-user-email'
						element={
							<ProtectedRoute>
								<VerifyUserEmail />
							</ProtectedRoute>
						}
					/>
					<Route path='*' element={<Navigate to='/' replace />} />
				</Routes>
				<Footer />
				<Toaster />
			</ValuesContext.Provider>
		</>
	);
}

export default App;