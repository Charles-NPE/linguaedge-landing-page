
import React from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    name: "Starter",
    price: "€20",
    period: "per academy / month",
    description: "Perfect for small language schools just starting out.",
    features: [
      "Up to 20 students",
      "1 teacher",
      "Analytics dashboard",
      "Email support"
    ],
    cta: "Get started",
    ctaLink: "/signup",
    popular: false,
  },
  {
    name: "Academy",
    price: "€50",
    period: "per academy / month",
    description: "For growing language academies with more needs.",
    features: [
      "Up to 60 students",
      "3 teachers",
      "Analytics dashboard", 
      "Email support"
    ],
    cta: "Get started",
    ctaLink: "/signup",
    popular: true,
  }
];

const Pricing = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="py-20 pt-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Plans & Pricing
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Transparent pricing for language academies. All plans include a <strong>1-month</strong> free trial.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan, index) => (
              <div 
                key={index} 
                className={`bg-white rounded-xl shadow-lg overflow-hidden card-hover relative ${
                  plan.popular ? 'ring-2 ring-indigo-500' : ''
                }`}
              >
                <div className="absolute top-4 right-4">
                  <Badge variant="default" className="bg-violet-500">1 month free</Badge>
                </div>
                
                <div className="p-8">
                  <h3 className="text-xl font-bold mb-2 text-gray-900">{plan.name}</h3>
                  <div className="flex items-end mb-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 ml-1">{plan.period}</span>
                  </div>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  
                  <ul className="mb-8 space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <Check className="h-5 w-5 text-indigo-500 mr-2 shrink-0 mt-0.5" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    asChild
                    className={`w-full ${plan.popular ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    <a href={plan.ctaLink}>{plan.cta}</a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-16">
            <p className="text-lg text-gray-600 mb-4">Ready to start?</p>
            <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-700">
              <a href="/signup">Sign up free</a>
            </Button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Pricing;
