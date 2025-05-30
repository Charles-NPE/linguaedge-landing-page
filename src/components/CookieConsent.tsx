
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';

const COOKIE_CONSENT_KEY = 'le_cookie_pref';
const ANALYTICS_KEY = 'le_cookie_analytics';
const MARKETING_KEY = 'le_cookie_marketing';

type ConsentStatus = 'pending' | 'all' | 'essential' | 'custom';

interface CookiePreferences {
  analytics: boolean;
  marketing: boolean;
}

const CookieConsent = () => {
  const [consentStatus, setConsentStatus] = useState<ConsentStatus | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    analytics: false,
    marketing: false
  });

  useEffect(() => {
    // Check if user has already made a choice
    const storedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (storedConsent) {
      setConsentStatus(storedConsent as ConsentStatus);
      
      // Load saved preferences
      const analyticsEnabled = localStorage.getItem(ANALYTICS_KEY) === 'true';
      const marketingEnabled = localStorage.getItem(MARKETING_KEY) === 'true';
      
      setPreferences({
        analytics: analyticsEnabled,
        marketing: marketingEnabled
      });
    } else {
      setConsentStatus('pending');
    }
    
    // Set up event listener for "Manage cookies" in footer
    const manageCookiesLink = document.getElementById('manage-cookies');
    if (manageCookiesLink) {
      const handleManageCookies = (e: MouseEvent) => {
        e.preventDefault();
        setShowModal(true);
      };
      
      manageCookiesLink.addEventListener('click', handleManageCookies);
      
      return () => {
        manageCookiesLink.removeEventListener('click', handleManageCookies);
      };
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'all');
    localStorage.setItem(ANALYTICS_KEY, 'true');
    localStorage.setItem(MARKETING_KEY, 'true');
    setConsentStatus('all');
    setPreferences({ analytics: true, marketing: true });
    setShowModal(false);
    toast.success("Cookie preferences saved");
  };

  const handleRejectNonEssential = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'essential');
    localStorage.setItem(ANALYTICS_KEY, 'false');
    localStorage.setItem(MARKETING_KEY, 'false');
    setConsentStatus('essential');
    setPreferences({ analytics: false, marketing: false });
    setShowModal(false);
    toast.success("Cookie preferences saved");
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'custom');
    localStorage.setItem(ANALYTICS_KEY, preferences.analytics ? 'true' : 'false');
    localStorage.setItem(MARKETING_KEY, preferences.marketing ? 'true' : 'false');
    setConsentStatus('custom');
    setShowModal(false);
    toast.success("Cookie preferences saved");
  };

  const handlePreferenceChange = (type: keyof CookiePreferences) => {
    setPreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  if (consentStatus !== 'pending') {
    return null;
  }

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg z-50 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1 pr-4">
              <p className="text-gray-700 dark:text-gray-300">
                We use cookies to improve the experience, analyse traffic, and remember preferences.{' '}
                <Link to="/privacy-policy#cookies" className="text-indigo-600 dark:text-indigo-400 hover:underline">Learn more</Link>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={handleRejectNonEssential}>
                Reject non-essential
              </Button>
              <Button size="sm" onClick={handleAcceptAll}>
                Accept all
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
              <h3 className="text-xl font-bold">Cookie Preferences</h3>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Essential Cookies</h4>
                  <div className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">Always Active</div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  These cookies are necessary for the website to function and cannot be switched off. They're usually set in response to actions you take, such as setting your privacy preferences, logging in, or filling in forms.
                </p>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Analytics Cookies</h4>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={preferences.analytics}
                      onChange={() => handlePreferenceChange('analytics')}
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.
                </p>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Marketing Cookies</h4>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={preferences.marketing}
                      onChange={() => handlePreferenceChange('marketing')}
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  These cookies track your visits to our website and other websites to deliver advertisements more relevant to you and your interests.
                </p>
              </div>
            </div>
            
            <div className="p-6 border-t dark:border-gray-700 flex justify-end gap-2">
              <Button variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button onClick={handleSavePreferences}>
                Save preferences
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CookieConsent;
