
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const BillingPage = () => {
  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-6">Billing</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Subscription Management</CardTitle>
          <CardDescription>
            Manage your subscription and billing details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Billing page content will be added here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingPage;
