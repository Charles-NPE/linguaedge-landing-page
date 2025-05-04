import { UserRole } from "@/types/auth.types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

/**
 * Fetch user profile from Supabase
 */
export const fetchUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }

    return data ?? null;
  } catch (err) {
    console.error("Error fetching user profile:", err);
    return null;
  }
};

/**
 * Sign up a new user
 */
export const signUpUser = async (
  email: string,
  password: string,
  role: UserRole
) => {
  try {
    // 1) Create the user in Auth with role in metadata
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role // Store role in user metadata
        }
      }
    });
    if (authErr) {
      toast({
        title: "Registration failed",
        description: authErr.message,
        variant: "destructive",
      });
      return { success: false, error: authErr, data: null };
    }

    const userId = authData.user?.id;
    if (!userId) throw new Error("User ID not returned from signUp");

    // 2) Insert the profile with the role
    // The trigger will handle this now, but we keep this as a fallback
    // Cast the role to UserRole to ensure type safety
    const now = new Date().toISOString();
    const { error: insertErr } = await supabase
      .from("profiles")
      .insert({
        id: userId, 
        role: role as UserRole, // explicitly cast to UserRole type
        created_at: now, 
        updated_at: now 
      });
      
    if (insertErr) {
      console.error("Error inserting profile row:", insertErr);
      // no abortamos el flujo porque el usuario ya está creado
    }

    toast({
      title: "Registration successful",
      description: "Welcome to LinguaEdgeAI!",
    });

    return { success: true, error: null, data: authData };
  } catch (err: any) {
    toast({
      title: "Registration failed",
      description: err.message,
      variant: "destructive",
    });
    return { success: false, error: err, data: null };
  }
};

/**
 * Sign in an existing user
 */
export const signInUser = async (email: string, password: string) => {
  try {
    const { data: authData, error: authErr } =
      await supabase.auth.signInWithPassword({ email, password });

    if (authErr) {
      toast({
        title: "Login failed",
        description: authErr.message,
        variant: "destructive",
      });
      return { success: false, error: authErr, data: null, profile: null };
    }

    toast({
      title: "Login successful",
      description: "Welcome back!",
    });

    // 2) Retrieve the profile
    const { data: profileData, error: profileErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authData.user?.id)
      .single();

    if (profileErr) {
      console.error("Error fetching profile after login:", profileErr);
    }

    return {
      success: true,
      error: null,
      data: authData,
      profile: profileData ?? null,
    };
  } catch (err: any) {
    toast({
      title: "Login failed",
      description: err.message,
      variant: "destructive",
    });
    return { success: false, error: err, data: null, profile: null };
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
  } catch (err: any) {
    toast({
      title: "Logout failed",
      description: err.message,
      variant: "destructive",
    });
    return { success: false, error: err };
  }
};

/**
 * Redirect user based on role
 */
export const getRedirectPathForRole = (role: UserRole) => {
  return role === "teacher" ? "/teacher" : "/student";
};
