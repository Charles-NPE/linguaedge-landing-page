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
    return data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
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
    // 1) Creamos el user en Auth
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error, data: null };
    }

    const userId = data.user?.id;
    if (!userId) throw new Error("User ID not returned from signUp");

    // 2) Upsert del perfil (student o teacher) para garantizar fila en profiles
    const { error: upsertErr } = await supabase
      .from("profiles")
      .upsert(
        {
          id: userId,
          role,               // 'student' o 'teacher'
          created_at: new Date(),
          updated_at: new Date(),
        },
        { onConflict: "id" }
      );
    if (upsertErr) {
      toast({
        title: "Profile Creation Error",
        description:
          "Your account was created but there was an issue setting up your profile.",
        variant: "destructive",
      });
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

    // Traer el perfil para conocer el rol
    const { data: profileData, error: pfErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user?.id)
      .single();
    if (pfErr) {
      console.error("Error fetching profile on signIn:", pfErr);
    }

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
  return role === "teacher" ? "/teacher" : "/student";
};
