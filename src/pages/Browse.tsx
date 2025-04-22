
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { BookList } from '@/components/BookList';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import PaginationControls from '@/components/PaginationControls';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

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
  const [activeTab, setActiveTab] = useState<string>('smut-level');
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // New: Filters for state
  const [selectedSmutLevels, setSelectedSmutLevels] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const [totalPages, setTotalPages] = useState(0);

  // Statistics query (book counts per genre/smut-level, total)
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['bookStats'],
    queryFn: async (): Promise<BookStats> => {
      try {
        // Get total count
        const { count: total } = await supabase
          .from('aggregated_books')
          .select('*', { count: 'exact', head: true });

        // Get all books for grouping (inefficient for large db, but no group-by support; optimize with views if needed)
        const { data: allBooks } = await supabase
          .from('aggregated_books')
          .select('smut_level, genre')
          .throwOnError();

        const bySmutLevel: { [key: string]: number } = {};
        const byGenre: { [key: string]: number } = {};

        allBooks?.forEach(book => {
          const level = book.smut_level || 'Unknown';
          bySmutLevel[level] = (bySmutLevel[level] || 0) + 1;

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

  // Query to fetch filtered books
  const {
    data: books,
    isLoading: isLoadingBooks,
    refetch: refetchBooks,
  } = useQuery({
    queryKey: [
      'allBooksFiltered',
      selectedSmutLevels,
      selectedGenres,
      currentPage,
      resultsPerPage,
    ],
    queryFn: async () => {
      let query = supabase
        .from('aggregated_books')
        .select('*', { count: 'exact' });

      // Add filtering logic:
      if (selectedSmutLevels.length > 0) {
        // (smut_level is null if none, so include 'Unknown' as null)
        query = query.in('smut_level', selectedSmutLevels.map(level => (level === 'Unknown' ? null : level)));
      }
      if (selectedGenres.length > 0) {
        query = query.in('genre', selectedGenres);
      }

      query = query
        .range((currentPage - 1) * resultsPerPage, currentPage * resultsPerPage - 1)
        .order('title');

      const { data, count, error } = await query;

      if (error) throw error;

      setTotalPages(Math.ceil((count || 0) / resultsPerPage));
      return data || [];
    },
  });

  // Re-fetch when pagination changes
  useEffect(() => {
    refetchBooks();
  }, [currentPage, resultsPerPage, selectedSmutLevels, selectedGenres, refetchBooks]);

  // Clear filters handler
  const handleClearFilters = () => {
    setSelectedSmutLevels([]);
    setSelectedGenres([]);
    setCurrentPage(1);
  };

  // Render filter toggle buttons
  // Use ToggleGroup for multi-selection
  const renderFilterToggles = (data: { [key: string]: number }, type: 'genre' | 'smut_level', selected: string[], setSelected: (v: string[]) => void) => (
    <ToggleGroup
      type="multiple"
      className="flex flex-col gap-2"
      value={selected}
      onValueChange={value => {
        setSelected(value);
        setCurrentPage(1);
      }}
    >
      {Object.entries(data)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, count]) => (
          <ToggleGroupItem
            key={key}
            value={key}
            aria-label={key}
            variant="outline"
            className="justify-between px-3"
          >
            <span>{key}</span>
            <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">{count}</span>
          </ToggleGroupItem>
        ))}
    </ToggleGroup>
  );

  // Loading state
  if (isLoadingStats || isLoadingBooks) {
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
                {/* Filters */}
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
                    <ScrollArea className="h-[320px]">
                      {stats?.bySmutLevel &&
                        renderFilterToggles(stats.bySmutLevel, 'smut_level', selectedSmutLevels, setSelectedSmutLevels)}
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent value="genre" className="mt-0">
                    <ScrollArea className="h-[320px]">
                      {stats?.byGenre &&
                        renderFilterToggles(stats.byGenre, 'genre', selectedGenres, setSelectedGenres)}
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
                {(selectedSmutLevels.length > 0 || selectedGenres.length > 0) && (
                  <Button onClick={handleClearFilters} size="sm" variant="ghost" className="mt-4 w-full">
                    Clear filters
                  </Button>
                )}
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
