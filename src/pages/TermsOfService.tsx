
import React from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

const TermsOfService = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="flex-grow py-20 md:py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-10 text-gray-900 text-center">
              Terms of Service
            </h1>
            
            <div className="bg-white p-8 rounded-xl shadow-md space-y-8">
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">1. Introduction</h2>
                <p className="text-gray-600">
                  These Terms of Service ("Terms") govern your access to and use of LinguaEdge.ai's website and services ("Services"). By using our Services, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our Services.
                </p>
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">2. Service Scope</h2>
                <p className="text-gray-600">
                  LinguaEdge.ai provides AI-powered essay feedback and grading services for language academies. Our Services include:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-2 text-gray-600">
                  <li>Automated essay feedback and grading</li>
                  <li>Student progress tracking</li>
                  <li>Teacher dashboard and analytics</li>
                  <li>API access (for eligible plans)</li>
                </ul>
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">3. User Obligations</h2>
                <p className="text-gray-600">As a user of our Services, you agree to:</p>
                <ul className="list-disc pl-5 mt-2 space-y-2 text-gray-600">
                  <li>Provide accurate and complete information when creating an account</li>
                  <li>Maintain the security of your account and password</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                  <li>Use our Services in compliance with all applicable laws and regulations</li>
                  <li>Respect the intellectual property rights of others</li>
                </ul>
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">4. Acceptable Use</h2>
                <p className="text-gray-600">You agree not to:</p>
                <ul className="list-disc pl-5 mt-2 space-y-2 text-gray-600">
                  <li>Use our Services for any illegal purpose</li>
                  <li>Upload, post, or transmit any content that infringes the rights of others</li>
                  <li>Attempt to gain unauthorized access to our systems or networks</li>
                  <li>Interfere with the proper functioning of our Services</li>
                  <li>Use our Services to send unsolicited communications</li>
                  <li>Share your account or credentials with others</li>
                  <li>Exceed your plan's usage limits or engage in activities that degrade the performance of our Services</li>
                </ul>
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">5. Intellectual Property</h2>
                <p className="text-gray-600">
                  All content, features, and functionality of our Services, including but not limited to text, graphics, logos, icons, and software, are the exclusive property of LinguaEdge.ai or its licensors and are protected by copyright, trademark, and other intellectual property laws.
                </p>
                <p className="text-gray-600 mt-2">
                  By submitting content to our Services, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, and display such content in connection with providing our Services.
                </p>
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">6. Disclaimer</h2>
                <p className="text-gray-600">
                  Our Services are provided on an "as is" and "as available" basis. LinguaEdge.ai makes no warranties, expressed or implied, and hereby disclaims all warranties, including without limitation, implied warranties of merchantability, fitness for a particular purpose, non-infringement, or course of performance.
                </p>
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">7. Limitation of Liability</h2>
                <p className="text-gray-600">
                  In no event shall LinguaEdge.ai be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, or other intangible losses, resulting from (i) your access to or use of or inability to access or use our Services; (ii) any content obtained from our Services; or (iii) unauthorized access, use, or alteration of your transmissions or content.
                </p>
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">8. Termination</h2>
                <p className="text-gray-600">
                  We may terminate or suspend your account and access to our Services immediately, without prior notice or liability, for any reason, including without limitation if you breach these Terms.
                </p>
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">9. Governing Law</h2>
                <p className="text-gray-600">
                  These Terms shall be governed by the laws of the European Union, without regard to its conflict of law provisions. Any disputes relating to these Terms shall be subject to the exclusive jurisdiction of the courts of the European Union.
                </p>
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">10. Changes to Terms</h2>
                <p className="text-gray-600">
                  We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
                </p>
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">11. Contact Information</h2>
                <p className="text-gray-600">
                  If you have any questions about these Terms, please contact us at legal@linguaedge.ai.
                </p>
              </div>
              
              <div className="pt-4 text-gray-600">
                <p><strong>Last updated:</strong> May 1, 2025</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default TermsOfService;
