import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import UserDropdown from "@/components/navigation/UserDropdown";
import NotificationDrawer from "@/components/notifications/NotificationDrawer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Bell } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  actions?: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title, actions }) => {
  const { signOut, user } = useAuth();
  const { theme } = useTheme();
  const [dashboardDensity, setDashboardDensity] = useState<"comfortable" | "compact">("comfortable");
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const { unreadCount } = useNotifications(user?.id);

  // Load dashboard density from user settings
  useEffect(() => {
    const loadDensity = async () => {
      if (!user) return;
      
      try {
        const { data } = await supabase
          .from("user_settings")
          .select("dashboard_density")
          .eq("user_id", user.id)
          .single();
          
        if (data?.dashboard_density) {
          setDashboardDensity(data.dashboard_density as "comfortable" | "compact");
        }
      } catch (error) {
        console.error("Error loading dashboard density:", error);
      }
    };
    
    loadDensity();
  }, [user]);

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

  const densityClass = dashboardDensity === "compact" ? "density-compact" : "density-comfortable";

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className={cn(
        densityClass,
        "min-h-screen bg-gradient-to-br from-indigo-500/5 via-transparent to-violet-500/5 dark:from-indigo-950/20 dark:via-transparent dark:to-violet-950/20 dark:bg-slate-900"
      )}>
        <header className="bg-white border-b shadow-sm dark:bg-slate-800 dark:border-slate-700">
          <div className="container mx-auto px-4 py-[var(--p-header,1rem)] flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link to="/" className="font-bold text-xl text-primary dark:text-indigo-400">
                LinguaEdgeAI
              </Link>
              <h1 className="text-xl font-semibold hidden md:block text-slate-900 dark:text-white">{title}</h1>
            </div>
            <div className="flex items-center space-x-4">
              {actions}
              {user && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setNotificationDrawerOpen(true)} 
                  className="relative"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-destructive" />
                  )}
                </Button>
              )}
              <UserDropdown />
            </div>
          </div>
        </header>
        <main className="container mx-auto p-[var(--p-main,1rem)] md:p-[var(--p-main-md,1.5rem)] lg:p-[var(--p-main-lg,2rem)]">
          <div className="md:hidden mb-[var(--gap,1.5rem)]">
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{title}</h1>
          </div>
          {children}
        </main>
      </div>
      
      <NotificationDrawer 
        open={notificationDrawerOpen}
        onOpenChange={setNotificationDrawerOpen}
        userId={user?.id}
      />
    </div>
  );
};

export default DashboardLayout;
