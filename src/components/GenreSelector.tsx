import { useState, useEffect } from 'react';
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
import { cn } from '@/lib/utils';
import { Genre } from '@/pages/Contribute';

interface GenreSelectorProps {
  selectedGenres: Genre[];
  onChange: (genres: Genre[]) => void;
}

export default function GenreSelector({ selectedGenres, onChange }: GenreSelectorProps) {
  const [search, setSearch] = useState('');
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGenres = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('aggregated_genres')
        .select('genre, genre_count, genre_id')
        .order('genre_count', { ascending: false });

      if (error) {
        console.error('Error fetching genres:', error);
      } else {
        setGenres(data || []);
      }
      setIsLoading(false);
    };

    fetchGenres();
  }, []);

  const toggleGenre = (genre: Genre) => {
    if (selectedGenres.includes(genre)) {
      onChange(selectedGenres.filter(g => g !== genre));
    } else {
      onChange([...selectedGenres, genre]);
    }
  };

  const removeGenre = (genre: Genre) => {
    onChange(selectedGenres.filter(g => g !== genre));
  };

  const filteredGenres = genres.filter(genre =>
    genre.genre.toLowerCase().includes(search.toLowerCase()),
  );

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
            {genre.genre}
            <span className="ml-1">×</span>
          </Badge>
        ))}
      </div>

      <Command className="rounded-lg border shadow-md">
        <CommandInput
          placeholder="Search genres..."
          value={search}
          onValueChange={setSearch}
          className="h-9"
        />
        <CommandList>
          {isLoading ? (
            <CommandEmpty>Loading genres...</CommandEmpty>
          ) : filteredGenres.length === 0 ? (
            <CommandEmpty>No genres found.</CommandEmpty>
          ) : (
            <CommandGroup>
              {filteredGenres.map(genre => (
                <CommandItem
                  key={genre.genre}
                  value={genre.genre}
                  onSelect={() => toggleGenre(genre)}
                  className="cursor-pointer"
                >
                  <div
                    className={cn(
                      'mr-2 h-4 w-4 flex items-center justify-center rounded-sm border',
                      selectedGenres.includes(genre) ? 'bg-primary border-primary' : 'opacity-50',
                    )}
                  >
                    {selectedGenres.includes(genre) && (
                      <Check className="h-3 w-3 text-primary-foreground" />
                    )}
                  </div>
                  {genre.genre}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </div>
  );
}
