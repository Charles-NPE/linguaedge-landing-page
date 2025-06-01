
// @ts-nocheck
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Theme = "light" | "dark";
type ThemeContextType = { theme: Theme; setTheme: (t: Theme) => Promise<void> };

const ThemeContext = createContext<ThemeContextType | null>(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === null) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>("light");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch theme on mount
  useEffect(() => {
    const fetchTheme = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data } = await supabase
            .from("user_settings")
            .select("theme")
            .eq("user_id", user.id)
            .single();
          
          const storedTheme = (data?.theme || localStorage.getItem("theme") || "light") as Theme;
          setThemeState(storedTheme);
        } else {
          // Handle unauthenticated users
          const storedTheme = (localStorage.getItem("theme") || "light") as Theme;
          setThemeState(storedTheme);
        }
      } catch (error) {
        console.error("Error fetching theme:", error);
        // Fallback to localStorage or browser preference
        const storedTheme = getDefaultTheme();
        setThemeState(storedTheme);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTheme();
  }, []);

  // Get default theme based on localStorage or system preference
  const getDefaultTheme = (): Theme => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    
    if (savedTheme) {
      return savedTheme;
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return "dark";
    }
    
    return "light";
  };

  // Persist theme helper - no longer applies to HTML element globally
  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("user_settings")
          .upsert(
            { 
              user_id: user.id, 
              theme: newTheme,
              updated_at: new Date().toISOString()
            }, 
            { onConflict: "user_id" }
          );
      }
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
