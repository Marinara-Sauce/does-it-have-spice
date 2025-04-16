
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { LogIn, LogOut, UserPlus } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import MobileNav from '@/components/MobileNav';
import { useIsMobile } from '@/hooks/use-mobile';
import { ThemeToggle } from './ui/ThemeToggle';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto py-4 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isMobile && <MobileNav />}
            
            {!isMobile && 
              <Link to="/" className="text-2xl font-bold">
                <span className="gradient-text">Does It Have Smut?</span>
              </Link>
            }
          </div>
          
          {location.pathname !== '/' ? 
            <div className="flex-1 flex justify-center max-w-md mx-4">
              <SearchBar className="w-full" />
            </div>
          : null}

          {location.pathname === '/' && isMobile ? (
            <div className="flex items-center gap-2">
              {user ? (
                  <Button variant="outline" size="sm" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/auth?tab=login">
                        <LogIn className="h-4 w-4 mr-2" />
                        Login
                      </Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link to="/auth?tab=signup">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Sign Up
                      </Link>
                    </Button>
                  </>
                )
              }
              <ThemeToggle />
            </div>
          ) : null}
          
          {!isMobile && (
            <nav className="hidden md:flex items-center">
              <ul className="flex space-x-4 mr-4">
                <li>
                  <Link to="/" className="text-foreground hover:text-primary transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-foreground hover:text-primary transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/contribute" className="text-foreground hover:text-primary transition-colors">
                    Contribute
                  </Link>
                </li>
              </ul>
              <div className="flex gap-2">
                {user ? (
                  <Button variant="outline" size="sm" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/auth?tab=login">
                        <LogIn className="h-4 w-4 mr-2" />
                        Login
                      </Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link to="/auth?tab=signup">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Sign Up
                      </Link>
                    </Button>
                  </>
                )}
                <ThemeToggle />
              </div>
            </nav>
          )}
        </div>
      </header>
      <main className="flex-grow">
        {children}
      </main>
      <footer className="py-6 border-t">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center text-muted-foreground">
            <p>© {new Date().getFullYear()} Does It Have Smut? - A reader's guide to book content</p>
            <p className="text-sm mt-1">Not affiliated with any publisher. Content is user-contributed.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
