import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
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
import CalculatorPage from "./pages/ToolsPage";
import PlannerPage from "./pages/PlannerPage";

import { useAuthStore } from "./store/authStore";
import { ValuesContext } from "./context/ValuesContext";

const ProtectedRoute = ({ children }) => {
	const { isAuthenticated } = useAuthStore();
	if (!isAuthenticated) return <Navigate to='/login' replace />;
	return children;
};


const RedirectAuthenticatedUser = ({ children }) => {
	const { isAuthenticated } = useAuthStore();
	if (isAuthenticated ) return <Navigate to='/' replace />;
	return children;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user?.isVerified) return <Navigate to="/verify-email" replace />;
if (user?.isAdmin !== "admin") return <Navigate to="/" replace />;


  return children;
};

function App() {
  const { isCheckingAuth, checkAuth } = useAuthStore();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isCheckingAuth) {
    return <LoadingSpinner />;
  }

  const floatingRoutes = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
  ];

  const isFloatingPage =
    floatingRoutes.some((route) => {
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
          className={`min-h-screen flex flex-col relative overflow-hidden ${
            isFloatingPage
              ? "bg-gradient-to-br from-gray-900 via-blue-900 to-black"
              : "bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900"
          }`}
        >
          {isFloatingPage && (
            <>
              <FloatingShape
                color="bg-blue-500"
                size="w-64 h-64"
                top="-5%"
                left="10%"
                delay={0}
              />
              <FloatingShape
                color="bg-black-500"
                size="w-48 h-48"
                top="70%"
                left="80%"
                delay={5}
              />
              <FloatingShape
                color="bg-gray-500"
                size="w-32 h-32"
                top="40%"
                left="-10%"
                delay={2}
              />
            </>
          )}

          <main className="flex-1">
            <Routes>
              <Route
                path="/"
                element={
            
                    <Home />
           
                }
              />
              <Route
                path="/upload"
                element={
                  <AdminRoute>
                    <UploadDocumentPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/scsit/courses"
                element={
                
                    <Courses />
                 
                }
              />
              <Route
                path="/scsit/:course/semesters"
                element={
             
                    <SemestersPage />
                  
                }
              />
              <Route
                path="/scsit/:course/semesters/:semesterId"
                element={
                  <ProtectedRoute>
                    <DocumentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/files"
                element={
                 
                    <MyFilesPage />
                
                }
              />
              <Route path="/share/file/:id" element={<ShareFilePage />} />
              <Route
                path="/allfiles"
                element={
                  <ProtectedRoute>
                    <AllFilesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/planner/todos"
                element={
                  <ProtectedRoute>
                    <PlannerPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/calculations/tools/:toolName"
                element={<CalculatorPage />}
              />
              <Route
                path="/about"
                element={
         
                    <AboutPage />
                }
              />
              <Route path="/verify-email" element={<EmailVerificationPage />} />
              <Route
                path="/signup"
                element={
                  <RedirectAuthenticatedUser>
                    <SignUpPage />
                  </RedirectAuthenticatedUser>
                }
              />
              <Route
                path="/login"
                element={
                  <RedirectAuthenticatedUser>
                    <LoginPage />
                  </RedirectAuthenticatedUser>
                }
              />
              <Route
                path="/forgot-password"
                element={
                  <RedirectAuthenticatedUser>
                    <ForgotPasswordPage />
                  </RedirectAuthenticatedUser>
                }
              />
              <Route
                path="/reset-password/:token"
                element={
                  <RedirectAuthenticatedUser>
                    <ResetPasswordPage />
                  </RedirectAuthenticatedUser>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
        <Toaster />
      </ValuesContext.Provider>
    </>
  );
}

export default App;
