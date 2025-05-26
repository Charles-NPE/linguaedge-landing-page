
import React, { Suspense } from "react";
import { createRoot } from 'react-dom/client';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PageLoader from "@/components/ui/PageLoader";
import CookieConsent from "@/components/CookieConsent";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { allRoutes } from "@/routes";

const queryClient = new QueryClient();

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            <div className="min-h-screen flex flex-col w-full">
              <Toaster />
              <Sonner />
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {allRoutes.map((route) => (
                    <Route key={route.path} path={route.path} element={route.element} />
                  ))}
                </Routes>
              </Suspense>
              <CookieConsent />
            </div>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
