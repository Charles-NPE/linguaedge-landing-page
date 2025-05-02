
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Demo = () => {
  const [schedulingUrl, setSchedulingUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Fetch the Calendly link from our edge function
    fetch('/functions/getCalendlyLink')
      .then(response => {
        if (!response.ok) throw new Error('Failed to load scheduling link');
        return response.json();
      })
      .then(data => {
        setSchedulingUrl(data.scheduling_url);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching Calendly link:', err);
        setError(true);
        setIsLoading(false);
        toast.error("Could not load scheduler. Please try again later.");
      });
  }, []);

  // Add Calendly script
  useEffect(() => {
    if (!schedulingUrl) return;
    
    const script = document.createElement('script');
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, [schedulingUrl]);

  // Initialize Calendly when URL and script are ready
  useEffect(() => {
    if (!schedulingUrl || !window.Calendly) return;
    
    window.Calendly.initInlineWidget({
      url: schedulingUrl,
      parentElement: document.getElementById('calendly-container'),
      prefill: {},
      utm: {}
    });
  }, [schedulingUrl]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="flex-grow py-20 md:py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Schedule a Live Demo
            </h1>
            
            <div className="bg-white p-6 rounded-xl shadow-md mb-8 mx-auto w-full max-w-[600px]">
              <div 
                id="calendly-container" 
                className="calendly-inline-widget w-full rounded-lg overflow-hidden" 
                style={{ minHeight: isLoading ? '150px' : '600px' }}
              >
                {isLoading && (
                  <div className="flex items-center justify-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                )}
                
                {error && (
                  <div className="text-center py-10">
                    <p className="text-lg mb-4 text-gray-600">
                      Booking temporarily unavailable.
                    </p>
                    <Button asChild>
                      <a href="mailto:sales@linguaedge.ai">
                        Contact sales@linguaedge.ai
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            <p className="text-lg text-gray-600">
              Prefer email? Contact <a href="mailto:sales@linguaedge.ai" className="text-indigo-600 hover:underline">sales@linguaedge.ai</a>
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

// Add TypeScript interface for Calendly
declare global {
  interface Window {
    Calendly: {
      initInlineWidget: (options: {
        url: string;
        parentElement: HTMLElement | null;
        prefill?: Record<string, any>;
        utm?: Record<string, any>;
      }) => void;
    };
  }
}

export default Demo;
