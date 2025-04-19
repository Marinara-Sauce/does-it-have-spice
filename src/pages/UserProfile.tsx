import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EditBookModal } from '@/components/EditBookModal';

interface Book {
  id: string;
  title: string;
  author: string;
  genre: string | null;
  smut_level: string;
  specific_locations: string | null;
  notes: string | null;
  isbn: string | null;
  created_at: string;
}

export function UserProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);

  const [totalPages, setTotalPages] = useState(0);
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchUserSubmissions = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, count, error } = await supabase
        .from('books')
        .select('*', { count: 'exact' })
        .eq('created_by', user.id)
        .range((currentPage - 1) * resultsPerPage, currentPage * resultsPerPage - 1)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setSubmissions(data || []);
      setTotalPages(Math.ceil(count / resultsPerPage));
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('Failed to load your submissions');
    } finally {
      setLoading(false);
    }
  }, [user, currentPage, resultsPerPage]);

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate('/auth?tab=login');
      return;
    }

    fetchUserSubmissions();
  }, [user, navigate, fetchUserSubmissions]);

  const handleEdit = useCallback((book: Book) => {
    setCurrentBook(book);
    setEditDialogOpen(true);
  }, []);

  const handleDelete = useCallback((book: Book) => {
    setCurrentBook(book);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = async () => {
    if (!currentBook) return;

    try {
      const { error } = await supabase.from('books').delete().eq('id', currentBook.id);

      if (error) {
        throw error;
      }

      toast.success('Submission deleted successfully');
      fetchUserSubmissions();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting submission:', error);
      toast.error('Failed to delete submission');
    }
  };

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, []);

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">My Submissions</h1>

        {loading ? (
          <div className="text-center py-8">Loading your submissions...</div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">You haven't made any submissions yet.</p>
            <Button onClick={() => navigate('/contribute')}>Contribute Now</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableCaption>A list of your book content submissions</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Smut Level</TableHead>
                  <TableHead>Submitted On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map(book => (
                  <TableRow key={book.id}>
                    <TableCell className="font-medium">{book.title}</TableCell>
                    <TableCell>{book.author}</TableCell>
                    <TableCell>{book.smut_level}</TableCell>
                    <TableCell>{formatDate(book.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleEdit(book)}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(book)}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center gap-4">
              {/* Previous Button */}
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              {/* Page Buttons */}
              <div className="flex items-center gap-1">
                {currentPage > 3 && (
                  <>
                    <Button variant="outline" onClick={() => setCurrentPage(1)}>
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
                    >
                      {page}
                    </Button>
                  );
                })}

                {currentPage < totalPages - 2 && (
                  <>
                    <p className="text-muted-foreground">...</p>
                    <Button variant="outline" onClick={() => setCurrentPage(totalPages)}>
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>

              {/* Next Button */}
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Edit Book Modal Component */}
        <EditBookModal
          book={currentBook}
          isOpen={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={fetchUserSubmissions}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to delete your submission for "{currentBook?.title}"?</p>
            <p className="text-muted-foreground text-sm">This action cannot be undone.</p>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}

export default UserProfile;
