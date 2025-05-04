
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

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
    priceId: import.meta.env.VITE_STARTER_PRICE_ID || "",
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
    priceId: import.meta.env.VITE_ACADEMY_PRICE_ID || "",
  }
];

const PricingSection = () => {
  return (
    <section className="py-20 bg-gray-50" id="pricing">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Straightforward Pricing
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your academy's needs. All plans include a <strong>1-month</strong> free trial.
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
                  <Link to={plan.ctaLink}>{plan.cta}</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/pricing">
            <Button variant="outline">View all pricing details</Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
