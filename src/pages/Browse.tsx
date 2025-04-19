import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { BookList } from '@/components/BookList';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import PaginationControls from '@/components/PaginationControls';

interface BookStats {
  total: number;
  bySmutLevel: {
    [key: string]: number;
  };
  byGenre: {
    [key: string]: number;
  };
}

const Browse = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('smut-level');

  const [totalPages, setTotalPages] = useState(0);
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['bookStats'],
    queryFn: async (): Promise<BookStats> => {
      try {
        // Get total count
        const { count: total } = await supabase
          .from('aggregated_books')
          .select('*', { count: 'exact', head: true });

        // Get counts by smut level
        const { data: smutLevels } = await supabase
          .from('aggregated_books')
          .select('smut_level, count')
          .select('smut_level, id')
          .throwOnError();

        // Get counts by genre
        const { data: genres } = await supabase
          .from('aggregated_books')
          .select('genre, id')
          .not('genre', 'is', null)
          .throwOnError();

        const bySmutLevel: { [key: string]: number } = {};
        const byGenre: { [key: string]: number } = {};

        // Count smut levels
        smutLevels?.forEach(book => {
          const level = book.smut_level || 'Unknown';
          bySmutLevel[level] = (bySmutLevel[level] || 0) + 1;
        });

        // Count genres
        genres?.forEach(book => {
          if (book.genre) {
            byGenre[book.genre] = (byGenre[book.genre] || 0) + 1;
          }
        });

        return {
          total: total || 0,
          bySmutLevel,
          byGenre,
        };
      } catch (error) {
        console.error('Error fetching book stats:', error);
        toast.error('Error loading book statistics');
        return { total: 0, bySmutLevel: {}, byGenre: {} };
      }
    },
  });

  const {
    data: books,
    isLoading: isLoadingBooks,
    refetch: refetchBooks,
  } = useQuery({
    queryKey: ['allBooks'],
    queryFn: async () => {
      const { data, count, error } = await supabase
        .from('aggregated_books')
        .select('*', { count: 'exact' })
        .range((currentPage - 1) * resultsPerPage, currentPage * resultsPerPage - 1)
        .order('title');

      if (error) throw error;

      setTotalPages(Math.ceil(count / resultsPerPage));
      return data || [];
    },
  });

  useEffect(() => {
    refetchBooks();
  }, [currentPage, resultsPerPage, refetchBooks]);

  const handleFilter = (filter: string, value: string) => {
    navigate(`/search?${filter}=${encodeURIComponent(value)}`);
  };

  const renderFilterButtons = (data: { [key: string]: number }, type: 'genre' | 'smut_level') => {
    return Object.entries(data)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, count]) => (
        <Button
          key={key}
          variant="outline"
          className="justify-between"
          onClick={() => handleFilter(type, key)}
        >
          <span>{key}</span>
          <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">{count}</span>
        </Button>
      ));
  };

  if (isLoading || isLoadingBooks) {
    return (
      <Layout>
        <div className="container mx-auto py-8 animate-pulse">
          <div className="h-8 w-48 bg-muted rounded mb-4"></div>
          <div className="h-24 bg-muted rounded"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters Panel */}
          <div className="w-full md:w-64 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Browse Books</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {stats?.total || 0} books in database
                </p>
                <Tabs defaultValue="smut-level" className="w-full" onValueChange={setActiveTab}>
                  <TabsList className="w-full mb-4">
                    <TabsTrigger value="smut-level" className="flex-1">
                      Content Level
                    </TabsTrigger>
                    <TabsTrigger value="genre" className="flex-1">
                      Genre
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="smut-level" className="mt-0">
                    <ScrollArea className="h-[400px]">
                      <div className="flex flex-col gap-2">
                        {stats?.bySmutLevel && renderFilterButtons(stats.bySmutLevel, 'smut_level')}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent value="genre" className="mt-0">
                    <ScrollArea className="h-[400px]">
                      <div className="flex flex-col gap-2">
                        {stats?.byGenre && renderFilterButtons(stats.byGenre, 'genre')}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Books List */}
          <div className="flex-1">
            <BookList books={books || []} isLoading={isLoadingBooks} />
            <PaginationControls
              resultsPerPage={resultsPerPage}
              setResultsPerPage={setResultsPerPage}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Browse;
