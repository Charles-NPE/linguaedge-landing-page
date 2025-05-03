
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md py-3" : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <span className={`font-bold text-xl ${isScrolled ? "text-indigo-600" : "text-white"}`}>
              LinguaEdge.ai
            </span>
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex space-x-6">
              <Link 
                to="/about" 
                className={`${
                  isScrolled ? "text-gray-600 hover:text-indigo-600" : "text-white/90 hover:text-white"
                } transition-colors`}
              >
                About
              </Link>
              <Link 
                to="/pricing" 
                className={`${
                  isScrolled ? "text-gray-600 hover:text-indigo-600" : "text-white/90 hover:text-white"
                } transition-colors`}
              >
                Pricing
              </Link>
              <Link 
                to="/demo" 
                className={`${
                  isScrolled ? "text-gray-600 hover:text-indigo-600" : "text-white/90 hover:text-white"
                } transition-colors`}
              >
                Book a demo
              </Link>
            </div>
            
            <div className="flex space-x-3">
              <Button asChild variant="ghost" className={isScrolled ? "" : "text-white hover:bg-white/10"}>
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild variant={isScrolled ? "default" : "secondary"}>
                <Link to="/signup">Sign up free</Link>
              </Button>
            </div>
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden focus:outline-none" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className={`h-6 w-6 ${isScrolled ? "text-gray-900" : "text-white"}`} />
            ) : (
              <Menu className={`h-6 w-6 ${isScrolled ? "text-gray-900" : "text-white"}`} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg p-6">
          <div className="flex flex-col space-y-4">
            <Link 
              to="/about" 
              className="text-gray-600 hover:text-indigo-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              to="/pricing" 
              className="text-gray-600 hover:text-indigo-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link 
              to="/demo" 
              className="text-gray-600 hover:text-indigo-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Book a demo
            </Link>
            <div className="pt-4 flex flex-col space-y-3">
              <Button asChild variant="outline" size="sm">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Log in</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>Sign up free</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
