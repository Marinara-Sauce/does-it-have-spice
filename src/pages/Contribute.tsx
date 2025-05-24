import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup } from '@/components/ui/radio-group';
import SmutLevelCard from '@/components/SmutLevelCard';
import GenreSelector from '@/components/GenreSelector';

export interface Genre {
  genre_id: number;
  genre: string;
  genre_count: number;
}

interface Location {
  startChapter: string;
  endChapter: string;
  startPage: string;
  endPage: string;
}

const Contribute = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genres: [] as Genre[],
    isbn: '',
    smutLevel: '',
    specificLocations: [] as Location[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenresChange = (genres: Genre[]) => {
    setFormData(prev => ({ ...prev, genres }));
  };

  // Add a new empty location row
  const addLocation = () => {
    setFormData(prev => ({
      ...prev,
      specificLocations: [
        ...prev.specificLocations,
        { startChapter: '', endChapter: '', startPage: '', endPage: '' },
      ],
    }));
  };

  // Remove a location at the specified index
  const removeLocation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specificLocations: prev.specificLocations.filter((_, i) => i !== index),
    }));
  };

  // Update a specific field in a location
  const handleLocationChange = (index: number, field: keyof Location, value: string) => {
    setFormData(prev => {
      const newLocations = [...prev.specificLocations];
      newLocations[index] = {
        ...newLocations[index],
        [field]: value,
      };
      return {
        ...prev,
        specificLocations: newLocations,
      };
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('You must be logged in to contribute');
      navigate('/auth?tab=login');
      return;
    }

    if (
      !formData.title ||
      !formData.author ||
      formData.genres.length === 0 ||
      !formData.smutLevel
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Format the locations into an array for storage
      const formattedLocations =
        formData.specificLocations.length > 0
          ? formData.specificLocations
              .filter(loc => loc.startChapter && loc.startPage) // Filter out empty locations
              .map(
                loc =>
                  `Chapters ${loc.startChapter}${loc.endChapter !== loc.startChapter ? '-' + loc.endChapter : ''}, ` +
                  `Pages ${loc.startPage}${loc.endPage !== loc.startPage ? '-' + loc.endPage : ''}`,
              )
          : [];

      const { data, error } = await supabase
        .from('books')
        .insert({
          title: formData.title,
          author: formData.author,
          isbn: formData.isbn || null,
          smut_level: formData.smutLevel,
          specific_locations: formattedLocations,
          created_by: user.id,
        })
        .select();

      if (error) throw error;

      // Once we have our books, we can now start inserting genres
      const booksToGenres = formData.genres.map(genre => ({
        book_id: data[0]!.id,
        genre_id: genre.genre_id,
        created_by: user.id,
      }));

      const { error: genreError } = await supabase.from('book_to_genres').insert(booksToGenres);

      if (genreError) throw genreError;

      toast.success('Thank you for your contribution!');
      setFormData({
        title: '',
        author: '',
        genres: [],
        isbn: '',
        smutLevel: '',
        specificLocations: [],
      });

      // Navigate to search results for the book just added
      navigate(`/search?q=${encodeURIComponent(formData.title)}`);
    } catch (error: unknown) {
      console.error('Error submitting form:', error);
      if (error instanceof Error) {
        toast.error(error.message || 'Failed to submit your contribution');
      } else {
        toast.error('An unknown error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto py-16 px-4 sm:px-6 text-center">
          <h1 className="text-3xl font-bold mb-6">Contribute to Our Database</h1>
          <p className="text-lg mb-8">Please log in to contribute to our database.</p>
          <Button onClick={() => navigate('/auth?tab=login')}>Log In to Contribute</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Contribute to Our Database</h1>
          <p className="mb-8">
            Help other readers by submitting information about book content. Your contributions make
            this resource valuable for the community.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Book Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter the book title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="author">Author *</Label>
                <Input
                  id="author"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  placeholder="Enter the author's name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="genres">Genres *</Label>
                <GenreSelector selectedGenres={formData.genres} onChange={handleGenresChange} />
              </div>

              <div>
                <Label htmlFor="isbn">ISBN (optional)</Label>
                <Input
                  id="isbn"
                  name="isbn"
                  value={formData.isbn}
                  onChange={handleInputChange}
                  placeholder="Enter ISBN if available"
                />
              </div>

              <div>
                <Label htmlFor="smutLevel">Adult Content Level *</Label>
                <RadioGroup onValueChange={value => handleSelectChange(value, 'smutLevel')}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <SmutLevelCard
                      title="None"
                      description="No explicit sexual content. May contain romance, kissing, or implied intimacy."
                      color="text-green-600"
                      isSelectable
                      selected={formData.smutLevel === 'none'}
                      value="none"
                    />
                    <SmutLevelCard
                      title="Mild"
                      description="Contains some sensual scenes, but without explicit details. 'Closed door' or fade-to-black scenes."
                      color="text-blue-600"
                      isSelectable
                      selected={formData.smutLevel === 'mild'}
                      value="mild"
                    />
                    <SmutLevelCard
                      title="Moderate"
                      description="Includes explicit scenes but not overly graphic."
                      color="text-yellow-600"
                      isSelectable
                      selected={formData.smutLevel === 'moderate'}
                      value="moderate"
                    />
                    <SmutLevelCard
                      title="Explicit"
                      description="Frequent and detailed sexual content."
                      color="text-red-600"
                      isSelectable
                      selected={formData.smutLevel === 'explicit'}
                      value="explicit"
                    />
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="specificLocations">Specific Locations (optional)</Label>
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
                      {formData.specificLocations.length > 0 ? (
                        formData.specificLocations.map((location, index) => (
                          <tr key={index} className="border-b last:border-b-0">
                            <td className="py-2 pr-2">
                              <Input
                                type="number"
                                min="1"
                                value={location.startChapter}
                                onChange={e =>
                                  handleLocationChange(index, 'startChapter', e.target.value)
                                }
                                className="w-full"
                              />
                            </td>
                            <td className="py-2 px-2">
                              <Input
                                type="number"
                                min="1"
                                value={location.endChapter}
                                onChange={e =>
                                  handleLocationChange(index, 'endChapter', e.target.value)
                                }
                                className="w-full"
                              />
                            </td>
                            <td className="py-2 px-2">
                              <Input
                                type="number"
                                min="1"
                                value={location.startPage}
                                onChange={e =>
                                  handleLocationChange(index, 'startPage', e.target.value)
                                }
                                className="w-full"
                              />
                            </td>
                            <td className="py-2 px-2">
                              <Input
                                type="number"
                                min="1"
                                value={location.endPage}
                                onChange={e =>
                                  handleLocationChange(index, 'endPage', e.target.value)
                                }
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
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
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
                  <Button type="button" variant="outline" onClick={addLocation} className="w-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2"
                    >
                      <path d="M12 5v14"></path>
                      <path d="M5 12h14"></path>
                    </svg>
                    Add Section
                  </Button>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Contribution'}
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Contribute;
