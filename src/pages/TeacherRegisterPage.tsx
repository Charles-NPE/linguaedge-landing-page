
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UserRole } from "@/types/auth.types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { getStripeConfig } from "@/integrations/stripe/config";

const registerSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters." }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const TeacherRegisterPage: React.FC = () => {
  const { signUp, user, isLoading } = useAuth();
  const { startCheckout } = useSubscription();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const planParam = searchParams.get('plan');
  
  // Determine the price ID based on the plan parameter
  const getPriceIdForPlan = (plan: string | null): string => {
    const { starterPriceId, academyPriceId } = getStripeConfig();
    
    switch (plan?.toLowerCase()) {
      case 'academy':
        return academyPriceId;
      case 'starter':
      default:
        return starterPriceId;
    }
  };

  // Redirect if already logged in
  useEffect(() => {
    if (user && !registrationComplete) {
      navigate('/teacher');
    }
  }, [user, navigate, registrationComplete]);

  // Handle redirect to checkout after successful registration
  useEffect(() => {
    if (registrationComplete && user && planParam) {
      const priceId = getPriceIdForPlan(planParam);
      startCheckout(priceId, 'teacher', '/teacher');
    }
  }, [registrationComplete, user, planParam, startCheckout]);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    try {
      // Sign up the user with the teacher role
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: { role: 'teacher' }
        }
      });
      
      if (error) throw error;
      
      // If signup successful, create profile record
      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          role: 'teacher',
          email: values.email
        });
        
        if (profileError) {
          console.error("Error creating profile:", profileError);
          toast({
            title: "Profile Creation Error",
            description: "Your account was created but there was an issue setting up your profile.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Registration Successful",
            description: "Your teacher account has been created.",
          });
          
          // Set registration complete flag to trigger checkout redirection
          setRegistrationComplete(true);
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-500/10 via-transparent to-violet-500/10 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Create a Teacher Account
          </CardTitle>
          <CardDescription className="text-center">
            Join LinguaEdgeAI as a teacher to help students improve their language skills
            {planParam && (
              <>
                <br />
                <span className="font-medium text-primary">Selected plan: {planParam.charAt(0).toUpperCase() + planParam.slice(1)}</span>
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="email@example.com" 
                        type="email" 
                        disabled={isLoading} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="••••••••" 
                        type="password" 
                        disabled={isLoading} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="••••••••" 
                        type="password" 
                        disabled={isLoading} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-white" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    Creating account...
                  </span>
                ) : (
                  "Register"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col">
          <p className="mt-2 text-sm text-center text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TeacherRegisterPage;
