
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/components/ui/use-toast';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const Contribute = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <span>Submission received!</span>
          </div>
        ),
        description: "Thank you for contributing to our database. Your submission will be reviewed shortly.",
      });
      
      // Reset form
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

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
                <Input id="title" placeholder="Enter the full title of the book" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="author">Author <span className="text-red-500">*</span></Label>
                <Input id="author" placeholder="Enter the author's name" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="genre">Genre <span className="text-red-500">*</span></Label>
                <Input id="genre" placeholder="E.g., Romance, Fantasy, Young Adult, etc." required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="isbn">ISBN (Optional)</Label>
                <Input id="isbn" placeholder="Enter ISBN if available" />
                <p className="text-xs text-muted-foreground">This helps us correctly identify the specific edition</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Content Assessment</h2>
            
            <div className="space-y-3">
              <Label>Smut Level <span className="text-red-500">*</span></Label>
              <RadioGroup defaultValue="none" required className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="locations">Specific Locations (Optional)</Label>
              <Textarea 
                id="locations" 
                placeholder="List specific chapters or page numbers where explicit content occurs. Example: 'Chapter 7, pages 120-125', 'Chapter 15 (second half)'"
                className="min-h-[100px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea 
                id="notes" 
                placeholder="Provide any additional context that might be helpful for readers"
                className="min-h-[100px]"
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
