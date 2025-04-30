import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
const HeroSection = () => {
  return <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/90 to-violet-500/90 -z-10"></div>
      <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1488590528505-98d2b5aba04b')] bg-cover bg-center -z-20"></div>
      
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-12 md:mb-0 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Instant AI Essay Feedback for Language Academies
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-lg">
              Save teachers hours each week and keep students motivated with real-time, exam-style corrections.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-white text-indigo-700 hover:bg-white/90">
                <a href="/signup">Try it free</a>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                <a href="/demo">Book a demo</a>
              </Button>
            </div>
          </div>
          
          <div className="md:w-1/2 md:pl-12 animate-fade-in">
            <div className="bg-white/10 backdrop-blur-sm p-2 rounded-2xl shadow-xl">
              <div className="bg-white rounded-xl overflow-hidden shadow-lg">
                <img alt="Teacher dashboard" className="w-full h-auto rounded-t-xl" src="/lovable-uploads/33b90792-4f69-4828-972b-f4c20e5e2605.png" />
                <div className="p-6 bg-white">
                  <div className="h-2 w-24 bg-indigo-200 rounded-full mb-4"></div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="h-2 w-full bg-gray-100 rounded-full"></div>
                    <div className="h-2 w-full bg-gray-100 rounded-full"></div>
                    <div className="h-2 w-20 bg-gray-100 rounded-full"></div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="h-2 w-full bg-indigo-100 rounded-full"></div>
                    <div className="h-2 w-full bg-violet-100 rounded-full"></div>
                    <div className="h-2 w-full bg-indigo-100 rounded-full"></div>
                    <div className="h-2 w-full bg-violet-100 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default HeroSection;