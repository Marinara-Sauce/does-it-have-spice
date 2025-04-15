import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, AlertTriangle, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type Book = {
  id: string;
  title: string;
  author: string;
  smut_level: string;
  specific_locations: string | null;
  notes: string | null;
  isbn: string | null;
  contribution_count: number;
};

const SmutLevelBadge = ({ level }: { level: string }) => {
  const colors = {
    none: "bg-green-100 text-green-800",
    mild: "bg-blue-100 text-blue-800",
    moderate: "bg-yellow-100 text-yellow-800",
    explicit: "bg-red-100 text-red-800"
  };
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[level as keyof typeof colors] || colors.none}`}>
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </span>
  );
};

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search).get('q') || '';
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('aggregated_books')
        .select('*')
        .or(`title.ilike.%${query}%,author.ilike.%${query}%`);
      
      if (error) {
        console.error('Error fetching search results:', error);
        setSearchResults([]);
      } else {
        setSearchResults(data || []);
      }
      
      setIsLoading(false);
    };

    if (query) {
      fetchBooks();
    } else {
      setSearchResults([]);
      setIsLoading(false);
    }
  }, [query]);

  const handleViewDetails = (bookId: string) => {
    navigate(`/book/${bookId}`);
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Search Results</h1>
          <p className="text-muted-foreground">
            Showing results for: <span className="font-medium text-foreground">"{query}"</span>
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-12 bg-primary/20 rounded-full mb-4"></div>
              <div className="h-4 w-48 bg-primary/20 rounded mb-2"></div>
              <div className="h-3 w-32 bg-primary/20 rounded"></div>
            </div>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((book) => (
              <Card 
                key={book.id} 
                className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleViewDetails(book.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="line-clamp-1">{book.title}</CardTitle>
                      <CardDescription>by {book.author}</CardDescription>
                    </div>
                    <SmutLevelBadge level={book.smut_level || 'none'} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <Users size={16} className="text-muted-foreground" />
                    <span>{book.contribution_count} contribution{book.contribution_count !== 1 ? 's' : ''}</span>
                  </div>
                  
                  <p className="text-sm mb-3 line-clamp-2">{book.notes || "No additional notes available."}</p>
                  
                  {book.specific_locations && (
                    <div className="mt-4 p-3 bg-muted rounded-md">
                      <div className="flex gap-2 items-center mb-2 text-sm font-medium">
                        <AlertTriangle size={16} className="text-amber-500" />
                        <span>Content to avoid:</span>
                      </div>
                      <p className="text-sm line-clamp-2">{book.specific_locations}</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">View Details</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h2 className="text-xl font-semibold mb-2">No results found</h2>
            <p className="text-muted-foreground mb-6">
              We couldn't find any books matching "{query}".
            </p>
            <Button variant="outline" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SearchResults;
