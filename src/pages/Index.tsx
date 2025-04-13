
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import Layout from '@/components/Layout';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 sm:px-6">
        <div className="max-w-3xl w-full text-center mb-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
            <span className="gradient-text">Does It Have Smut?</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Find out if a book contains adult content and which pages to avoid if needed.
          </p>
          
          <form onSubmit={handleSearch} className="w-full max-w-xl mx-auto flex flex-col sm:flex-row gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                type="text"
                placeholder="Search for a book by title or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Search
            </Button>
          </form>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
          <div className="rounded-lg border p-6 hover:shadow-md transition-shadow text-center">
            <h3 className="text-lg font-medium mb-2">Find Content Warnings</h3>
            <p className="text-muted-foreground">Quickly see if a book contains adult content and how explicit it is.</p>
          </div>
          <div className="rounded-lg border p-6 hover:shadow-md transition-shadow text-center">
            <h3 className="text-lg font-medium mb-2">Locate Specific Pages</h3>
            <p className="text-muted-foreground">Get page numbers and chapters to skip content you're not comfortable with.</p>
          </div>
          <div className="rounded-lg border p-6 hover:shadow-md transition-shadow text-center">
            <h3 className="text-lg font-medium mb-2">Community Driven</h3>
            <p className="text-muted-foreground">Our database grows through reader contributions. Help others by adding books.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
