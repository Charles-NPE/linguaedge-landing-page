
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { PricingCard, PricingPlan } from "@/components/pricing/PricingCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const teacherPlans: PricingPlan[] = [
  {
    name: "Starter",
    price: "€20",
    period: "per month",
    description: "Perfect for small language schools just starting out.",
    priceId: import.meta.env.VITE_STARTER_PRICE_ID || "",
    features: [
      "Up to 20 students",
      "1 teacher account",
      "Basic analytics dashboard",
      "Email support"
    ],
    userRole: "teacher",
  },
  {
    name: "Academy",
    price: "€50",
    period: "per month",
    description: "For growing language academies with more needs.",
    priceId: "price_academy", // Replace with actual price ID
    features: [
      "Up to 60 students",
      "3 teacher accounts",
      "Enhanced analytics dashboard", 
      "Priority email support",
      "Student performance insights"
    ],
    popular: true,
    userRole: "teacher",
  },
  {
    name: "Enterprise",
    price: "€99",
    period: "per month",
    description: "For large language schools with advanced requirements.",
    priceId: "price_enterprise", // Replace with actual price ID
    features: [
      "Unlimited students",
      "Unlimited teacher accounts",
      "Advanced analytics dashboard", 
      "Dedicated support",
      "Custom essay prompts",
      "White-label option"
    ],
    userRole: "teacher",
  }
];

const studentPlans: PricingPlan[] = [
  {
    name: "Basic",
    price: "Free",
    period: "forever",
    description: "Get started with basic language learning.",
    priceId: "price_free",
    features: [
      "5 essay checks per month",
      "Basic feedback",
      "Grammar correction",
      "Community forum access"
    ],
    userRole: "student",
  },
  {
    name: "Advanced",
    price: "€8",
    period: "per month",
    description: "Enhance your language learning journey.",
    priceId: "price_student_advanced", // Replace with actual price ID
    features: [
      "Unlimited essay checks",
      "Detailed feedback",
      "Grammar and style correction",
      "Vocabulary suggestions",
      "Progress tracking"
    ],
    popular: true,
    userRole: "student",
  }
];

const PricingPage: React.FC = () => {
  const { user, profile } = useAuth();
  const { subscribed, subscriptionTier, isLoading, checkSubscription } = useSubscription();
  const [activeTab, setActiveTab] = useState<string>("teacher");
  
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
  }, [user]);
  
  // Determine plans to show based on active tab
  const plans = activeTab === "teacher" ? teacherPlans : studentPlans;
  
  // Find current plan
  const currentPlan = plans.find(plan => plan.name === subscriptionTier);
  
  return (
    <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto mb-16 max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Straightforward Pricing
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Choose the plan that fits your needs. All plans include a 14-day free trial.
        </p>
        
        {!user && (
          <div className="mt-6">
            <Button asChild>
              <Link to="/login">Sign in to get started</Link>
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
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {plans.map((plan) => (
          <PricingCard
            key={plan.name}
            plan={plan}
            isCurrentPlan={subscribed && plan.name === subscriptionTier}
          />
        ))}
      </div>
    </div>
  );
};

export default PricingPage;
