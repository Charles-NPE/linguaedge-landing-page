
import React from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { Button } from "@/components/ui/button";

const Demo = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="flex-grow py-20 md:py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Schedule a Live Demo
            </h1>
            
            <div className="bg-white p-6 rounded-xl shadow-md mb-8 mx-auto w-full max-w-[600px] h-[450px] flex items-center justify-center">
              <div className="text-center">
                <p className="text-lg mb-4 text-gray-600">Calendly scheduling iframe would appear here</p>
                <Button asChild>
                  <a href="https://calendly.com" target="_blank" rel="noopener noreferrer">
                    Book a time with our team
                  </a>
                </Button>
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

export default Demo;
