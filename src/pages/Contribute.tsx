
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/components/ui/sonner';
import { AlertCircle, CheckCircle2, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const Contribute = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: '',
    isbn: '',
    smutLevel: '',
    specificLocations: '',
    notes: ''
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      toast("Authentication Required", {
        description: "Please sign in to contribute to our database.",
        icon: <Shield className="h-5 w-5 text-blue-500" />,
      });
      navigate('/auth?tab=login');
    }
  }, [user, loading, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleRadioChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      smutLevel: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Submit to Supabase
      const { error } = await supabase.from('books').insert({
        title: formData.title,
        author: formData.author,
        genre: formData.genre,
        isbn: formData.isbn || null,
        smut_level: formData.smutLevel,
        specific_locations: formData.specificLocations || null,
        notes: formData.notes || null,
        created_by: user?.id
      });
      
      if (error) throw error;
      
      toast("Submission received!", {
        description: "Thank you for contributing to our database. Your submission will be reviewed shortly.",
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      });
      
      // Reset form
      setFormData({
        title: '',
        author: '',
        genre: '',
        isbn: '',
        smutLevel: '',
        specificLocations: '',
        notes: ''
      });
    } catch (error: any) {
      toast("Submission Error", {
        description: error.message || "There was an error submitting your contribution.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-12 px-4 text-center">
          Loading...
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <Layout>
      <div className="container mx-auto py-12 px-4 sm:px-6 max-w-3xl">
        <h1 className="text-4xl font-bold mb-4">Contribute</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Help other readers by adding information about books you've read.
        </p>

        <div className="border rounded-lg p-6 mb-8 bg-card">
          <div className="flex items-start gap-4 mb-4">
            <AlertCircle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-medium mb-1">Important Notes</h3>
              <p className="text-sm text-muted-foreground">
                Please provide accurate information based on the actual content of the book. We aim to be informative, not judgmental. All submissions are reviewed before being added to our database.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Book Information</h2>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Book Title <span className="text-red-500">*</span></Label>
                <Input 
                  id="title" 
                  placeholder="Enter the full title of the book" 
                  value={formData.title}
                  onChange={handleChange}
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="author">Author <span className="text-red-500">*</span></Label>
                <Input 
                  id="author" 
                  placeholder="Enter the author's name" 
                  value={formData.author}
                  onChange={handleChange}
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="genre">Genre <span className="text-red-500">*</span></Label>
                <Input 
                  id="genre" 
                  placeholder="E.g., Romance, Fantasy, Young Adult, etc." 
                  value={formData.genre}
                  onChange={handleChange}
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="isbn">ISBN (Optional)</Label>
                <Input 
                  id="isbn" 
                  placeholder="Enter ISBN if available" 
                  value={formData.isbn}
                  onChange={handleChange}
                />
                <p className="text-xs text-muted-foreground">This helps us correctly identify the specific edition</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Content Assessment</h2>
            
            <div className="space-y-3">
              <Label>Smut Level <span className="text-red-500">*</span></Label>
              <RadioGroup 
                value={formData.smutLevel} 
                onValueChange={handleRadioChange}
                required 
                className="grid grid-cols-2 gap-4"
              >
                <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="none" id="none" />
                  <Label htmlFor="none" className="cursor-pointer">None</Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="mild" id="mild" />
                  <Label htmlFor="mild" className="cursor-pointer">Mild</Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="moderate" id="moderate" />
                  <Label htmlFor="moderate" className="cursor-pointer">Moderate</Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="explicit" id="explicit" />
                  <Label htmlFor="explicit" className="cursor-pointer">Explicit</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="specificLocations">Specific Locations (Optional)</Label>
              <Textarea 
                id="specificLocations" 
                placeholder="List specific chapters or page numbers where explicit content occurs. Example: 'Chapter 7, pages 120-125', 'Chapter 15 (second half)'"
                className="min-h-[100px]"
                value={formData.specificLocations}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea 
                id="notes" 
                placeholder="Provide any additional context that might be helpful for readers"
                className="min-h-[100px]"
                value={formData.notes}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Book Information"}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default Contribute;
