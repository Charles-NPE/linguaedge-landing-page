
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Demo from "./pages/Demo";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Pricing from "./pages/Pricing";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookieConsent from "./components/CookieConsent";
import { AuthProvider } from "./contexts/AuthContext";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import TeacherRegisterPage from "./pages/TeacherRegisterPage";
import StudentRegisterPage from "./pages/StudentRegisterPage";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import RoleRoute from "./components/RoleRoute";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import BillingPage from "./pages/BillingPage";
import { ThemeProvider } from "./contexts/ThemeContext";
import TeacherClassesPage from "./pages/TeacherClassesPage";
import ClassDetail from "./pages/ClassDetail";

const queryClient = new QueryClient();

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/login" element={<LoginPage />} />
    
    {/* Password Reset Routes */}
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />
    
    {/* New signup flow routes */}
    <Route path="/signup" element={<SignupPage />} />
    <Route path="/signup/teacher" element={<TeacherRegisterPage />} />
    <Route path="/signup/student" element={<StudentRegisterPage />} />
    
    {/* Redirect old register route to new signup flow */}
    <Route path="/register" element={<Navigate to="/signup" replace />} />
    
    {/* Protected Teacher Routes - now requires active subscription */}
    <Route 
      path="/teacher" 
      element={
        <RoleRoute allowed={['teacher']} requireSubscription={true}>
          <TeacherDashboard />
        </RoleRoute>
      } 
    />
    
    {/* New Teacher Classes Route */}
    <Route 
      path="/teacher/classes" 
      element={
        <RoleRoute allowed={['teacher']} requireSubscription={true}>
          <TeacherClassesPage />
        </RoleRoute>
      } 
    />
    
    {/* Class Detail Route - accessible to both teachers and students */}
    <Route 
      path="/teacher/classes/:id" 
      element={
        <RoleRoute allowed={['teacher', 'student']}>
          <ClassDetail />
        </RoleRoute>
      } 
    />
    
    {/* Protected Student Routes */}
    <Route 
      path="/student" 
      element={
        <RoleRoute allowed={['student']}>
          <StudentDashboard />
        </RoleRoute>
      } 
    />
    
    {/* User Account Routes */}
    <Route 
      path="/profile" 
      element={
        <RoleRoute allowed={['teacher', 'student']}>
          <ProfilePage />
        </RoleRoute>
      } 
    />
    <Route 
      path="/settings" 
      element={
        <RoleRoute allowed={['teacher', 'student']}>
          <SettingsPage />
        </RoleRoute>
      } 
    />
    <Route 
      path="/billing" 
      element={
        <RoleRoute allowed={['teacher', 'student']}>
          <BillingPage />
        </RoleRoute>
      } 
    />
    
    {/* Other Public Routes */}
    <Route path="/demo" element={<Demo />} />
    <Route path="/about" element={<About />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/pricing" element={<Pricing />} />
    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
    <Route path="/terms-of-service" element={<TermsOfService />} />
    
    {/* Catch-all Route */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            <div className="min-h-screen flex flex-col w-full">
              <Toaster />
              <Sonner />
              <AppRoutes />
              <CookieConsent />
            </div>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
