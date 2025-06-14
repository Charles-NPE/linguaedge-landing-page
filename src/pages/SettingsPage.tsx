
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useEmailPreferences, updateEmailPreferences } from "@/hooks/useEmailPreferences";
import DashboardLayout from "@/components/dashboards/DashboardLayout";
import { BackToDashboard } from "@/components/common/BackToDashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/contexts/ThemeContext";

const SettingsPage: React.FC = () => {
  const { user, profile } = useAuth();
  const { theme, setTheme } = useTheme();
  const { data: emailPrefs, isLoading: emailPrefsLoading } = useEmailPreferences(user?.id);

  // Settings state
  const [notificationEmails, setNotificationEmails] = useState(true);
  const [dashboardNotifications, setDashboardNotifications] = useState(true);
  const [dashboardDensity, setDashboardDensity] = useState<"comfortable" | "compact">("comfortable");

  // Load settings from database
  useEffect(() => {
    if (emailPrefs) {
      setNotificationEmails(emailPrefs.allow_emails);
      setDashboardNotifications(emailPrefs.allow_in_app);
    }
  }, [emailPrefs]);

  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;
      
      try {
        const { data } = await supabase
          .from("user_settings")
          .select("dashboard_density")
          .eq("user_id", user.id)
          .single();
          
        if (data) {
          setDashboardDensity(data.dashboard_density as "comfortable" | "compact");
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };
    
    loadSettings();
  }, [user]);

  const handleSaveNotificationSettings = async () => {
    if (!user) return;
    
    try {
      await updateEmailPreferences(user.id, notificationEmails, dashboardNotifications);
      toast({
        title: "Settings saved",
        description: "Your notification preferences have been updated."
      });
    } catch (error) {
      console.error("Error saving notification settings:", error);
      toast({
        title: "Error",
        description: "Failed to save notification settings.",
        variant: "destructive"
      });
    }
  };

  const handleSaveGeneralSettings = async () => {
    if (!user) return;
    
    try {
      await supabase
        .from("user_settings")
        .upsert({
          user_id: user.id,
          dashboard_density: dashboardDensity,
          theme,
          updated_at: new Date().toISOString()
        });
        
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated."
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings.",
        variant: "destructive"
      });
    }
  };

  if (emailPrefsLoading) {
    return (
      <DashboardLayout title="Settings">
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Settings">
      <div className="max-w-2xl mx-auto space-y-6">
        <BackToDashboard />
        
        {/* Notifications Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Manage how and when you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={notificationEmails}
                onCheckedChange={setNotificationEmails}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dashboard-notifications">Dashboard notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Show notifications in the app dashboard
                </p>
              </div>
              <Switch
                id="dashboard-notifications"
                checked={dashboardNotifications}
                onCheckedChange={setDashboardNotifications}
              />
            </div>
            
            <Button onClick={handleSaveNotificationSettings} className="w-full">
              Save Notification Settings
            </Button>
          </CardContent>
        </Card>

        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General</CardTitle>
            <CardDescription>
              Customize your app experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger>
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="density">Dashboard density</Label>
              <Select value={dashboardDensity} onValueChange={(value: "comfortable" | "compact") => setDashboardDensity(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select density" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comfortable">Comfortable</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button onClick={handleSaveGeneralSettings} className="w-full">
              Save General Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
