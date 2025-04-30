
import { useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    name: "Maria Rodriguez",
    role: "Director, International Language School",
    avatar: "https://randomuser.me/api/portraits/women/45.jpg",
    quote: "LinguaEdge has transformed how our teachers work. They now spend less time marking and more time teaching. Our students get feedback within minutes instead of days!"
  },
  {
    name: "David Chen",
    role: "Academic Director, Language Connect",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    quote: "The precision of the AI feedback is remarkable. It catches nuances that align perfectly with language exam criteria, and our teachers can add personal notes when needed."
  },
  {
    name: "Sophie Laurent",
    role: "Owner, Paris Language Academy",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    quote: "Student satisfaction has increased by 40% since implementing LinguaEdge. The immediate feedback keeps them engaged and motivated to improve with each essay."
  }
];

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  return (
    <section className="py-20" id="testimonials">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            What Our Customers Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Language academies around the world are saving time and improving outcomes with LinguaEdge.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative bg-white rounded-xl shadow-lg p-8 md:p-12">
            <div className="absolute -top-5 left-10 h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
              <Quote className="h-5 w-5 text-white" />
            </div>
            
            <div className="space-y-6">
              <blockquote className="text-xl text-gray-700 italic">
                "{testimonials[currentIndex].quote}"
              </blockquote>
              
              <div className="flex items-center">
                <img 
                  src={testimonials[currentIndex].avatar} 
                  alt={testimonials[currentIndex].name}
                  className="h-14 w-14 rounded-full mr-4 object-cover"
                />
                <div>
                  <h4 className="font-bold text-gray-900">{testimonials[currentIndex].name}</h4>
                  <p className="text-gray-600">{testimonials[currentIndex].role}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center mt-8 gap-3">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={prevTestimonial}
              className="rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            {testimonials.map((_, index) => (
              <Button 
                key={index}
                variant="ghost" 
                size="sm"
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full p-0 min-w-0 ${
                  index === currentIndex ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
              />
            ))}
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={nextTestimonial}
              className="rounded-full"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
