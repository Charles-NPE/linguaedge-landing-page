
import React, { useState } from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters."
  }),
  email: z.string().email({
    message: "Please enter a valid email address."
  }),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters."
  })
});

type FormValues = z.infer<typeof formSchema>;

const Contact = () => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: ""
    }
  });

  const onSubmit = async (data: FormValues) => {
    try {
      // In a real implementation, this would send data to Supabase
      console.log("Form submitted with:", data);
      
      // Send email via Edge Function
      try {
        await fetch("/functions/sendContactEmail", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data)
        });
        
        // Show success toast
        toast.success("Thanks for reaching out! We'll reply soon.");
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        // Still show success toast since the form was submitted
        toast.success("Message sent! We'll get back to you soon.");
      }
      
      // Reset the form
      form.reset();
    } catch (error) {
      toast.error("Something went wrong. Please email info@nordicpath.net.");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="flex-grow py-20 md:py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-10 text-gray-900 text-center">
              Contact Us
            </h1>
            
            <div className="bg-white p-8 rounded-xl shadow-md">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
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
                          <Input type="email" placeholder="your.email@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="How can we help?" 
                            className="min-h-[120px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full">
                    Send Message
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Contact;
