
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const SettingsPage = () => {
  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>
            Manage your account preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Settings page content will be added here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
