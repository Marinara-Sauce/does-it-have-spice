
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookOpen, ChevronLeft, BookText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ContentWarningList from '@/components/ContentWarningList';

type Book = {
  id: string;
  title: string;
  author: string;
  genre?: string;
  smut_level: string;
  specific_locations: string | null;
  notes: string | null;
  isbn: string | null;
  contribution_count?: number;
};

const SmutLevelBadge = ({ level }: { level: string }) => {
  const normalizedLevel = level?.toLowerCase() || 'none';
  
  const colors = {
    none: "bg-green-100 text-green-800",
    mild: "bg-blue-100 text-blue-800",
    moderate: "bg-yellow-100 text-yellow-800",
    explicit: "bg-red-100 text-red-800"
  };
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[normalizedLevel as keyof typeof colors] || colors.none}`}>
      {normalizedLevel.charAt(0).toUpperCase() + normalizedLevel.slice(1)}
    </span>
  );
};

const BookDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookDetails = async () => {
      if (!id) return;
      
      setIsLoading(true);
      
      try {
        // Query from aggregated_books view instead of books table
        const { data, error } = await supabase
          .from('aggregated_books')
          .select('*')
          .eq('id', id)
          .maybeSingle(); // Use maybeSingle() instead of single() to avoid errors when no rows are found
        
        if (error) {
          console.error('Error fetching book details:', error);
          toast.error('Failed to load book details');
          setBook(null);
        } else if (data) {
          setBook(data);
        } else {
          console.log('No book found with ID:', id);
          setBook(null);
        }
      } catch (error) {
        console.error('Exception fetching book details:', error);
        toast.error('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookDetails();
  }, [id]);

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-6 -ml-2" 
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to results
        </Button>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-12 bg-primary/20 rounded-full mb-4"></div>
              <div className="h-4 w-48 bg-primary/20 rounded mb-2"></div>
              <div className="h-3 w-32 bg-primary/20 rounded"></div>
            </div>
          </div>
        ) : book ? (
          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden shadow-md">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl md:text-3xl mb-2">{book.title}</CardTitle>
                    <CardDescription className="text-lg">by {book.author}</CardDescription>
                  </div>
                  <SmutLevelBadge level={book.smut_level} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="mb-6">
                      <h3 className="text-lg font-medium mb-2">Book Information</h3>
                      <div className="space-y-2">
                        {book.genre && (
                          <div className="flex items-center gap-2 text-sm">
                            <BookOpen size={16} className="text-muted-foreground" />
                            <span className="font-medium">Genre:</span> 
                            <span>{book.genre}</span>
                          </div>
                        )}
                        
                        {book.contribution_count && (
                          <div className="flex items-center gap-2 text-sm">
                            <BookOpen size={16} className="text-muted-foreground" />
                            <span className="font-medium">Contributions:</span> 
                            <span>{book.contribution_count}</span>
                          </div>
                        )}
                        
                        {book.isbn && (
                          <div className="flex items-center gap-2 text-sm">
                            <BookText size={16} className="text-muted-foreground" />
                            <span className="font-medium">ISBN:</span> 
                            <span>{book.isbn}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {book.notes && (
                      <div className="mb-6">
                        <h3 className="text-lg font-medium mb-2">Notes</h3>
                        <p className="text-sm">{book.notes}</p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <div className="mb-6">
                      <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                        Content Level
                        <SmutLevelBadge level={book.smut_level} />
                      </h3>
                      <p className="text-sm mb-4">
                        {book.smut_level === 'none' && 'This book contains no adult content.'}
                        {book.smut_level === 'mild' && 'This book contains mild references to adult content.'}
                        {book.smut_level === 'moderate' && 'This book contains moderate adult content.'}
                        {book.smut_level === 'explicit' && 'This book contains explicit adult content.'}
                      </p>
                    </div>
                    
                    {book.specific_locations && <ContentWarningList locations={book.specific_locations} />}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-16">
            <h2 className="text-xl font-semibold mb-2">Book not found</h2>
            <p className="text-muted-foreground mb-6">
              We couldn't find the book you're looking for.
            </p>
            <Button variant="outline" onClick={() => navigate('/search')}>
              Return to search
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BookDetails;
