
import { UserRole } from "@/types/auth.types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

/**
 * Fetch user profile from Supabase
 */
export const fetchUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    if (data) {
      return data;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

/**
 * Sign up a new user
 */
export const signUpUser = async (email: string, password: string, role: UserRole) => {
  try {
    // Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error, data: null };
    }

    // Verify we have a user ID
    const userId = data.user?.id;
    if (!userId) {
      throw new Error("User ID not returned from signUp");
    }

    // set/ensure teacher role if the user signed up as a teacher
    if (role === 'teacher') {
      const { data: updData, error: updErr } =
        await supabase
          .from('profiles')
          .update({ role: 'teacher' })
          .eq('id', data.user!.id)
          .select();               // <-- guarantees array

      if (updErr || (updData?.length ?? 0) === 0) {
        await supabase
          .from('profiles')
          .insert({ id: data.user!.id, role: 'teacher' });
      }
    }

    toast({
      title: "Registration successful",
      description: "Welcome to LinguaEdgeAI!",
    });
    
    return { success: true, error: null, data };
  } catch (error: any) {
    toast({
      title: "Registration failed",
      description: error.message,
      variant: "destructive",
    });
    return { success: false, error, data: null };
  }
};

/**
 * Sign in an existing user
 */
export const signInUser = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error, data: null, profile: null };
    }

    toast({
      title: "Login successful",
      description: "Welcome back!",
    });

    // Fetch profile to get role
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user?.id)
      .single();

    return { success: true, error: null, data, profile: profileData };
  } catch (error: any) {
    toast({
      title: "Login failed",
      description: error.message,
      variant: "destructive",
    });
    return { success: false, error, data: null, profile: null };
  }
};

/**
 * Sign out the current user
 */
export const signOutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error };
    }
    
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
    
    return { success: true, error: null };
  } catch (error: any) {
    toast({
      title: "Logout failed",
      description: error.message,
      variant: "destructive",
    });
    return { success: false, error };
  }
};

/**
 * Redirect user based on role
 */
export const getRedirectPathForRole = (role: UserRole) => {
  if (role === 'teacher') {
    return '/teacher';
  } else {
    return '/student';
  }
};
