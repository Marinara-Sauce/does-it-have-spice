
import React from 'react';
import { Link } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto py-4 px-4 sm:px-6 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">
            <span className="gradient-text">Does It Have Smut?</span>
          </Link>
          <nav>
            <ul className="flex space-x-4">
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
          </nav>
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
