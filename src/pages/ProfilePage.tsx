
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const formSchema = z.object({
  academyName: z.string().min(2, "Academy name is required"),
  adminName: z.string().min(2, "Admin name is required"),
  contactEmail: z.string().email().optional(),
  phone: z.string().optional(),
  website: z
    .string()
    .optional()
    .transform(val => {
      if (!val) return "";                 // keep empty
      if (!/^https?:\/\//i.test(val)) {    // add scheme when missing
        return `https://${val}`;
      }
      return val;
    })
    .refine(
      val =>
        val === "" ||
        /^https?:\/\/[^\s$.?#].[^\s]*$/i.test(val),
      { message: "Please enter a valid URL" }
    ),
  country: z.string().min(1, "Country is required"),
  timezone: z.string().min(1, "Timezone is required"),
  defaultLanguage: z.string().min(1, "Language is required")
});

type ProfileFormValues = z.infer<typeof formSchema>;

const ProfilePage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedLogo, setUploadedLogo] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  
  const userRole = user?.role || 'student';
  const dashboardPath = userRole === 'teacher' ? "/teacher" : "/student";

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      academyName: "",
      adminName: "",
      contactEmail: user?.email || "",
      phone: "",
      website: "",
      country: "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      defaultLanguage: "en"
    }
  });

  // Detect timezone
  useEffect(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    form.setValue("timezone", timezone);
  }, [form]);

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.id) return;
      setIsLoading(true);
      
      try {
        // Select all columns from academy_profiles table
        const { data, error } = await supabase
          .from('academy_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        
        if (data) {
          // Populate the form with ALL retrieved data
          form.reset({
            academyName: data.academy_name || "",
            adminName: data.admin_name || "",
            contactEmail: user.email || "",
            phone: data.phone || "",
            website: data.website || "",
            country: data.country || "",
            timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
            defaultLanguage: data.default_language || "en"
          });
          
          setProfileId(data.id);
          setUploadedLogo(data.logo_url || null);
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

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Logo must be less than 5MB",
        variant: "destructive"
      });
      return;
    }
    setLogoFile(file);
    setUploadedLogo(URL.createObjectURL(file));
  };

  const uploadLogo = async () => {
    if (!logoFile || !user?.id) return null;
    setIsUploading(true);
    try {
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      // Check if the logos bucket exists, create it if it doesn't
      const { data: bucketData, error: bucketError } = await supabase
        .storage
        .getBucket('logos');
      
      if (bucketError && bucketError.message.includes('does not exist')) {
        // Create the bucket if it doesn't exist
        await supabase.storage.createBucket('logos', {
          public: true
        });
      }

      const { error: uploadError, data } = await supabase.storage
        .from("logos")
        .upload(fileName, logoFile);
        
      if (uploadError) {
        throw uploadError;
      }
      
      const { data: publicUrlData } = supabase.storage
        .from("logos")
        .getPublicUrl(fileName);
        
      return publicUrlData.publicUrl;
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast({
        title: "Upload failed",
        description: "Could not upload logo. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      // Upload logo if changed
      let logoUrl = uploadedLogo;
      if (logoFile) {
        logoUrl = await uploadLogo();
      }
      
      // Prepare data for upsert
      const upsertData = {
        id: profileId || undefined, // Use existing ID if available
        user_id: user.id,
        academy_name: values.academyName,
        admin_name: values.adminName,
        phone: values.phone || null,
        website: values.website || null,
        country: values.country,
        timezone: values.timezone,
        default_language: values.defaultLanguage,
        logo_url: logoUrl,
        updated_at: new Date().toISOString()
      };

      // Perform upsert operation
      const { error } = await supabase
        .from('academy_profiles')
        .upsert(upsertData, {
          onConflict: 'user_id'
        });

      if (error) {
        toast({
          title: "Update failed",
          description: `Error: ${error.message}`,
          variant: "destructive"
        });
        console.error("Supabase error:", error);
        return;
      }
      
      toast({
        title: "Profile updated",
        description: "Your academy profile has been updated successfully."
      });

      // Refresh updated_at timestamp
      setUpdatedAt(new Date().toISOString());
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
      <h1 className="text-3xl font-bold mb-6">Academy Profile</h1>
      
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
              <CardTitle>Academy Information</CardTitle>
              <CardDescription>
                Manage your academy details and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/2">
                  <FormField control={form.control} name="academyName" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Academy Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter academy name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                </div>
                
                <div className="w-full md:w-1/2">
                  <FormField control={form.control} name="adminName" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Admin Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter administrator name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/2">
                  <FormField control={form.control} name="contactEmail" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Contact Email</FormLabel>
                        <FormControl>
                          <Input readOnly {...field} />
                        </FormControl>
                        <FormDescription>Email from your account</FormDescription>
                      </FormItem>} />
                </div>
                
                <div className="w-full md:w-1/2">
                  <FormField control={form.control} name="phone" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Phone (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter contact phone number" {...field} />
                        </FormControl>
                      </FormItem>} />
                </div>
              </div>
              
              <FormField control={form.control} name="website" render={({
              field
            }) => <FormItem>
                    <FormLabel>Website (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="example.com or https://example.com" {...field} />
                    </FormControl>
                    <FormDescription>Enter domain name or full URL</FormDescription>
                    <FormMessage />
                  </FormItem>} />
              
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3">
                  <FormField control={form.control} name="country" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Country *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="US">United States</SelectItem>
                            <SelectItem value="ES">Spain</SelectItem>
                            <SelectItem value="FR">France</SelectItem>
                            <SelectItem value="GB">United Kingdom</SelectItem>
                            <SelectItem value="DE">Germany</SelectItem>
                            <SelectItem value="IT">Italy</SelectItem>
                            <SelectItem value="CA">Canada</SelectItem>
                            <SelectItem value="MX">Mexico</SelectItem>
                            <SelectItem value="AR">Argentina</SelectItem>
                            <SelectItem value="CO">Colombia</SelectItem>
                            <SelectItem value="PE">Peru</SelectItem>
                            <SelectItem value="CL">Chile</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>} />
                </div>
                
                <div className="w-full md:w-1/3">
                  <FormField control={form.control} name="timezone" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Time Zone *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select time zone" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="America/New_York">Eastern Time (US & Canada)</SelectItem>
                            <SelectItem value="America/Chicago">Central Time (US & Canada)</SelectItem>
                            <SelectItem value="America/Denver">Mountain Time (US & Canada)</SelectItem>
                            <SelectItem value="America/Los_Angeles">Pacific Time (US & Canada)</SelectItem>
                            <SelectItem value="Europe/London">London</SelectItem>
                            <SelectItem value="Europe/Paris">Paris</SelectItem>
                            <SelectItem value="Europe/Madrid">Madrid</SelectItem>
                            <SelectItem value="Europe/Berlin">Berlin</SelectItem>
                            <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                            <SelectItem value="Asia/Shanghai">Shanghai</SelectItem>
                            <SelectItem value="Australia/Sydney">Sydney</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>} />
                </div>
                
                <div className="w-full md:w-1/3">
                  <FormField control={form.control} name="defaultLanguage" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Default Language *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es" disabled>Spanish (Coming soon)</SelectItem>
                            <SelectItem value="fr" disabled>French (Coming soon)</SelectItem>
                            <SelectItem value="de" disabled>German (Coming soon)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>} />
                </div>
              </div>
              
              <div className="space-y-3">
                <FormLabel>Academy Logo (optional)</FormLabel>
                <div className="flex items-center gap-6">
                  <div className="h-24 w-24 rounded-lg overflow-hidden border flex items-center justify-center bg-gray-50">
                    {uploadedLogo ? <img src={uploadedLogo} alt="Academy Logo" className="h-full w-full object-cover" /> : <div className="text-gray-400 text-xs text-center p-2">
                        No logo uploaded
                      </div>}
                  </div>
                  <div>
                    <Button type="button" variant="outline" onClick={() => document.getElementById("logo-upload")?.click()} className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Upload Logo
                    </Button>
                    <input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                    <p className="text-xs text-muted-foreground mt-2">
                      Max size: 5MB. Recommended: 400x400px
                    </p>
                  </div>
                </div>
              </div>
              
              {(createdAt || updatedAt) && <div className="flex gap-6 text-xs text-muted-foreground">
                  {createdAt && <div>Created: {new Date(createdAt).toLocaleDateString()}</div>}
                  {updatedAt && <div>Last updated: {new Date(updatedAt).toLocaleDateString()}</div>}
                </div>}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => form.reset()}>
                Reset
              </Button>
              <Button type="submit" disabled={isLoading || isUploading || form.formState.isSubmitting}>
                {(isLoading || isUploading || form.formState.isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
};

export default ProfilePage;
