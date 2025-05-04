
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  priceId: string;
  popular?: boolean;
  userRole: string;
}

interface PricingCardProps {
  plan: PricingPlan;
  isCurrentPlan?: boolean;
}

export function PricingCard({ plan, isCurrentPlan = false }: PricingCardProps) {
  const { user, profile } = useAuth();
  const { startCheckout, openCustomerPortal } = useSubscription();
  const navigate = useNavigate();
  
  const handleAction = () => {
    // If user is not logged in, redirect to signup with plan parameter
    if (!user) {
      const planParam = plan.name.toLowerCase();
      navigate(`/signup/${plan.userRole}?plan=${planParam}`);
      return;
    }
    
    // For logged in users that don't have an active subscription, start checkout
    if (user && (!profile?.stripe_status || 
        (profile.stripe_status !== 'active' && profile.stripe_status !== 'trialing'))) {
      startCheckout(plan.priceId, plan.userRole);
      return;
    }
    
    // For users with active subscriptions, open customer portal
    if (isCurrentPlan) {
      openCustomerPortal();
    }
  };
  
  // Hide CTA buttons for teachers with active/trialing subscriptions
  const hideButtons = profile?.role === 'teacher' && 
    (profile?.stripe_status === 'active' || profile?.stripe_status === 'trialing');
  
  // Determine button text based on user state
  const buttonText = () => {
    if (!user) return "Get started";
    if (isCurrentPlan) return "Manage Subscription";
    return "Subscribe";
  };
  
  return (
    <Card className={cn(
      "flex flex-col overflow-hidden border bg-white shadow-lg transition-all",
      plan.popular && "border-primary shadow-primary/20",
      isCurrentPlan && "ring-2 ring-primary"
    )}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{plan.name}</CardTitle>
          {plan.popular && (
            <Badge variant="default" className="bg-primary">Popular</Badge>
          )}
          {isCurrentPlan && (
            <Badge variant="outline" className="border-primary text-primary">
              Your Plan
            </Badge>
          )}
        </div>
        <CardDescription className="pt-1.5 text-base">{plan.description}</CardDescription>
      </CardHeader>
      <CardContent className="grid flex-1 gap-4">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold">{plan.price}</span>
          <span className="text-sm text-muted-foreground">{plan.period}</span>
        </div>
        <ul className="grid gap-2.5">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="mt-1 h-4 w-4 shrink-0 text-primary" />
              <span className="text-sm text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="pt-4">
        {!hideButtons && (
          <Button 
            onClick={handleAction}
            className={cn(
              "w-full",
              plan.popular && "bg-primary hover:bg-primary/90"
            )}
          >
            {buttonText()}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
