import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { LogIn, LogOut, UserPlus, Home, Book, Info, Send, User } from 'lucide-react';

const MobileNav = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/');
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[250px] sm:w-[300px]">
        <div className="flex flex-col h-full py-4">
          <div className="px-2 mb-8">
            <Link to="/" className="text-xl font-bold">
              <span className="gradient-text">Does It Have Smut?</span>
            </Link>
          </div>

          <nav className="flex-1">
            <ul className="flex flex-col gap-1 px-2">
              <li>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link to="/">
                    <Home className="mr-2 h-4 w-4" />
                    Home
                  </Link>
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link to="/browse">
                    <Book className="mr-2 h-4 w-4" />
                    Browse
                  </Link>
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link to="/about">
                    <Info className="mr-2 h-4 w-4" />
                    About
                  </Link>
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link to="/contribute">
                    <Send className="mr-2 h-4 w-4" />
                    Contribute
                  </Link>
                </Button>
              </li>
              {user && (
                <li>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link to="/profile">
                      <User className="mr-2 h-4 w-4" />
                      My Submissions
                    </Link>
                  </Button>
                </li>
              )}
            </ul>
          </nav>

          <div className="border-t pt-4 px-2">
            {user ? (
              <Button variant="outline" className="w-full justify-start" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            ) : (
              <div className="flex flex-col gap-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/auth?tab=login">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Link>
                </Button>
                <Button className="w-full justify-start" asChild>
                  <Link to="/auth?tab=signup">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Sign Up
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
