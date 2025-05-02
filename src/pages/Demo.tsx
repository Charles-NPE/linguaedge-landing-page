
import React from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

const Demo = () => {
  const calendarLink = "https://calendly.com/nordicpath-info/30min";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="flex-grow py-20 md:py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Schedule a Live Demo
            </h1>
            
            <div className="bg-white p-8 rounded-xl shadow-md mb-8 mx-auto w-full max-w-[600px] flex flex-col items-center">
              <p className="text-lg text-gray-700 mb-6">
                Click below to schedule a time that works for you. Our team will walk you through our platform and answer any questions you may have.
              </p>
              
              <Button 
                size="lg" 
                className="bg-indigo-600 hover:bg-indigo-700 text-xl py-6"
                asChild
              >
                <a href={calendarLink} target="_blank" rel="noopener noreferrer">
                  Book a Demo <ExternalLink className="ml-2" />
                </a>
              </Button>
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

export default Demo;
