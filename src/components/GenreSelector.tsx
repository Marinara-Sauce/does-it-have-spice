
import { useState, useEffect } from 'react';
import { CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, Command } from '@/components/ui/command';
import { Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface Genre {
  id: number;
  genre: string;
}

interface GenreSelectorProps {
  selectedGenres: string[];
  onChange: (genres: string[]) => void;
}

export default function GenreSelector({ selectedGenres, onChange }: GenreSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGenres = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('available_genres')
        .select('id, genre');

      if (error) {
        console.error('Error fetching genres:', error);
      } else {
        setGenres(data || []);
      }
      setIsLoading(false);
    };

    fetchGenres();
  }, []);

  const toggleGenre = (genreName: string) => {
    if (selectedGenres.includes(genreName)) {
      onChange(selectedGenres.filter(g => g !== genreName));
    } else {
      onChange([...selectedGenres, genreName]);
    }
  };

  const removeGenre = (genreName: string) => {
    onChange(selectedGenres.filter(g => g !== genreName));
  };

  const filteredGenres = genres.filter(genre => 
    genre.genre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full space-y-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedGenres.map(genre => (
          <Badge 
            key={genre} 
            variant="secondary" 
            className="rounded-full px-3 py-1 cursor-pointer"
            onClick={() => removeGenre(genre)}
          >
            {genre}
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
              {filteredGenres.map((genre) => (
                <CommandItem
                  key={genre.id}
                  value={genre.genre}
                  onSelect={() => toggleGenre(genre.genre)}
                  className="cursor-pointer"
                >
                  <div className={cn(
                    "mr-2 h-4 w-4 flex items-center justify-center rounded-sm border",
                    selectedGenres.includes(genre.genre) ? "bg-primary border-primary" : "opacity-50"
                  )}>
                    {selectedGenres.includes(genre.genre) && <Check className="h-3 w-3 text-primary-foreground" />}
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
