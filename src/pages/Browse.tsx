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
import { toTitleCase } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface BookStats {
  total: number;
  bySmutLevel: {
    [key: string]: number;
  };
}

const Browse = () => {
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedSmutLevels, setSelectedSmutLevels] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const [genreLimit, setGenreLimit] = useState(10);
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

        allBooks?.forEach(book => {
          const level = book.smut_level || 'Unknown';
          bySmutLevel[level] = (bySmutLevel[level] || 0) + 1;
        });

        return {
          total: total || 0,
          bySmutLevel,
        };
      } catch (error) {
        console.error('Error fetching book stats:', error);
        toast.error('Error loading book statistics');
        return { total: 0, bySmutLevel: {} };
      }
    },
  });

  // Modified: Server-side filtering for both smut levels and genres
  const {
    data: books,
    isLoading: isLoadingBooks,
    refetch: refetchBooks,
  } = useQuery({
    queryKey: ['allBooksFiltered', selectedSmutLevels, selectedGenres, currentPage, resultsPerPage],
    queryFn: async () => {
      try {
        let query = supabase.from('aggregated_books').select('*', { count: 'exact' });

        // Filter by smut levels if any are selected
        if (selectedSmutLevels.length > 0) {
          query = query.in('smut_level', selectedSmutLevels);
        }

        if (selectedGenres.length > 0) {
          query = query.contains('genre', selectedGenres);
        }

        // Apply pagination after the filters
        const { data, count, error } = await query
          .range((currentPage - 1) * resultsPerPage, currentPage * resultsPerPage - 1)
          .order('title');

        if (error) throw error;

        // Calculate total pages based on the filtered count
        const totalCount = count || 0;
        setTotalPages(Math.ceil(totalCount / resultsPerPage));

        return data || [];
      } catch (error) {
        console.error('Error fetching filtered books:', error);
        toast.error('Error loading books with the selected filters');
        return [];
      }
    },
  });

  function increaseGenreLimit() {
    setGenreLimit(prevLimit => prevLimit + 10);
  }

  const { data: genres, isLoading: isLoadingGenres } = useQuery({
    queryKey: ['bookGenres', genreLimit],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('aggregated_genres')
          .select('*')
          .eq('is_ignored', false)
          .order('genre_count', { ascending: false })
          .limit(genreLimit);

        if (error) throw error;

        const genresList: Record<string, number> = {};
        data?.forEach(genre => {
          if (genre.genre && genre.genre_count) {
            genresList[genre.genre] = genre.genre_count;
          }
        });

        return genresList || {};
      } catch (error) {
        console.error('Error fetching genres:', error);
        toast.error('Error loading genres');
        return {};
      }
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

  const renderFilterToggles = (
    data: { [key: string]: number },
    selected: string[],
    setSelected: (v: string[]) => void,
    label: string,
    loading: boolean = false,
  ) => (
    <div className="mb-6 last:mb-0">
      <h4 className="font-semibold mb-2 text-sm text-muted-foreground">{label}</h4>
      {loading && <Skeleton className="h-4 w-full mb-2" />}
      <ToggleGroup
        type="multiple"
        className="grid grid-cols-2"
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
              className="justify-between px-3 w-full"
            >
              <span className="truncate">{toTitleCase(key)}</span>
              <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">{count}</span>
            </ToggleGroupItem>
          ))}
      </ToggleGroup>
    </div>
  );

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/3">
            <Card>
              <CardHeader>
                <CardTitle>Browse Books</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {stats?.total || 0} books in database
                </p>
                <div>
                  {stats?.bySmutLevel &&
                    renderFilterToggles(
                      stats.bySmutLevel,
                      selectedSmutLevels,
                      setSelectedSmutLevels,
                      'Content Level',
                      isLoadingStats,
                    )}
                  {genres &&
                    renderFilterToggles(
                      genres,
                      selectedGenres,
                      setSelectedGenres,
                      'Genre',
                      isLoadingGenres,
                    )}
                  <Button onClick={increaseGenreLimit} className="w-full" variant="ghost">
                    Show more genres
                  </Button>
                </div>
                {(selectedSmutLevels.length > 0 || selectedGenres.length > 0) && (
                  <Button
                    onClick={handleClearFilters}
                    size="sm"
                    variant="ghost"
                    className="mt-4 w-full"
                  >
                    Clear filters
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="flex-1">
            {isLoadingBooks && <Skeleton className="h-4 w-48 mb-4" />}
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
