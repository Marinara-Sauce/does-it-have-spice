import { useState, useEffect, useCallback, useRef } from 'react';
import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Command,
} from '@/components/ui/command';
import { Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { cn, toTitleCase } from '@/lib/utils';
import { Genre } from '@/pages/Contribute';
import { Skeleton } from './ui/skeleton';

interface GenreSelectorProps {
  selectedGenres: Genre[];
  onChange: (genres: Genre[]) => void;
}

const MAX_GENRES_PER_PAGE = 15;

export default function GenreSelector({ selectedGenres, onChange }: GenreSelectorProps) {
  const [search, setSearch] = useState('');
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentGenrePage, setCurrentGenrePage] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const commandRef = useRef<HTMLDivElement>(null);
  const isFirstLoad = useRef(true);

  const fetchGenres = useCallback(
    async (page: number, searchTerm: string, shouldReset: boolean) => {
      setIsLoading(true);
      const startingIndex = page * MAX_GENRES_PER_PAGE;

      const { data, error } = await supabase
        .from('aggregated_genres')
        .select('genre, genre_count, genre_id')
        .ilike('genre', `%${searchTerm}%`)
        .range(startingIndex, startingIndex + MAX_GENRES_PER_PAGE - 1)
        .order('genre_count', { ascending: false });

      if (error) {
        console.error('Error fetching genres:', error);
        setIsLoading(false);
        return;
      }

      if (data.length < MAX_GENRES_PER_PAGE) {
        setHasMore(false);
      }

      if (shouldReset || page === 0) {
        setGenres(data as Genre[]);
      } else {
        setGenres(prev => {
          const newGenres = data as Genre[];
          const uniqueGenres = newGenres.filter(
            newGenre => !prev.some(existingGenre => existingGenre.genre_id === newGenre.genre_id),
          );
          return [...prev, ...uniqueGenres];
        });
      }

      setIsLoading(false);
      isFirstLoad.current = false;
    },
    [],
  );

  useEffect(() => {
    if (isFocused || isInteracting) {
      const shouldReset = isFirstLoad.current || search !== '';
      if (shouldReset) {
        setCurrentGenrePage(0);
        setHasMore(true);
      }
      fetchGenres(currentGenrePage, search, shouldReset);
    }
  }, [search, fetchGenres, isFocused, isInteracting, currentGenrePage]);

  const toggleGenre = (genre: Genre) => {
    if (selectedGenres.some(g => g.genre_id === genre.genre_id)) {
      onChange(selectedGenres.filter(g => g.genre_id !== genre.genre_id));
    } else {
      onChange([...selectedGenres, genre]);
    }
  };

  const removeGenre = (genre: Genre) => {
    onChange(selectedGenres.filter(g => g.genre_id !== genre.genre_id));
  };

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!scrollContainerRef.current || isLoading || !hasMore || (!isFocused && !isInteracting)) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      const nextPage = currentGenrePage + 1;
      setCurrentGenrePage(nextPage);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (commandRef.current && !commandRef.current.contains(event.target as Node)) {
        setIsFocused(false);
        setIsInteracting(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full space-y-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedGenres.map(genre => (
          <Badge
            key={genre.genre_id}
            variant="secondary"
            className="rounded-full px-3 py-1 cursor-pointer"
            onClick={() => removeGenre(genre)}
          >
            {toTitleCase(genre.genre)}
            <span className="ml-1">×</span>
          </Badge>
        ))}
      </div>

      <Command ref={commandRef} className="rounded-md border">
        <CommandInput
          placeholder="Search genres..."
          value={search}
          onValueChange={setSearch}
          onFocus={() => setIsFocused(true)}
          className="h-9"
        />
        {(isFocused || isInteracting) && (
          <CommandList
            ref={scrollContainerRef}
            onScroll={handleScroll}
            onMouseEnter={() => setIsInteracting(true)}
            onMouseLeave={() => setIsInteracting(false)}
          >
            <CommandGroup>
              {genres.map(genre => (
                <CommandItem
                  key={genre.genre_id}
                  value={genre.genre}
                  onSelect={() => toggleGenre(genre)}
                  className="cursor-pointer"
                >
                  <div
                    className={cn(
                      'mr-2 h-4 w-4 flex items-center justify-center rounded-sm border',
                      selectedGenres.some(g => g.genre_id === genre.genre_id)
                        ? 'bg-primary border-primary'
                        : 'opacity-50',
                    )}
                  >
                    {selectedGenres.some(g => g.genre_id === genre.genre_id) && (
                      <Check className="h-3 w-3 text-primary-foreground" />
                    )}
                  </div>
                  {toTitleCase(genre.genre)}
                </CommandItem>
              ))}
              {isLoading && (
                <CommandEmpty>
                  <Skeleton />
                </CommandEmpty>
              )}
            </CommandGroup>
          </CommandList>
        )}
      </Command>
    </div>
  );
}
