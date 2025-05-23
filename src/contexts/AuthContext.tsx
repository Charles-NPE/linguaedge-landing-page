
import React, { createContext, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AuthUser, UserProfile, UserRole } from "@/types/auth.types";
import { useNavigate } from "react-router-dom";
import { fetchUserProfile, signUpUser, signInUser, signOutUser, getRedirectPathForRole } from "@/utils/authUtils";
import { toast } from "@/hooks/use-toast";

interface AuthContextType {
  session: Session | null;
  user: AuthUser | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signUp: (email: string, password: string, role: UserRole) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isTeacher: boolean;
  isStudent: boolean;
  checkSubscription: () => Promise<void>;
  isSubscriptionActive: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);
  const [isSubscriptionActive, setIsSubscriptionActive] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Setting up auth state listener");
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event, newSession?.user?.id);
        setSession(newSession);
        setUser(newSession?.user ?? null);

        // Defer Supabase calls with setTimeout
        if (newSession?.user) {
          setTimeout(async () => {
            await fetchAndSetUserProfile(newSession.user.id);
          }, 100);
        } else {
          setProfile(null);
          setIsSubscriptionActive(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      console.log("Got existing session:", currentSession?.user?.id);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        await fetchAndSetUserProfile(currentSession.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchAndSetUserProfile = async (userId: string) => {
    console.log("Fetching profile for user:", userId);
    
    // Try up to 3 times with increasing delays
    for (let attempt = 1; attempt <= 3; attempt++) {
      const profileData = await fetchUserProfile(userId);
      console.log(`Attempt ${attempt}: Fetched profile data:`, profileData);
      
      if (profileData) {
        setProfile(profileData as UserProfile);
        setUser(prev => prev ? { ...prev, profile: profileData as UserProfile } : null);
        
        // If teacher, check subscription status
        if (profileData.role === 'teacher') {
          await checkSubscription();
        }
        return;
      } else {
        console.warn(`Profile data not found on attempt ${attempt} for user:`, userId);
        if (attempt < 3) {
          // Wait longer between each retry
          const delay = attempt * 500;
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    console.error("Failed to fetch profile after multiple attempts for user:", userId);
  };

  const checkSubscription = async () => {
    if (!user || !profile || profile.role !== 'teacher' || isCheckingSubscription) {
      return;
    }

    try {
      setIsCheckingSubscription(true);
      console.log("Checking subscription status...");
      
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error("Error checking subscription:", error);
        return;
      }

      console.log("Subscription check result:", data);
      
      // Update subscription status (active or trialing are considered active)
      const active = data.subscribed || 
                    (data.stripe_status && ['active', 'trialing'].includes(data.stripe_status));
      
      setIsSubscriptionActive(active);
      
      // Update profile with subscription data
      setProfile(prev => {
        if (!prev) return null;
        return {
          ...prev,
          stripe_status: data.stripe_status,
          subscription_end: data.subscription_end
        };
      });

    } catch (error) {
      console.error("Error checking subscription:", error);
    } finally {
      setIsCheckingSubscription(false);
    }
  };

  const signUp = async (email: string, password: string, role: UserRole) => {
    try {
      setIsLoading(true);
      console.log(`Registering new ${role} with email: ${email}`);
      
      const { success, data } = await signUpUser(email, password, role);
      
      if (success) {
        console.log("Sign up successful, user data:", data);
        
        // Wait longer to ensure the profile is created
        // This helps prevent race conditions
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Fetch the profile to confirm role is set correctly
        if (data?.user?.id) {
          console.log("Attempting to fetch profile after signup for ID:", data.user.id);
          const profile = await fetchUserProfile(data.user.id);
          console.log("Fetched profile after signup:", profile);
          
          if (profile) {
            // Use the role from the profile
            const effectiveRole = profile.role;
            console.log("Profile found! Role from profile:", effectiveRole);
            console.log("Redirecting to:", getRedirectPathForRole(effectiveRole));
            navigate(getRedirectPathForRole(effectiveRole));
          } else {
            // Fallback to the intended role if profile is not yet available
            console.log("Profile not found after waiting, using provided role:", role);
            console.log("Redirecting to:", getRedirectPathForRole(role));
            navigate(getRedirectPathForRole(role));
          }
        }
      } else {
        console.error("Sign up failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { success, profile } = await signInUser(email, password);
      
      if (success && profile) {
        // -------- new redirect logic --------
        if (profile.role === "teacher") {
          navigate("/teacher", { replace: true });
        } else if (profile.role === "student") {
          navigate("/student", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
        // ------------------------------------
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    const { success } = await signOutUser();
    if (success) {
      navigate('/');
    }
  };

  const isTeacher = profile?.role === 'teacher';
  const isStudent = profile?.role === 'student';

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        isLoading,
        signUp,
        signIn,
        signOut,
        isTeacher,
        isStudent,
        checkSubscription,
        isSubscriptionActive
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
