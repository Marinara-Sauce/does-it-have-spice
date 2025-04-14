
import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import SmutLevelCard from '@/components/SmutLevelCard';

const Contribute = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: '',
    isbn: '',
    smutLevel: '',
    specificLocations: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to contribute");
      navigate('/auth?tab=login');
      return;
    }

    if (!formData.title || !formData.author || !formData.genre || !formData.smutLevel) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.from('books').insert({
        title: formData.title,
        author: formData.author,
        genre: formData.genre,
        isbn: formData.isbn || null,
        smut_level: formData.smutLevel,
        specific_locations: formData.specificLocations || null,
        notes: formData.notes || null,
        created_by: user.id
      });
      
      if (error) throw error;
      
      toast.success("Thank you for your contribution!");
      setFormData({
        title: '',
        author: '',
        genre: '',
        isbn: '',
        smutLevel: '',
        specificLocations: '',
        notes: ''
      });
      
      // Navigate to search results for the book just added
      navigate(`/search?q=${encodeURIComponent(formData.title)}`);
      
    } catch (error: unknown) {
      console.error('Error submitting form:', error);
      if (error instanceof Error) {
        toast.error(error.message || "Failed to submit your contribution");
      } else {
        toast.error("An unknown error occurred");
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
          <Button onClick={() => navigate('/auth?tab=login')}>
            Log In to Contribute
          </Button>
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
            Help other readers by submitting information about book content. Your contributions make this resource valuable for the community.
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
                <Label htmlFor="genre">Genre *</Label>
                <Input 
                  id="genre" 
                  name="genre" 
                  value={formData.genre} 
                  onChange={handleInputChange} 
                  placeholder="E.g., Fantasy, Romance, Mystery" 
                  required 
                />
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
                <RadioGroup onValueChange={(value) => handleSelectChange(value, 'smutLevel')}>
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
                      description="Includes explicit scenes but not overly graphic. May contain some strong language."
                      color="text-yellow-600"
                      isSelectable
                      selected={formData.smutLevel === 'moderate'}
                      value="moderate"
                    />
                    <SmutLevelCard
                      title="Explicit"
                      description="Frequent and detailed sexual content. May include graphic language and situations."
                      color="text-red-600"
                      isSelectable
                      selected={formData.smutLevel === 'explicit'}
                      value="explicit"
                    />
                  </div>
                </RadioGroup>
              </div>
              
              <div>
                <Label htmlFor="specificLocations">
                  Specific Locations (optional)
                </Label>
                <Textarea 
                  id="specificLocations" 
                  name="specificLocations" 
                  value={formData.specificLocations} 
                  onChange={handleInputChange} 
                  placeholder="E.g., 'Chapter 7, pages 120-123' or 'Chapters 15 and 18'" 
                  className="min-h-[100px]"
                />
              </div>
              
              <div>
                <Label htmlFor="notes">
                  Additional Notes (optional)
                </Label>
                <Textarea 
                  id="notes" 
                  name="notes" 
                  value={formData.notes} 
                  onChange={handleInputChange} 
                  placeholder="Any other relevant information about the book's content" 
                  className="min-h-[100px]"
                />
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
