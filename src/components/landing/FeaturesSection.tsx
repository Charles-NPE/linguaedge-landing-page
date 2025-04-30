
import { Clock, ShieldCheck, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "Save Teachers Time",
    description: "Reduce essay marking time by up to 75% with instant AI-powered feedback and corrections.",
    icon: Clock,
  },
  {
    title: "Motivate Students",
    description: "Provide immediate feedback that guides students to improve their language skills faster.",
    icon: Sparkles,
  },
  {
    title: "Detect AI Usage",
    description: "Identify when students use AI tools to write essays, maintaining academic integrity.",
    icon: ShieldCheck,
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-gray-50" id="features">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Powerful Features for Language Educators
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our AI-powered platform is designed specifically for language academies and their unique needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="card-hover rounded-xl border-0 shadow-md">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-500 mb-4">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
