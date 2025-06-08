
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck, ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

type FormData = z.infer<typeof formSchema>;

const TeacherRegisterPage: React.FC = () => {
  const { signUp, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [plan, setPlan] = useState<string>("starter");
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // Extract plan from URL search params
  useEffect(() => {
    const planParam = searchParams.get('plan');
    if (planParam && (planParam === 'starter' || planParam === 'academy')) {
      setPlan(planParam);
    }
  }, [searchParams]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsRedirecting(true);
      
      // Sign up user
      await signUp(data.email, data.password, "teacher");
      
      toast({
        title: "Account created",
        description: "Your teacher account has been created successfully.",
      });

      // Determine price ID based on plan
      const priceId = plan === 'starter' ? "STARTER_PRICE_ID" : "ACADEMY_PRICE_ID";
      
      console.log("Creating checkout with price ID:", priceId);
      
      // Call create-checkout edge function
      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
      });
      
      if (checkoutError || !checkoutData?.url) {
        console.error("Checkout error:", checkoutError || "No checkout URL returned");
        throw checkoutError || new Error("No checkout URL returned");
      }
      
      console.log("Redirecting to Stripe Checkout:", checkoutData.url);
      
      // Redirect to Stripe Checkout
      window.location.href = checkoutData.url;
      
    } catch (error) {
      setIsRedirecting(false);
      console.error("Sign up or checkout error:", error);
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An error occurred during registration.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-500/10 via-transparent to-violet-500/10 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <UserCheck className="h-6 w-6" />
            Register as Teacher
            {plan && (
              <Badge variant="outline" className="ml-2">
                {plan === 'starter' ? 'Starter' : 'Academy'} Plan
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Create a teacher account and start managing your language academy.
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
                      <Input placeholder="teacher@example.com" autoComplete="email" {...field} />
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
                      <Input type="password" autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading || isRedirecting}>
                {isLoading || isRedirecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isLoading ? "Creating account..." : "Redirecting to payment..."}
                  </>
                ) : (
                  "Create Teacher Account"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Log in
            </Link>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500"
            onClick={() => navigate('/signup')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to signup options
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TeacherRegisterPage;
