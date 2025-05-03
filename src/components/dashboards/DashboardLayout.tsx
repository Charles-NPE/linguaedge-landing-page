
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import UserDropdown from "@/components/navigation/UserDropdown";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title }) => {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500/5 via-transparent to-violet-500/5">
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link to="/" className="font-bold text-xl text-primary">
              LinguaEdgeAI
            </Link>
            <h1 className="text-xl font-semibold hidden md:block">{title}</h1>
          </div>
          <div className="flex items-center space-x-2">
            <UserDropdown />
          </div>
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="md:hidden mb-6">
          <h1 className="text-2xl font-semibold">{title}</h1>
        </div>
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
