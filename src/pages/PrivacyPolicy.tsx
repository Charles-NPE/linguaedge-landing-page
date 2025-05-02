
import React from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="flex-grow py-20 md:py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-10 text-gray-900 text-center">
              Privacy Policy
            </h1>
            
            <div className="bg-white p-8 rounded-xl shadow-md space-y-8">
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">1. Introduction</h2>
                <p className="text-gray-600">
                  This Privacy Policy explains how LinguaEdge.ai ("we", "us", "our") collects, uses, and shares your personal data when you use our website and services. We respect your privacy and are committed to protecting your personal data in accordance with applicable data protection laws, including the General Data Protection Regulation (GDPR).
                </p>
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">2. Data We Collect</h2>
                <p className="text-gray-600">We collect the following categories of personal data:</p>
                <ul className="list-disc pl-5 mt-2 space-y-2 text-gray-600">
                  <li><strong>Account information:</strong> Name, email address, and password when you create an account.</li>
                  <li><strong>Profile information:</strong> Job title, institution name, and other details you provide in your profile.</li>
                  <li><strong>Usage data:</strong> Information about how you use our website and services.</li>
                  <li><strong>Content data:</strong> Student essays and feedback that you upload to our platform.</li>
                  <li><strong>Communication data:</strong> Messages you send us through our contact forms.</li>
                  <li><strong>Scheduling data:</strong> Information you provide when booking a demo through our scheduling system.</li>
                </ul>
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">3. Purpose and Lawful Basis</h2>
                <p className="text-gray-600">We process your personal data for the following purposes and on these lawful bases:</p>
                <ul className="list-disc pl-5 mt-2 space-y-2 text-gray-600">
                  <li><strong>To provide our services:</strong> Processing is necessary for the performance of our contract with you.</li>
                  <li><strong>To improve our services:</strong> We have a legitimate interest in analyzing usage patterns to enhance our platform.</li>
                  <li><strong>To communicate with you:</strong> Processing is necessary for our contract or based on your consent.</li>
                  <li><strong>For marketing purposes:</strong> Based on your consent, which you can withdraw at any time.</li>
                </ul>
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-800" id="cookies">4. Cookies</h2>
                <p className="text-gray-600">
                  We use cookies and similar technologies to provide, protect, and improve our services. When you first visit our website, we'll ask for your consent to use cookies through our cookie banner.
                </p>
                <p className="text-gray-600 mt-2">
                  <strong>Essential cookies:</strong> These cookies are necessary for the website to function and cannot be switched off. They're usually set in response to actions you take, such as setting your privacy preferences, logging in, or filling in forms.
                </p>
                <p className="text-gray-600 mt-2">
                  <strong>Non-essential cookies:</strong> These include analytics cookies that help us understand how visitors interact with our website by collecting and reporting information anonymously, and marketing cookies that track your visits to our website and other websites to deliver advertisements relevant to your interests.
                </p>
                <p className="text-gray-600 mt-2">
                  You can manage your cookie preferences through the cookie banner that appears when you first visit our website or by clicking "Manage cookie preferences" in the footer of our website.
                </p>
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">5. Data Processors</h2>
                <p className="text-gray-600">We use the following third-party data processors:</p>
                <ul className="list-disc pl-5 mt-2 space-y-2 text-gray-600">
                  <li><strong>Supabase:</strong> For secure database hosting and user authentication.</li>
                  <li><strong>OpenAI:</strong> For AI-powered essay grading and feedback.</li>
                  <li><strong>Calendly:</strong> For scheduling demo appointments when you request a demo of our services.</li>
                </ul>
                <p className="text-gray-600 mt-2">
                  All our processors are compliant with applicable data protection laws, and we have appropriate data processing agreements in place.
                </p>
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">6. Data Retention</h2>
                <p className="text-gray-600">
                  We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected, including any legal, accounting, or reporting requirements.
                </p>
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">7. Your Rights</h2>
                <p className="text-gray-600">Under the GDPR and other applicable data protection laws, you have the following rights:</p>
                <ul className="list-disc pl-5 mt-2 space-y-2 text-gray-600">
                  <li>Right to access your personal data</li>
                  <li>Right to rectification of inaccurate personal data</li>
                  <li>Right to erasure of your personal data</li>
                  <li>Right to restrict processing of your personal data</li>
                  <li>Right to data portability</li>
                  <li>Right to object to processing of your personal data</li>
                  <li>Right not to be subject to automated decision-making</li>
                  <li>Right to withdraw consent</li>
                </ul>
                <p className="text-gray-600 mt-2">
                  To exercise any of these rights, please contact us at privacy@linguaedge.ai.
                </p>
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">8. Contact Information</h2>
                <p className="text-gray-600">
                  If you have any questions or concerns about our Privacy Policy or our data practices, please contact our Data Protection Officer at privacy@linguaedge.ai.
                </p>
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">9. Changes to This Privacy Policy</h2>
                <p className="text-gray-600">
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the effective date at the top of this page.
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

export default PrivacyPolicy;
