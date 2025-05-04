
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Subscription {
  subscribed: boolean;
  subscriptionTier: string | null;
  subscriptionEnd: string | null;
  isLoading: boolean;
}

interface SubscriptionContextType extends Subscription {
  isCheckingSubscription: boolean;
  checkSubscription: () => Promise<void>;
  startCheckout: (priceId: string, userRole: string, returnUrl?: string) => Promise<void>;
  openCustomerPortal: (returnUrl?: string) => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, session, profile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<string | null>(null);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);

  // Check subscription status when user changes
  useEffect(() => {
    if (user) {
      checkSubscription();
    } else {
      setSubscribed(false);
      setSubscriptionTier(null);
      setSubscriptionEnd(null);
      setIsLoading(false);
    }
  }, [user]);

  // Update subscription status when profile changes
  useEffect(() => {
    if (profile) {
      const hasActiveSubscription = 
        profile.stripe_status === 'active' || 
        profile.stripe_status === 'trialing';
      
      setSubscribed(hasActiveSubscription);
      setSubscriptionTier(profile.stripe_plan);
    }
  }, [profile]);

  // Check URL params for checkout status
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const checkoutStatus = searchParams.get("checkout");
    
    if (checkoutStatus === "success") {
      toast({
        title: "Subscription success!",
        description: "Your subscription has been processed successfully.",
      });
      // Remove the query param
      navigate(window.location.pathname, { replace: true });
      // Check subscription status after successful checkout
      if (user) {
        checkSubscription();
      }
    } else if (checkoutStatus === "canceled") {
      toast({
        title: "Checkout canceled",
        description: "You've canceled the checkout process.",
        variant: "destructive",
      });
      // Remove the query param
      navigate(window.location.pathname, { replace: true });
    }
  }, [navigate]);

  const checkSubscription = async () => {
    if (!user || !session?.access_token) return;
    
    try {
      setIsCheckingSubscription(true);
      
      // Instead of calling an edge function, check the profile directly
      if (profile) {
        const hasActiveSubscription = 
          profile.stripe_status === 'active' || 
          profile.stripe_status === 'trialing';
        
        setSubscribed(hasActiveSubscription);
        setSubscriptionTier(profile.stripe_plan);
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
      toast({
        title: "Subscription check failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsCheckingSubscription(false);
    }
  };

  const startCheckout = async (priceId: string, userRole: string, returnUrl = "/") => {
    if (!user || !session?.access_token) {
      toast({
        title: "Authentication required",
        description: "Please log in to subscribe.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId, userRole, returnUrl },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      
      if (error) throw error;
      if (!data?.url) throw new Error("No checkout URL returned");
      
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const openCustomerPortal = async (returnUrl = "/") => {
    if (!user || !session?.access_token) {
      toast({
        title: "Authentication required",
        description: "Please log in to manage your subscription.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal", {
        body: { returnUrl },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      
      if (error) throw error;
      if (!data?.url) throw new Error("No portal URL returned");
      
      // Redirect to Stripe Customer Portal
      window.location.href = data.url;
    } catch (error) {
      console.error("Customer portal error:", error);
      toast({
        title: "Failed to open customer portal",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscribed,
        subscriptionTier,
        subscriptionEnd,
        isLoading,
        isCheckingSubscription,
        checkSubscription,
        startCheckout,
        openCustomerPortal,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
};
