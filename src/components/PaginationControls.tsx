import { Dispatch } from 'react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useIsMobile } from '@/hooks/use-mobile';

interface PaginationControlsProps {
  resultsPerPage: number;
  setResultsPerPage: Dispatch<React.SetStateAction<number>>;
  currentPage: number;
  setCurrentPage: Dispatch<React.SetStateAction<number>>;
  totalPages: number;
}

export default function PaginationControls({
  resultsPerPage,
  setResultsPerPage,
  currentPage,
  setCurrentPage,
  totalPages,
}: Readonly<PaginationControlsProps>) {
  const isMobile = useIsMobile();

  return (
    <div className="flex items-center gap-4 mt-4">
      <div className="flex-grow flex items-center gap-2">
        <p className="text-sm font-medium text-muted-foreground">Results Per Page</p>
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <Button variant="outline" size="sm" className="relative">
              <div className="flex items-center gap-1">
                {resultsPerPage}
                <span>▼</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="border border-gray-200 rounded-md shadow-lg p-1 w-24"
            align="start"
          >
            <DropdownMenuItem
              className="px-2 py-1 text-sm hover:text-primary rounded-md cursor-pointer"
              onClick={() => {
                setResultsPerPage(5);
                setCurrentPage(1);
              }}
            >
              5
            </DropdownMenuItem>
            <DropdownMenuItem
              className="px-2 py-1 text-sm hover:text-primary rounded-md cursor-pointer"
              onClick={() => {
                setResultsPerPage(10);
                setCurrentPage(1);
              }}
            >
              10
            </DropdownMenuItem>
            <DropdownMenuItem
              className="px-2 py-1 text-sm hover:text-primary rounded-md cursor-pointer"
              onClick={() => {
                setResultsPerPage(20);
                setCurrentPage(1);
              }}
            >
              20
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* Previous Button */}
      <Button
        variant="outline"
        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        size="sm"
      >
        Previous
      </Button>

      {/* Page Buttons */}
      {!isMobile && (
        <div className="flex items-center gap-1">
          {currentPage > 3 && (
            <>
              <Button variant="outline" onClick={() => setCurrentPage(1)} size="sm">
                1
              </Button>
              <p className="text-muted-foreground">...</p>
            </>
          )}

          {Array.from({ length: 5 }, (_, index) => {
            const page =
              currentPage <= 3
                ? index + 1
                : currentPage >= totalPages - 2
                  ? totalPages - 4 + index
                  : currentPage - 2 + index;

            if (page < 1 || page > totalPages) return null;

            return (
              <Button
                key={page}
                variant={page === currentPage ? 'default' : 'outline'}
                onClick={() => setCurrentPage(page)}
                disabled={page === currentPage}
                size="sm"
              >
                {page}
              </Button>
            );
          })}

          {currentPage < totalPages - 2 && (
            <>
              <p className="text-muted-foreground">...</p>
              <Button variant="outline" onClick={() => setCurrentPage(totalPages)} size="sm">
                {totalPages}
              </Button>
            </>
          )}
        </div>
      )}

      {/* Next Button */}
      <Button
        variant="outline"
        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
        size="sm"
      >
        Next
      </Button>
    </div>
  );
}
