import { useState, useMemo, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
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
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';

interface Location {
  startChapter: string;
  endChapter: string;
  startPage: string;
  endPage: string;
}

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

interface EditBookFormValues {
  title: string;
  author: string;
  genre: string;
  smut_level: string;
  specific_locations: Location[];
  notes: string;
  isbn: string;
}

interface EditBookModalProps {
  book: Book | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

function parseFormattedLocations(formattedLocations: string): Location[] {
  if (!formattedLocations) return [];

  return formattedLocations.split(',').map((section) => {
    const chapterMatch = section.match(/Chapters (\d+)(?:-(\d+))?/);
    const pageMatch = section.match(/Pages (\d+)(?:-(\d+))?/);

    return {
      startChapter: chapterMatch ? chapterMatch[1] : '',
      endChapter: chapterMatch && chapterMatch[2] ? chapterMatch[2] : chapterMatch ? chapterMatch[1] : '',
      startPage: pageMatch ? pageMatch[1] : '',
      endPage: pageMatch && pageMatch[2] ? pageMatch[2] : pageMatch ? pageMatch[1] : '',
    };
  });
}

export function EditBookModal({ book, isOpen, onOpenChange, onSuccess }: EditBookModalProps) {
  const form = useForm<EditBookFormValues>();
  
  // Reset form when book changes
  useEffect(() => {
    if (book) {
      form.reset({
        title: book.title,
        author: book.author,
        genre: book.genre || '',
        smut_level: book.smut_level,
        specific_locations: parseFormattedLocations(book.specific_locations) || [],
        notes: book.notes || '',
        isbn: book.isbn || '',
      });
    }
  }, [book, form]);

  // Update a specific field in a location
  const handleLocationChange = useCallback((index: number, field: keyof Location, value: string) => {
    const updatedLocations = [...form.getValues().specific_locations];
    updatedLocations[index] = {
      ...updatedLocations[index],
      [field]: value,
    };
    form.setValue('specific_locations', updatedLocations);
  }, [form]);

  // Add a new empty location row
  const addLocation = useCallback(() => {
    form.setValue('specific_locations', 
      [...form.getValues().specific_locations, { startChapter: '', endChapter: '', startPage: '', endPage: '' }]
    );
  }, [form]);

  // Remove a location at the specified index
  const removeLocation = useCallback((index: number) => {
    form.setValue('specific_locations', 
      form.getValues().specific_locations.filter((_, i) => i !== index)
    );
  }, [form]);

  const onSubmitEdit = async (values: EditBookFormValues) => {
    if (!book) return;

    const formattedLocations = values.specific_locations.length > 0
        ? values.specific_locations
          .filter(loc => loc.startChapter && loc.startPage) // Filter out empty locations
          .map(loc => 
            `Chapters ${loc.startChapter}${loc.endChapter !== loc.startChapter ? '-'+loc.endChapter : ''} - ` +
            `Pages ${loc.startPage}${loc.endPage !== loc.startPage ? '-'+loc.endPage : ''}`
          ).join(', ')
        : null;

    try {
      const { error } = await supabase
        .from('books')
        .update({
          title: values.title,
          author: values.author,
          genre: values.genre || null,
          smut_level: values.smut_level,
          specific_locations: formattedLocations || null,
          notes: values.notes || null,
          isbn: values.isbn || null,
        })
        .eq('id', book.id);

      if (error) {
        throw error;
      }

      toast.success('Submission updated successfully');
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating submission:', error);
      toast.error('Failed to update submission');
    }
  };

  const locationsList = useMemo(() => form.watch('specific_locations'), [form]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] flex flex-col max-h-[90%]">
        <DialogHeader>
          <DialogTitle>Edit Submission</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmitEdit)} className="overflow-y-auto p-2 flex-grow flex flex-col gap-4">
                <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                        <Input {...field} required />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                
                <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Author</FormLabel>
                    <FormControl>
                        <Input {...field} required />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                
                <FormField
                control={form.control}
                name="genre"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Genre</FormLabel>
                    <FormControl>
                        <Input {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                
                <FormField
                control={form.control}
                name="smut_level"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Smut Level</FormLabel>
                    <Select 
                        defaultValue={field.value} 
                        onValueChange={field.onChange}
                    >
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select smut level" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="mild">Mild</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="explicit">Explicit</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
                
                <div>
                <Label htmlFor="specificLocations">
                    Specific Locations (optional)
                </Label>
                <div className="border rounded-md p-4 mt-2">
                    <table className="w-full mb-3">
                    <thead>
                        <tr className="border-b">
                        <th className="text-left pb-2">Start Chapter</th>
                        <th className="text-left pb-2">End Chapter</th>
                        <th className="text-left pb-2">Start Page</th>
                        <th className="text-left pb-2">End Page</th>
                        <th className="w-10"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {locationsList && locationsList.length > 0 ? (
                        locationsList.map((location, index) => (
                            <tr key={index} className="border-b last:border-b-0">
                            <td className="py-2 pr-2">
                                <Input
                                type="number"
                                min="1"
                                value={location.startChapter}
                                onChange={(e) => handleLocationChange(index, 'startChapter', e.target.value)}
                                className="w-full"
                                />
                            </td>
                            <td className="py-2 px-2">
                                <Input
                                type="number"
                                min="1"
                                value={location.endChapter}
                                onChange={(e) => handleLocationChange(index, 'endChapter', e.target.value)}
                                className="w-full"
                                />
                            </td>
                            <td className="py-2 px-2">
                                <Input
                                type="number"
                                min="1"
                                value={location.startPage}
                                onChange={(e) => handleLocationChange(index, 'startPage', e.target.value)}
                                className="w-full"
                                />
                            </td>
                            <td className="py-2 px-2">
                                <Input
                                type="number"
                                min="1"
                                value={location.endPage}
                                onChange={(e) => handleLocationChange(index, 'endPage', e.target.value)}
                                className="w-full"
                                />
                            </td>
                            <td className="py-2 pl-2">
                                <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeLocation(index)}
                                className="h-8 w-8 text-red-500 hover:text-red-700"
                                >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 6h18"></path>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                                </Button>
                            </td>
                            </tr>
                        ))
                        ) : (
                        <tr>
                            <td colSpan={5} className="py-4 text-center text-gray-500">
                            No locations added yet. Add a section below.
                            </td>
                        </tr>
                        )}
                    </tbody>
                    </table>
                    <Button 
                    type="button" 
                    variant="outline" 
                    onClick={addLocation}
                    className="w-full"
                    >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <path d="M12 5v14"></path>
                        <path d="M5 12h14"></path>
                    </svg>
                    Add Section
                    </Button>
                </div>
                </div>
                
                <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Notes</FormLabel>
                            <FormControl>
                                <Textarea {...field} />
                            </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
                />
                
                <FormField
                    control={form.control}
                    name="isbn"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>ISBN</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            <DialogFooter className="flex-shrink-0 gap-2">
              <DialogClose asChild>
                <Button variant="outline" type="button">Cancel</Button>
              </DialogClose>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}