
import React from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { Check, Clock } from "lucide-react";

const About = () => {
  const timelineItems = [
    {
      year: "2024",
      title: "Founded",
      description: "LinguaEdge.ai was founded to revolutionize essay grading for language academies worldwide."
    },
    {
      year: "2025",
      title: "Private Beta",
      description: "Launched our private beta with select language academies across Europe."
    },
    {
      year: "2026",
      title: "Public Launch",
      description: "Expected public launch with support for 15+ languages."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="flex-grow py-20 md:py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-10 text-gray-900 text-center">
              About LinguaEdge.ai
            </h1>
            
            <div className="bg-white p-8 rounded-xl shadow-md mb-12">
              <p className="text-lg text-gray-700 leading-relaxed">
                At LinguaEdge.ai, our mission is to transform language education through AI-powered essay assessment technology. We believe that providing immediate, accurate feedback to language learners accelerates their progress while saving educators valuable time. By combining cutting-edge artificial intelligence with expert language pedagogy, we're creating a future where language academies can scale personalized instruction without compromising quality or overwhelming their teaching staff.
              </p>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-gray-900 text-center">Our Journey</h2>
            
            <div className="space-y-12">
              {timelineItems.map((item, index) => (
                <div key={index} className="flex">
                  <div className="mr-6 flex flex-col items-center">
                    <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                      {item.year.substring(2)}
                    </div>
                    {index < timelineItems.length - 1 && <div className="w-0.5 grow bg-indigo-200 my-2"></div>}
                  </div>
                  <div className="pt-1.5">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                      {item.year} - {item.title}
                    </h3>
                    <p className="text-gray-600 mt-2">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default About;
