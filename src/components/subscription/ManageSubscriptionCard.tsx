
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { CalendarIcon, CreditCard, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const ManageSubscriptionCard: React.FC = () => {
  const { 
    subscribed, 
    subscriptionTier, 
    subscriptionEnd, 
    isCheckingSubscription, 
    checkSubscription, 
    openCustomerPortal 
  } = useSubscription();

  // Format subscription end date as relative time
  const formattedEndDate = subscriptionEnd ? 
    formatDistanceToNow(new Date(subscriptionEnd), { addSuffix: true }) : 
    null;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/50">
        <CardTitle className="text-lg font-medium">
          {subscribed ? "Current Subscription" : "No Active Subscription"}
        </CardTitle>
        <CardDescription>
          {subscribed 
            ? "Manage your subscription details" 
            : "Subscribe to access premium features"}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {subscribed ? (
          <div className="space-y-4">
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium text-muted-foreground">Plan</span>
              <span className="font-medium">{subscriptionTier}</span>
            </div>
            {subscriptionEnd && (
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Renews</span>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span>{formattedEndDate}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Subscribe to a plan to unlock premium features and support.
          </p>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => checkSubscription()} 
          disabled={isCheckingSubscription}
          className="flex items-center gap-1"
        >
          <RefreshCw className={`h-4 w-4 ${isCheckingSubscription ? "animate-spin" : ""}`} />
          <span>Refresh Status</span>
        </Button>
        {subscribed ? (
          <Button 
            size="sm" 
            variant="default" 
            onClick={() => openCustomerPortal()}
            className="flex items-center gap-1"
          >
            <CreditCard className="h-4 w-4" />
            <span>Manage Subscription</span>
          </Button>
        ) : (
          <Button 
            size="sm" 
            variant="default" 
            asChild
          >
            <a href="/pricing">View Plans</a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ManageSubscriptionCard;
