
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import DashboardLayout from "@/components/dashboards/DashboardLayout";

const SettingsPage = () => {
  const { user, profile } = useAuth();
  const { theme, setTheme } = useTheme();
  
  const userRole = profile?.role || 'student';
  const dashboardPath = userRole === 'teacher' ? "/teacher" : "/student";

  return (
    <DashboardLayout title="Settings">
      <div className="container max-w-4xl py-6">
        {/* Back button */}
        <div className="mb-6">
          <Link to={dashboardPath}>
            <Button variant="outline" className="gap-2">
              <ArrowLeft size={16} />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        
        {/* Theme Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Theme Settings</CardTitle>
            <CardDescription>
              Customize the appearance of the application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark theme
                </p>
              </div>
              <Switch 
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>
              Manage your account preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Additional account settings will be added here.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
