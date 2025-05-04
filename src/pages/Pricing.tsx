
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from '@/components/ui/alert';

const plans = [
  {
    name: "Starter",
    price: "€20",
    period: "per academy / month",
    description: "Perfect for small language schools just starting out.",
    features: [
      "Up to 20 students",
      "1 teacher",
      "Analytics dashboard",
      "Email support"
    ],
    cta: "Get started",
    priceId: "STARTER_PRICE_ID",
    popular: false,
  },
  {
    name: "Academy",
    price: "€50",
    period: "per academy / month",
    description: "For growing language academies with more needs.",
    features: [
      "Up to 60 students",
      "3 teachers",
      "Analytics dashboard", 
      "Email support"
    ],
    cta: "Get started",
    priceId: "ACADEMY_PRICE_ID",
    popular: true,
  }
];

const Pricing = () => {
  const { user, profile, isTeacher, isStudent, isSubscriptionActive, checkSubscription, session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});
  const [showInactiveAlert, setShowInactiveAlert] = useState(false);

  // Check if there's a subscription inactive flag in the URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('subscription') === 'inactive') {
      setShowInactiveAlert(true);
    }

    // Check subscription status when the component mounts
    if (user && isTeacher) {
      checkSubscription();
    }
  }, [location, user, isTeacher, checkSubscription]);

  const handleGetStarted = async (priceId: string, planName: string) => {
    try {
      // If user is not logged in, redirect to signup with plan parameter
      if (!user) {
        const planParam = priceId === "STARTER_PRICE_ID" ? "starter" : "academy";
        navigate(`/signup/teacher?plan=${planParam}`);
        return;
      }

      // For students, always redirect to student dashboard
      if (isStudent) {
        navigate('/student');
        return;
      }

      // For teachers with active subscriptions, go directly to dashboard
      if (isTeacher && isSubscriptionActive) {
        navigate('/teacher');
        return;
      }

      // For teachers without active subscriptions, start checkout
      if (isTeacher && !isSubscriptionActive) {
        // Set loading state for this specific button
        setIsLoading(prev => ({ ...prev, [priceId]: true }));

        // Call the create-checkout Supabase Edge Function
        const { data, error } = await supabase.functions.invoke('create-checkout', {
          body: { priceId },
        });

        if (error) {
          throw error;
        }

        if (data?.url) {
          // Redirect to Stripe Checkout
          window.location.href = data.url;
        } else {
          throw new Error('No checkout URL returned');
        }
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: 'Checkout Error',
        description: 'There was a problem starting the checkout process. Please try again.',
        variant: 'destructive',
      });
    } finally {
      // Reset loading state
      setIsLoading(prev => ({ ...prev, [priceId]: false }));
    }
  };

  // Hide the pricing details for students
  if (isStudent) {
    navigate('/student');
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="py-20 pt-32 bg-gray-50">
        <div className="container mx-auto px-6">
          {showInactiveAlert && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>
                Your subscription is inactive. Please update your payment to regain access.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Plans & Pricing
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Transparent pricing for language academies. All plans include a <strong>30-day</strong> free trial.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan, index) => (
              <div 
                key={index} 
                className={`bg-white rounded-xl shadow-lg overflow-hidden card-hover relative ${
                  plan.popular ? 'ring-2 ring-indigo-500' : ''
                }`}
              >
                <div className="absolute top-4 right-4">
                  <Badge variant="default" className="bg-violet-500">30 days free</Badge>
                </div>
                
                <div className="p-8">
                  <h3 className="text-xl font-bold mb-2 text-gray-900">{plan.name}</h3>
                  <div className="flex items-end mb-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 ml-1">{plan.period}</span>
                  </div>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  
                  <ul className="mb-8 space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <Check className="h-5 w-5 text-indigo-500 mr-2 shrink-0 mt-0.5" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    onClick={() => handleGetStarted(plan.priceId, plan.name)}
                    disabled={isLoading[plan.priceId]}
                    className={`w-full ${plan.popular ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {isLoading[plan.priceId] ? 'Processing...' : (
                      !session 
                        ? 'Sign up & Pay'
                        : isTeacher && !profile?.stripe_status?.match(/active|trialing/)
                          ? 'Choose & Pay'
                          : 'Go to Dashboard'
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Pricing;

