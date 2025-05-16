import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/dashboards/DashboardLayout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/lib/toastShim";

const BillingPage = () => {
  const { profile, user } = useAuth();
  const userRole = profile?.role || 'student';
  const dashboardPath = userRole === 'teacher' ? "/teacher" : "/student";
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  useEffect(() => {
    const redirectToStripePortal = async () => {
      if (!user?.id || userRole !== 'teacher') return;
      
      try {
        setIsRedirecting(true);
        
        // Invoke the create-customer-portal edge function - using correct name
        const { data, error } = await supabase.functions.invoke('create-customer-portal');
        
        if (error) {
          console.error('Stripe portal invoke error:', error);
          toast({
            title: "Stripe error",
            description: error.message || "Failed to redirect to subscription management",
            variant: "destructive",
          });
          setIsRedirecting(false);
          return;
        }
        
        if (!data?.url) {
          console.error('No URL returned from create-customer-portal function');
          toast({
            title: "Stripe error",
            description: "Portal URL missing",
            variant: "destructive",
          });
          setIsRedirecting(false);
          return;
        }
        
        // Redirect to Stripe Customer Portal
        window.location.href = data.url;
        
      } catch (error) {
        console.error('Error redirecting to stripe portal:', error);
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
        setIsRedirecting(false);
      }
    };
    
    redirectToStripePortal();
  }, [user, userRole, retryCount]);
  
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setIsRedirecting(true);
  };
  
  if (isRedirecting) {
    return (
      <DashboardLayout title="Billing">
        <div className="container max-w-4xl py-6 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 size={40} className="animate-spin text-primary" />
            <h2 className="text-xl font-semibold">Redirecting to Stripe Customer Portal...</h2>
            <p className="text-muted-foreground">You'll be able to manage your subscription, update payment details, and view invoices.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
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
          <CardContent className="space-y-4">
            <p className="dark:text-slate-300">
              You'll be redirected to the Stripe Customer Portal where you can:
            </p>
            <ul className="list-disc list-inside dark:text-slate-300 space-y-1 ml-4">
              <li>Update your payment method</li>
              <li>View past invoices</li>
              <li>Change your subscription plan</li>
              <li>Cancel your subscription if needed</li>
            </ul>
            
            <div className="pt-4">
              <Button 
                className="w-full sm:w-auto flex items-center justify-center gap-2"
                onClick={handleRetry}
              >
                <CreditCard size={18} />
                Manage Subscription
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default BillingPage;
