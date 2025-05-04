
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { PricingCard, PricingPlan } from "@/components/pricing/PricingCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { getStripeConfig } from "@/integrations/stripe/config";

const PricingPage: React.FC = () => {
  const { user, profile } = useAuth();
  const { subscribed, isLoading, checkSubscription } = useSubscription();
  const [activeTab, setActiveTab] = useState<string>("teacher");
  const [searchParams] = useSearchParams();
  const subscriptionError = searchParams.get('error') === 'subscription';
  const { starterPriceId, academyPriceId } = getStripeConfig();

  // Teacher pricing plans
  const teacherPlans: PricingPlan[] = [
    {
      name: "Starter",
      price: "€20",
      period: "per month",
      description: "Perfect for small language schools just starting out.",
      priceId: starterPriceId,
      features: ["Up to 20 students", "1 teacher account", "Basic analytics dashboard", "Email support"],
      userRole: "teacher"
    }, 
    {
      name: "Academy",
      price: "€50",
      period: "per month",
      description: "For growing language academies with more needs.",
      priceId: academyPriceId,
      features: ["Up to 60 students", "3 teacher accounts", "Enhanced analytics dashboard", "Priority email support", "Student performance insights"],
      popular: true,
      userRole: "teacher"
    }
  ];

  // Student pricing plans
  const studentPlans: PricingPlan[] = [
    {
      name: "Basic",
      price: "Free",
      period: "forever",
      description: "Get started with basic language learning.",
      priceId: "price_free",
      features: ["5 essay checks per month", "Basic feedback", "Grammar correction", "Community forum access"],
      userRole: "student"
    }, 
    {
      name: "Advanced",
      price: "€8",
      period: "per month",
      description: "Enhance your language learning journey.",
      priceId: "price_student_advanced",
      features: ["Unlimited essay checks", "Detailed feedback", "Grammar and style correction", "Vocabulary suggestions", "Progress tracking"],
      popular: true,
      userRole: "student"
    }
  ];

  // Set initial tab based on user role
  useEffect(() => {
    if (profile?.role) {
      setActiveTab(profile.role);
    }
  }, [profile?.role]);

  // Check subscription status when component mounts
  useEffect(() => {
    if (user) {
      checkSubscription();
    }
  }, [user, checkSubscription]);

  // Determine plans to show based on active tab
  const plans = activeTab === "teacher" ? teacherPlans : studentPlans;

  // Find current plan
  const currentPlan = profile?.stripe_plan 
    ? plans.find(plan => plan.name.toLowerCase() === profile.stripe_plan?.toLowerCase())
    : null;
  
  // Determine if subscription is active
  const hasActiveSubscription = profile?.stripe_status === 'active' || profile?.stripe_status === 'trialing';
  
  return (
    <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
      {subscriptionError && (
        <Alert variant="destructive" className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Subscription Required</AlertTitle>
          <AlertDescription>
            Your subscription is inactive. Please update your payment to regain access.
          </AlertDescription>
        </Alert>
      )}

      <div className="mx-auto mb-16 max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Straightforward Pricing
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">Choose the plan that fits your needs. All plans include a 30-day free trial.</p>
        
        {!user && (
          <div className="mt-6">
            <Button asChild>
              <Link to="/signup">Sign up to get started</Link>
            </Button>
          </div>
        )}
      </div>
      
      {user && (
        <Tabs 
          defaultValue={activeTab} 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="mx-auto mb-8 w-fit"
        >
          <TabsList>
            <TabsTrigger value="teacher">For Teachers</TabsTrigger>
            <TabsTrigger value="student">For Students</TabsTrigger>
          </TabsList>
        </Tabs>
      )}
      
      <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
        {plans.map(plan => (
          <PricingCard 
            key={plan.name} 
            plan={plan} 
            isCurrentPlan={hasActiveSubscription && plan.name.toLowerCase() === profile?.stripe_plan?.toLowerCase()} 
          />
        ))}
      </div>
    </div>
  );
};

export default PricingPage;
