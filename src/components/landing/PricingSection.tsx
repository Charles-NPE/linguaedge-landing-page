
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "$99",
    period: "per month",
    description: "Perfect for small language schools just starting out.",
    features: [
      "Up to 50 students",
      "10 teachers",
      "100 essay corrections/month",
      "Basic analytics",
      "Email support"
    ],
    cta: "Get started",
    ctaLink: "/signup",
    popular: false,
  },
  {
    name: "Pro",
    price: "$249",
    period: "per month",
    description: "For growing language academies with more needs.",
    features: [
      "Up to 200 students",
      "25 teachers",
      "500 essay corrections/month",
      "Advanced analytics & reporting",
      "Custom rubrics & templates",
      "Priority email support"
    ],
    cta: "Get started",
    ctaLink: "/signup",
    popular: true,
  },
  {
    name: "Academy",
    price: "$499",
    period: "per month",
    description: "For large institutions with extensive requirements.",
    features: [
      "Unlimited students",
      "Unlimited teachers",
      "2000 essay corrections/month",
      "Full analytics suite & API access",
      "Custom integration",
      "Dedicated account manager",
      "24/7 support"
    ],
    cta: "Get started",
    ctaLink: "/signup",
    popular: false,
  },
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
            Choose the plan that fits your academy's needs. All plans include a 14-day free trial.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-xl shadow-lg overflow-hidden card-hover ${
                plan.popular ? 'ring-2 ring-indigo-500 relative' : ''
              }`}
            >
              {plan.popular && (
                <div className="bg-indigo-500 text-white text-sm font-semibold py-1 px-3 rounded-br-lg absolute top-0 left-0">
                  Most Popular
                </div>
              )}
              
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
      </div>
    </section>
  );
};

export default PricingSection;
