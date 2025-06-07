
import { createBrowserRouter, Outlet } from "react-router-dom";
import Index from "@/pages/Index";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import SignupPage from "@/pages/SignupPage";
import TeacherRegisterPage from "@/pages/TeacherRegisterPage";
import StudentRegisterPage from "@/pages/StudentRegisterPage";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Pricing from "@/pages/Pricing";
import TermsOfService from "@/pages/TermsOfService";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import Demo from "@/pages/Demo";
import StudentDashboard from "@/pages/StudentDashboard";
import StudentAssignments from "@/pages/StudentAssignments";
import StudentCorrections from "@/pages/StudentCorrections";
import StudentProgress from "@/pages/StudentProgress";
import TeacherDashboard from "@/pages/TeacherDashboard";
import TeacherAssign from "@/pages/TeacherAssign";
import TeacherClassesPage from "@/pages/TeacherClassesPage";
import ClassDetail from "@/pages/ClassDetail";
import TeacherMyEssays from "@/pages/TeacherMyEssays";
import ProfilePage from "@/pages/ProfilePage";
import SettingsPage from "@/pages/SettingsPage";
import BillingPage from "@/pages/BillingPage";
import NotFound from "@/pages/NotFound";
import RoleRoute from "@/components/RoleRoute";
import TeacherAnalytics from "@/pages/TeacherAnalytics";
import { AuthProvider } from "@/contexts/AuthContext";

// Root layout component that provides AuthContext
const RootLayout = () => {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
};

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <Index />,
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/register",
        element: <RegisterPage />,
      },
      {
        path: "/forgot-password",
        element: <ForgotPasswordPage />,
      },
      {
        path: "/reset-password",
        element: <ResetPasswordPage />,
      },
      {
        path: "/signup",
        element: <SignupPage />,
      },
      {
        path: "/teacher-register",
        element: <TeacherRegisterPage />,
      },
      {
        path: "/student-register",
        element: <StudentRegisterPage />,
      },
      {
        path: "/about",
        element: <About />,
      },
      {
        path: "/contact",
        element: <Contact />,
      },
      {
        path: "/pricing",
        element: <Pricing />,
      },
      {
        path: "/terms",
        element: <TermsOfService />,
      },
      {
        path: "/privacy",
        element: <PrivacyPolicy />,
      },
      {
        path: "/demo",
        element: <Demo />,
      },
      {
        element: <RoleRoute allowed={["student"]} />,
        children: [
          {
            path: "/student",
            element: <StudentDashboard />,
          },
          {
            path: "/student/assignments",
            element: <StudentAssignments />,
          },
          {
            path: "/student/corrections",
            element: <StudentCorrections />,
          },
          {
            path: "/student/progress",
            element: <StudentProgress />,
          },
        ],
      },
      {
        element: <RoleRoute allowed={["teacher"]} requireSubscription={true} />,
        children: [
          {
            path: "/teacher",
            element: <TeacherDashboard />,
          },
          {
            path: "/teacher/assign",
            element: <TeacherAssign />,
          },
          {
            path: "/teacher/classes",
            element: <TeacherClassesPage />,
          },
          {
            path: "/teacher/classes/:id",
            element: <ClassDetail />,
          },
          {
            path: "/teacher/essays",
            element: <TeacherMyEssays />,
          },
          {
            path: "/teacher/analytics",
            element: <TeacherAnalytics />,
          },
        ],
      },
      {
        element: <RoleRoute allowed={["student", "teacher"]} />,
        children: [
          {
            path: "/profile",
            element: <ProfilePage />,
          },
          {
            path: "/settings",
            element: <SettingsPage />,
          },
          {
            path: "/billing",
            element: <BillingPage />,
          },
        ],
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);
