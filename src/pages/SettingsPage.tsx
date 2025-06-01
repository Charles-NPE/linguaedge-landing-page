
// @ts-nocheck
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Globe, LayoutDashboard, Bell } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import DashboardLayout from "@/components/dashboards/DashboardLayout";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useEmailPreferences, updateEmailPreferences } from "@/hooks/useEmailPreferences";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

type ThemeType = "light" | "dark";
type DensityType = "comfortable" | "compact";
type LanguageType = "en" | "es" | "fr";

type UserSettings = {
  theme: ThemeType;
  dashboard_density: DensityType;
  language: LanguageType;
  notification_emails: boolean;
};

const SettingsPage = () => {
  const { user, profile } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  
  const userRole = profile?.role || 'student';
  const dashboardPath = userRole === 'teacher' ? "/teacher" : "/student";
  
  // Load email preferences
  const { data: emailPreferences, isLoading: emailPrefsLoading } = useEmailPreferences(user?.id);
  
  const form = useForm<UserSettings>({
    defaultValues: {
      theme: "light",
      dashboard_density: "comfortable",
      language: "en",
      notification_emails: true
    }
  });

  const { setValue, watch } = form;

  // Load user settings
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("user_settings")
          .select("*")
          .eq("user_id", user.id)
          .single();
          
        if (error) {
          console.error("Error fetching settings:", error);
          return;
        }
        
        if (data) {
          // Use type assertion to ensure the values match the expected string literal types
          const themeValue = (data.theme || "light") as ThemeType;
          const densityValue = (data.dashboard_density || "comfortable") as DensityType;
          const languageValue = (data.language || "en") as LanguageType;
          
          form.reset({
            theme: themeValue,
            dashboard_density: densityValue,
            language: languageValue,
            notification_emails: data.notification_emails !== null ? data.notification_emails : true
          });
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, [user, form]);

  // Save settings when they change
  const saveSettings = async (field: string, value: any) => {
    if (!user) return;
    
    // Guard against saving unsupported languages
    if (field === "language" && value !== "en") {
      return;
    }
    
    try {
      const settings = {
        user_id: user.id,
        [field]: value,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from("user_settings")
        .upsert(settings, { onConflict: "user_id" });
        
      if (error) {
        toast({
          title: "Failed to save settings",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      
      // Don't show toast for theme changes to avoid too many notifications
      if (field !== "theme") {
        toast({
          title: "Settings updated",
          description: "Your preferences have been saved."
        });
      }
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  // Handle theme change
  const handleThemeChange = async (checked: boolean) => {
    const newTheme = checked ? "dark" : "light" as ThemeType;
    setValue("theme", newTheme);
    await setTheme(newTheme);
    await saveSettings("theme", newTheme);
  };

  // Handle email preferences change
  const handleEmailPreferencesChange = async (checked: boolean) => {
    if (!user) return;
    
    try {
      await updateEmailPreferences(user.id, checked);
      queryClient.invalidateQueries({ queryKey: ['emailPreferences', user.id] });
      toast({
        title: "Email preferences updated",
        description: "Your email notification preferences have been saved."
      });
    } catch (error) {
      console.error("Error updating email preferences:", error);
      toast({
        title: "Failed to update preferences",
        description: "There was an error saving your email preferences.",
        variant: "destructive"
      });
    }
  };

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
        <Card className="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100 mb-6">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Theme Settings</CardTitle>
            <CardDescription className="dark:text-slate-300">
              Customize the appearance of the application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Dark Mode</p>
                <p className="text-sm text-muted-foreground dark:text-slate-300">
                  Switch between light and dark theme
                </p>
              </div>
              <Switch 
                checked={watch("theme") === "dark"}
                onCheckedChange={handleThemeChange}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Interface Settings */}
        <Card className="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100 mb-6">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Interface Settings</CardTitle>
            <CardDescription className="dark:text-slate-300">
              Customize your dashboard experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <LayoutDashboard className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                <h3 className="font-medium text-slate-900 dark:text-white">Dashboard Density</h3>
              </div>
              <Select 
                value={watch("dashboard_density")} 
                onValueChange={(value) => {
                  setValue("dashboard_density", value as DensityType);
                  saveSettings("dashboard_density", value);
                }}
              >
                <SelectTrigger className="w-full sm:w-[240px]">
                  <SelectValue placeholder="Select density" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comfortable">Comfortable</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground dark:text-slate-400">
                Choose how dense you want the dashboard layout to be
              </p>
            </div>
            
            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                <h3 className="font-medium text-slate-900 dark:text-white">Language</h3>
              </div>
              <Select 
                value={watch("language")} 
                onValueChange={(value) => {
                  if (value === "en") {
                    setValue("language", value as LanguageType);
                    saveSettings("language", value);
                  }
                }}
              >
                <SelectTrigger className="w-full sm:w-[240px]">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es" disabled className="opacity-50 cursor-not-allowed">
                    Español (coming soon)
                  </SelectItem>
                  <SelectItem value="fr" disabled className="opacity-50 cursor-not-allowed">
                    Français (coming soon)
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground dark:text-slate-400">
                Select your preferred language for the interface
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Email Preferences */}
        <Card className="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Email Preferences</CardTitle>
            <CardDescription className="dark:text-slate-300">
              Manage how and when we contact you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Bell className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  <p className="font-medium text-slate-900 dark:text-white">Email Notifications</p>
                </div>
                <p className="text-sm text-muted-foreground dark:text-slate-300">
                  Receive updates about new features, assignment reminders and account activity
                </p>
              </div>
              {emailPrefsLoading ? (
                <Skeleton className="h-6 w-11 rounded-full" />
              ) : (
                <Switch 
                  checked={emailPreferences?.allow_emails ?? true}
                  onCheckedChange={handleEmailPreferencesChange}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
