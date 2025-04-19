import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import ContentWarningList from '@/components/ContentWarningList';

interface Book {
  id: string;
  title: string;
  author: string;
  smut_level: string;
  specific_locations: string | null;
  notes: string | null;
  contribution_count: number;
}

interface BookListProps {
  books: Book[];
  isLoading: boolean;
}

const SmutLevelBadge = ({ level }: { level: string }) => {
  const normalizedLevel = level?.toLowerCase() || 'none';

  const colors = {
    none: 'bg-green-100 text-green-800',
    mild: 'bg-blue-100 text-blue-800',
    moderate: 'bg-yellow-100 text-yellow-800',
    explicit: 'bg-red-100 text-red-800',
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${colors[normalizedLevel as keyof typeof colors] || colors.none}`}
    >
      {normalizedLevel.charAt(0).toUpperCase() + normalizedLevel.slice(1)}
    </span>
  );
};

export const BookList: React.FC<BookListProps> = ({ books, isLoading }) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(n => (
          <Card key={n} className="overflow-hidden">
            <div className="animate-pulse">
              <div className="p-6">
                <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No books found</CardTitle>
          <CardDescription>Try adjusting your filters or adding new books.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {books.map(book => (
        <Card
          key={book.id}
          className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate(`/book/${book.id}`)}
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="line-clamp-1">{book.title}</CardTitle>
                <CardDescription>by {book.author}</CardDescription>
              </div>
              <SmutLevelBadge level={book.smut_level} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm mb-2">
              <Users size={16} className="text-muted-foreground" />
              <span>
                {book.contribution_count} contribution{book.contribution_count !== 1 ? 's' : ''}
              </span>
            </div>

            <p className="text-sm mb-3 line-clamp-2">
              {book.notes || 'No additional notes available.'}
            </p>

            {book.specific_locations && <ContentWarningList locations={book.specific_locations} />}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              View Details
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
