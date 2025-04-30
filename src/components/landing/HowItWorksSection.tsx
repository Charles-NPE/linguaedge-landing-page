
import { Check, Edit, PenTool } from "lucide-react";

const steps = [
  {
    title: "Assign",
    description: "Easily create and assign essay tasks through the platform.",
    icon: PenTool,
  },
  {
    title: "Write & Submit",
    description: "Students write essays and submit directly through the portal.",
    icon: Edit,
  },
  {
    title: "AI Correction",
    description: "Instant AI feedback with exam-style corrections and scoring.",
    icon: Check,
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-20" id="how-it-works">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Simple, effective process for both teachers and students.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-start justify-between max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center mb-8 md:mb-0 md:w-1/3 animate-fade-in" style={{ animationDelay: `${index * 0.2}s` }}>
              <div className="relative">
                <div className="h-16 w-16 rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-500 mb-4 shadow-md">
                  <step.icon className="h-8 w-8 text-white" />
                </div>
                
                {/* Connection line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full h-0.5 w-16 bg-gray-200 -translate-y-1/2">
                    <div className="absolute right-0 top-1/2 w-2 h-2 bg-violet-500 rounded-full -translate-y-1/2"></div>
                  </div>
                )}
              </div>
              
              <h3 className="text-xl font-bold mb-2 text-gray-900">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
