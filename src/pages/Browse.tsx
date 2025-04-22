
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { BookList } from '@/components/BookList';
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
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedSmutLevels, setSelectedSmutLevels] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const [totalPages, setTotalPages] = useState(0);

  // Modified: Split genres at commas and properly aggregate book counts
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['bookStats'],
    queryFn: async (): Promise<BookStats> => {
      try {
        const { count: total } = await supabase
          .from('aggregated_books')
          .select('*', { count: 'exact', head: true });

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
            book.genre.split(',').map(g => g.trim()).forEach(singleGenre => {
              if (singleGenre) {
                byGenre[singleGenre] = (byGenre[singleGenre] || 0) + 1;
              }
            });
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

  // Modified: Custom filter for genres that checks any match in CSV genre lists
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

      if (selectedSmutLevels.length > 0) {
        query = query.in('smut_level', selectedSmutLevels.map(level => (level === 'Unknown' ? null : level)));
      }

      // We'll fetch candidates and filter for genre intersection in JS
      query = query
        .range((currentPage - 1) * resultsPerPage, currentPage * resultsPerPage - 1)
        .order('title');

      const { data, count, error } = await query;

      if (error) throw error;

      let filtered = data || [];

      if (selectedGenres.length > 0) {
        filtered = filtered.filter(book => {
          if (!book.genre) return false;
          const bookGenres = book.genre.split(',').map((g: string) => g.trim());
          // If any of the selected genres are present in the book's genres
          return selectedGenres.some(selected => bookGenres.includes(selected));
        });
      }

      setTotalPages(Math.ceil(((selectedGenres.length > 0 ? filtered.length : (count || 0))) / resultsPerPage));
      return filtered;
    },
  });

  useEffect(() => {
    refetchBooks();
  }, [currentPage, resultsPerPage, selectedSmutLevels, selectedGenres, refetchBooks]);

  const handleClearFilters = () => {
    setSelectedSmutLevels([]);
    setSelectedGenres([]);
    setCurrentPage(1);
  };

  // UI: Render both Content Level and Genre filters side by side
  const renderSideBySideToggles = (
    bySmutLevel: { [key: string]: number },
    selectedSmutLevels: string[],
    setSelectedSmutLevels: (v: string[]) => void,
    byGenre: { [key: string]: number },
    selectedGenres: string[],
    setSelectedGenres: (v: string[]) => void
  ) => (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1">
        <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Content Level</h4>
        <ToggleGroup
          type="multiple"
          className="grid grid-cols-2"
          value={selectedSmutLevels}
          onValueChange={value => {
            setSelectedSmutLevels(value);
            setCurrentPage(1);
          }}
        >
          {Object.entries(bySmutLevel)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, count]) => (
              <ToggleGroupItem
                key={key}
                value={key}
                aria-label={key}
                variant="outline"
                className="justify-between px-3 w-full"
              >
                <span>{key}</span>
                <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">{count}</span>
              </ToggleGroupItem>
            ))}
        </ToggleGroup>
      </div>
      <div className="flex-1">
        <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Genre</h4>
        <ToggleGroup
          type="multiple"
          className="grid grid-cols-2"
          value={selectedGenres}
          onValueChange={value => {
            setSelectedGenres(value);
            setCurrentPage(1);
          }}
        >
          {Object.entries(byGenre)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, count]) => (
              <ToggleGroupItem
                key={key}
                value={key}
                aria-label={key}
                variant="outline"
                className="justify-between px-3 w-full"
              >
                <span>{key}</span>
                <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">{count}</span>
              </ToggleGroupItem>
            ))}
        </ToggleGroup>
      </div>
    </div>
  );

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
          <div className="w-full md:w-80 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Browse Books</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {stats?.total || 0} books in database
                </p>
                {stats?.bySmutLevel && stats?.byGenre &&
                  renderSideBySideToggles(
                    stats.bySmutLevel,
                    selectedSmutLevels,
                    setSelectedSmutLevels,
                    stats.byGenre,
                    selectedGenres,
                    setSelectedGenres
                  )}
                {(selectedSmutLevels.length > 0 || selectedGenres.length > 0) && (
                  <Button onClick={handleClearFilters} size="sm" variant="ghost" className="mt-4 w-full">
                    Clear filters
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
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

