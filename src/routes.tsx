
import { lazy } from "react";
import { Navigate } from "react-router-dom";
import RoleRoute from "@/components/RoleRoute";

// Lazy load all page components
export const Index = lazy(() => import("@/pages/Index"));
export const LoginPage = lazy(() => import("@/pages/LoginPage"));
export const SignupPage = lazy(() => import("@/pages/SignupPage"));
export const TeacherRegisterPage = lazy(() => import("@/pages/TeacherRegisterPage"));
export const StudentRegisterPage = lazy(() => import("@/pages/StudentRegisterPage"));
export const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPasswordPage"));
export const ResetPasswordPage = lazy(() => import("@/pages/ResetPasswordPage"));
export const TeacherDashboard = lazy(() => import("@/pages/TeacherDashboard"));
export const TeacherClassesPage = lazy(() => import("@/pages/TeacherClassesPage"));
export const TeacherMyEssays = lazy(() => import("@/pages/TeacherMyEssays"));
export const StudentDashboard = lazy(() => import("@/pages/StudentDashboard"));
export const StudentAssignments = lazy(() => import("@/pages/StudentAssignments"));
export const StudentCorrections = lazy(() => import("@/pages/StudentCorrections"));
export const StudentProgress = lazy(() => import("@/pages/StudentProgress"));
export const ClassDetail = lazy(() => import("@/pages/ClassDetail"));
export const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
export const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
export const BillingPage = lazy(() => import("@/pages/BillingPage"));
export const Demo = lazy(() => import("@/pages/Demo"));
export const About = lazy(() => import("@/pages/About"));
export const Contact = lazy(() => import("@/pages/Contact"));
export const Pricing = lazy(() => import("@/pages/Pricing"));
export const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
export const TermsOfService = lazy(() => import("@/pages/TermsOfService"));
export const NotFound = lazy(() => import("@/pages/NotFound"));

export const allRoutes = [
  { path: "/", element: <Index /> },
  { path: "/login", element: <LoginPage /> },
  
  // Password Reset Routes
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/reset-password", element: <ResetPasswordPage /> },
  
  // New signup flow routes
  { path: "/signup", element: <SignupPage /> },
  { path: "/signup/teacher", element: <TeacherRegisterPage /> },
  { path: "/signup/student", element: <StudentRegisterPage /> },
  
  // Redirect old register route to new signup flow
  { path: "/register", element: <Navigate to="/signup" replace /> },
  
  // Protected Teacher Routes - now requires active subscription
  { 
    path: "/teacher", 
    element: (
      <RoleRoute allowed={['teacher']} requireSubscription={true}>
        <TeacherDashboard />
      </RoleRoute>
    )
  },
  
  // New Teacher Classes Route
  { 
    path: "/teacher/classes", 
    element: (
      <RoleRoute allowed={['teacher']} requireSubscription={true}>
        <TeacherClassesPage />
      </RoleRoute>
    )
  },
  
  // Class Detail Route - accessible to both teachers and students
  { 
    path: "/teacher/classes/:id", 
    element: (
      <RoleRoute allowed={['teacher', 'student']}>
        <ClassDetail />
      </RoleRoute>
    )
  },
  
  // Protected Student Routes
  { 
    path: "/student", 
    element: (
      <RoleRoute allowed={['student']}>
        <StudentDashboard />
      </RoleRoute>
    )
  },
  
  // Student Assignments Route
  { 
    path: "/student/assignments", 
    element: (
      <RoleRoute allowed={['student']}>
        <StudentAssignments />
      </RoleRoute>
    )
  },
  
  // Student Corrections Route
  { 
    path: "/student/corrections", 
    element: (
      <RoleRoute allowed={['student']}>
        <StudentCorrections />
      </RoleRoute>
    )
  },
  
  // Student Progress Route
  { 
    path: "/student/progress", 
    element: (
      <RoleRoute allowed={['student']}>
        <StudentProgress />
      </RoleRoute>
    )
  },
  
  // User Account Routes
  { 
    path: "/profile", 
    element: (
      <RoleRoute allowed={['teacher', 'student']}>
        <ProfilePage />
      </RoleRoute>
    )
  },
  { 
    path: "/settings", 
    element: (
      <RoleRoute allowed={['teacher', 'student']}>
        <SettingsPage />
      </RoleRoute>
    )
  },
  { 
    path: "/billing", 
    element: (
      <RoleRoute allowed={['teacher', 'student']}>
        <BillingPage />
      </RoleRoute>
    )
  },
  
  // Other Public Routes
  { path: "/demo", element: <Demo /> },
  { path: "/about", element: <About /> },
  { path: "/contact", element: <Contact /> },
  { path: "/pricing", element: <Pricing /> },
  { path: "/privacy-policy", element: <PrivacyPolicy /> },
  { path: "/terms-of-service", element: <TermsOfService /> },
  
  // New Teacher Essays Route
  { 
    path: "/teacher/essays", 
    element: (
      <RoleRoute allowed={['teacher']} requireSubscription={true}>
        <TeacherMyEssays />
      </RoleRoute>
    )
  },
  
  // Catch-all Route
  { path: "*", element: <NotFound /> }
];
