
// @ts-nocheck
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Profile } from "@/types/profile.types";

const formSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email(),
  phone: z.string().optional()
});

type ProfileFormValues = z.infer<typeof formSchema>;

const StudentProfileForm: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [wasIncomplete, setWasIncomplete] = useState(false);
  const userRole = 'student';
  const dashboardPath = "/student";

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: user?.email || "",
      phone: ""
    }
  });

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.id) return;
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id as unknown as string)
          .maybeSingle();

        if (error) throw error;
        
        if (data) {
          const incomplete = !data.full_name?.trim();
          setWasIncomplete(incomplete);
          
          form.reset({
            fullName: data.full_name || "",
            email: user.email || "",
            phone: data.phone || ""
          });
          
          setCreatedAt(data.created_at);
          setUpdatedAt(data.updated_at);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error loading profile",
          description: error instanceof Error ? error.message : "Unknown error occurred",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfileData();
  }, [user, form, toast]);

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user?.id) return;
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: values.fullName,
          phone: values.phone || null,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', user.id as any);

      if (error) {
        toast({
          title: "Update failed",
          description: `Error: ${error.message}`,
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });

      // Refresh updated_at timestamp
      setUpdatedAt(new Date().toISOString());
      
      // If profile was incomplete and now has a name, redirect to dashboard
      if (wasIncomplete && values.fullName.trim()) {
        toast({
          title: "Profile completed — thanks!",
          description: "Welcome to your dashboard!"
        });
        navigate('/student');
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-6">Student Profile</h1>
      
      {/* Back button */}
      <div className="mb-6">
        <Link to={dashboardPath}>
          <Button variant="outline" className="gap-2">
            <ArrowLeft size={16} />
            Back to Dashboard
          </Button>
        </Link>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Manage your personal details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input readOnly {...field} />
                    </FormControl>
                    <FormDescription>Email from your account</FormDescription>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter contact phone number" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {(createdAt || updatedAt) && (
                <div className="flex gap-6 text-xs text-muted-foreground">
                  {createdAt && <div>Created: {new Date(createdAt).toLocaleDateString()}</div>}
                  {updatedAt && <div>Last updated: {new Date(updatedAt).toLocaleDateString()}</div>}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => form.reset()}>
                Reset
              </Button>
              <Button type="submit" disabled={isLoading || form.formState.isSubmitting}>
                {(isLoading || form.formState.isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
};

export default StudentProfileForm;
