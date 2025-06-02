
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useEmailPreferences, updateEmailPreferences } from "@/hooks/useEmailPreferences";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/integrations/supabase/client";

const SettingsPage: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  const { data: emailPref, isLoading: emailLoading } = useEmailPreferences(user?.id);
  const [language, setLanguage] = useState("en");
  const [dashboardDensity, setDashboardDensity] = useState<"comfortable" | "compact">("comfortable");

  // Determine dashboard path based on user role/path
  const isTeacher = window.location.pathname.includes('teacher') || user?.user_metadata?.role === 'teacher';
  const dashboardPath = isTeacher ? "/teacher" : "/student";
  const roleTitle = isTeacher ? "Teacher" : "Student";

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

  const handleLanguageChange = async (value: string) => {
    if (value !== 'en') {
      toast({
        title: "Language not available",
        description: "This language is coming soon!",
        variant: "default"
      });
      return;
    }
    setLanguage(value);
    toast({
      title: "Language updated",
      description: "Your language preference has been saved."
    });
  };

  const handleEmailToggle = async (checked: boolean) => {
    if (!user?.id) return;
    
    try {
      await updateEmailPreferences(user.id, checked);
      queryClient.invalidateQueries({ queryKey: ['emailPreferences', user.id] });
      
      toast({
        title: "Email preferences updated",
        description: checked ? "You will receive email notifications." : "Email notifications disabled."
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Could not update email preferences. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleThemeToggle = async (checked: boolean) => {
    const newTheme = checked ? "dark" : "light";
    await setTheme(newTheme);
    toast({
      title: "Theme updated",
      description: `Switched to ${newTheme} mode.`
    });
  };

  const handleDensityChange = async (value: "comfortable" | "compact") => {
    if (!user?.id) return;
    
    try {
      await supabase
        .from("user_settings")
        .upsert(
          { 
            user_id: user.id, 
            dashboard_density: value,
            updated_at: new Date().toISOString()
          }, 
          { onConflict: "user_id" }
        );
      
      setDashboardDensity(value);
      toast({
        title: "Dashboard density updated",
        description: `Switched to ${value} layout.`
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Could not update dashboard density. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-6">{roleTitle} Settings</h1>
      
      {/* Back button */}
      <div className="mb-6">
        <Link to={dashboardPath}>
          <Button variant="outline" className="gap-2">
            <ArrowLeft size={16} />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Theme Settings</CardTitle>
            <CardDescription>
              Customize the appearance of the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Switch
                  id="dark-mode"
                  checked={theme === "dark"}
                  onCheckedChange={handleThemeToggle}
                />
                <Label htmlFor="dark-mode">Dark Mode</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Toggle between light and dark theme for better visibility.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Interface Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Interface Settings</CardTitle>
            <CardDescription>
              Choose your dashboard layout preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Label htmlFor="dashboard-density" className="min-w-fit">Dashboard Density</Label>
                <Select value={dashboardDensity} onValueChange={handleDensityChange}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select density" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border shadow-lg z-50">
                    <SelectItem value="comfortable">Comfortable</SelectItem>
                    <SelectItem value="compact">Compact</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-muted-foreground">
                Control the spacing and layout density of dashboard elements.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Language Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Language Preferences</CardTitle>
            <CardDescription>
              Choose your preferred language for the interface
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Label htmlFor="language" className="min-w-fit">Interface Language</Label>
                <TooltipProvider>
                  <Select value={language} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border shadow-lg z-50">
                      <SelectItem value="en">English</SelectItem>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SelectItem
                            value="es"
                            disabled
                            className="opacity-50 cursor-not-allowed"
                          >
                            Español&nbsp;(coming&nbsp;soon)
                          </SelectItem>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>We're translating the app into Spanish. Coming soon!</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SelectItem
                            value="fr"
                            disabled
                            className="opacity-50 cursor-not-allowed"
                          >
                            Français&nbsp;(coming&nbsp;soon)
                          </SelectItem>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>We're translating the app into French. Coming soon!</p>
                        </TooltipContent>
                      </Tooltip>
                    </SelectContent>
                  </Select>
                </TooltipProvider>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Email Preferences</CardTitle>
            <CardDescription>
              Manage your email notification settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Switch
                  id="email-notifications"
                  checked={emailPref?.allow_emails ?? false}
                  onCheckedChange={handleEmailToggle}
                  disabled={emailLoading}
                />
                <Label htmlFor="email-notifications">
                  Receive email notifications
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Get notified about important updates, new assignments, and corrections.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
