
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';

const SubscriptionBanner: React.FC = () => {
  const { profile } = useAuth();

  // Only show banner for teachers who don't have active or trialing status
  if (
    profile?.role === "teacher" &&
    profile.stripe_status !== "active" &&
    profile.stripe_status !== "trialing"
  ) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Your subscription is inactive. Please update your payment to regain access.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

export default SubscriptionBanner;
