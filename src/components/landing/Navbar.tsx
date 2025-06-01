
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import UserDropdown from '../navigation/UserDropdown';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isStudent, isTeacher } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Determine dashboard link based on user role
  const dashboardLink = isStudent ? '/student' : isTeacher ? '/teacher' : '/';

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'}`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="text-xl font-bold text-primary">
            LinguaEdgeAI
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/about" className="text-gray-700 hover:text-primary transition-colors">
              About
            </Link>
            {/* Hide Pricing link for students */}
            {!isStudent && (
              <Link to="/pricing" className="text-gray-700 hover:text-primary transition-colors">
                Pricing
              </Link>
            )}
            <Link to="/contact" className="text-gray-700 hover:text-primary transition-colors">
              Contact
            </Link>
            
            {/* Dashboard Button - Only visible for authenticated users */}
            {user && (
              <Link to={dashboardLink}>
                <Button variant="ghost" className="hover:text-primary flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
            )}
            
            {/* Auth actions */}
            {!user ? (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="hover:text-primary">
                    Log in
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-primary hover:bg-primary/90 text-white">Sign up</Button>
                </Link>
              </>
            ) : (
              <UserDropdown />
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-700" 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-4 bg-white rounded-lg shadow-lg">
            <div className="flex flex-col space-y-3 px-4">
              <Link 
                to="/about" 
                className="text-gray-700 hover:text-primary py-2 transition-colors" 
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              {/* Hide Pricing link for students in mobile menu too */}
              {!isStudent && (
                <Link 
                  to="/pricing" 
                  className="text-gray-700 hover:text-primary py-2 transition-colors" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  Pricing
                </Link>
              )}
              <Link 
                to="/contact" 
                className="text-gray-700 hover:text-primary py-2 transition-colors" 
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              
              {/* Dashboard Link - Only visible for authenticated users */}
              {user && (
                <Link 
                  to={dashboardLink} 
                  className="text-gray-700 hover:text-primary py-2 transition-colors flex items-center gap-2" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              )}
              
              {/* Auth actions */}
              {!user ? (
                <>
                  <Link 
                    to="/login" 
                    className="text-gray-700 hover:text-primary py-2 transition-colors" 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Log in
                  </Link>
                  <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                      Sign up free
                    </Button>
                  </Link>
                </>
              ) : (
                <div className="py-2">
                  <UserDropdown />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
