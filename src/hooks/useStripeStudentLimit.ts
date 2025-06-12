
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const STARTER_PRICE_ID = "price_1RKzjAGULVEx6ff4xe51d6YT";
const ACADEMY_PRICE_ID = "price_1RKzrHGULVEx6ff4JmxatsFu";

export const useStripeStudentLimit = () => {
  const { profile } = useAuth();
  const [studentLimit, setStudentLimit] = useState<number>(20); // Default to starter
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudentLimitFromStripe = async () => {
      if (!profile?.stripe_customer_id) {
        setStudentLimit(20); // Default to starter if no customer
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Call our edge function to get subscription details from Stripe
        const { data, error } = await supabase.functions.invoke('check-subscription');
        
        if (error) {
          console.error("Error checking subscription:", error);
          setStudentLimit(20); // Fallback to starter
          return;
        }

        // Calculate student limit based on subscription tier
        if (data.subscription_tier === 'academy') {
          setStudentLimit(60);
        } else {
          setStudentLimit(20);
        }
        
        console.log("[useStripeStudentLimit] Calculated limit:", {
          subscription_tier: data.subscription_tier,
          studentLimit: data.subscription_tier === 'academy' ? 60 : 20
        });

      } catch (error) {
        console.error("Error fetching student limit from Stripe:", error);
        setStudentLimit(20); // Fallback to starter
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentLimitFromStripe();
  }, [profile?.stripe_customer_id]);

  return { studentLimit, isLoading };
};
