
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/dashboards/DashboardLayout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const BillingPage = () => {
  const { profile } = useAuth();
  const userRole = profile?.role || 'student';
  const dashboardPath = userRole === 'teacher' ? "/teacher" : "/student";
  
  return (
    <DashboardLayout title="Billing">
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
        
        <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">Billing</h1>
        
        <Card className="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Subscription Management</CardTitle>
            <CardDescription className="dark:text-slate-300">
              Manage your subscription and billing details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="dark:text-slate-300">Billing page content will be added here.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default BillingPage;
