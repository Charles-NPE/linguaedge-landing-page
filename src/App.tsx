
import React, { Suspense } from "react";
import { createRoot } from 'react-dom/client';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import PageLoader from "@/components/ui/PageLoader";
import CookieConsent from "@/components/CookieConsent";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { routes } from "@/routes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,   // 5 min por defecto
      refetchOnWindowFocus: false
    }
  }
});

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <AuthProvider>
          <div className="min-h-screen flex flex-col w-full">
            <Toaster />
            <Sonner />
            <Suspense fallback={<PageLoader />}>
              <RouterProvider router={routes} />
            </Suspense>
            <CookieConsent />
          </div>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
