
import React, { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import UserDropdown from "@/components/navigation/UserDropdown";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  actions?: React.ReactNode;
}

const DashboardLayoutContent: React.FC<DashboardLayoutProps> = ({ children, title, actions }) => {
  const { signOut } = useAuth();
  const { theme } = useTheme();

  // Apply dark class to body for portals/modals when dashboard is mounted
  useEffect(() => {
    if (theme === "dark") {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
    
    // Cleanup when component unmounts
    return () => {
      document.body.classList.remove("dark");
    };
  }, [theme]);

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="min-h-screen bg-gradient-to-br from-indigo-500/5 via-transparent to-violet-500/5 dark:from-indigo-950/20 dark:via-transparent dark:to-violet-950/20 dark:bg-slate-900">
        <header className="bg-white border-b shadow-sm dark:bg-slate-800 dark:border-slate-700">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link to="/" className="font-bold text-xl text-primary dark:text-indigo-400">
                LinguaEdgeAI
              </Link>
              <h1 className="text-xl font-semibold hidden md:block text-slate-900 dark:text-white">{title}</h1>
            </div>
            <div className="flex items-center space-x-4">
              {actions}
              <UserDropdown />
            </div>
          </div>
        </header>
        <main className="container mx-auto p-4 md:p-6 lg:p-8">
          <div className="md:hidden mb-6">
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{title}</h1>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
};

const DashboardLayout: React.FC<DashboardLayoutProps> = (props) => {
  return (
    <ThemeProvider>
      <DashboardLayoutContent {...props} />
    </ThemeProvider>
  );
};

export default DashboardLayout;
