import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChildProfileCard from "@/components/ChildProfileCard";
import ChildProfileForm from "@/components/ChildProfileForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useChildren } from "@/hooks/useChildren";
import { supabase } from "@/integrations/supabase/client";
import { storyTemplates } from "@/data/storyTemplates";
import { 
  Sparkles, 
  Wand2, 
  BookOpen, 
  Settings, 
  Play, 
  ArrowRight,
  User,
  Palette,
  Clock,
  Globe,
  Volume2,
  Loader2,
  Plus
} from "lucide-react";

interface StoryTemplate {
  id: string;
  title: string;
  subject: string;
  description: string;
  age_min: number;
  age_max: number;
}

const CreateStory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: children = [], isLoading: childrenLoading } = useChildren();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [showChildForm, setShowChildForm] = useState(false);
  const [templates] = useState<StoryTemplate[]>(storyTemplates);


  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const createStory = async () => {
    if (!selectedTemplate || !selectedChild) return;

    const selectedChildData = children.find(c => c.id === selectedChild);
    if (!selectedChildData?.avatar_url) {
      toast({
        title: "Avatar Required",
        description: "Please ensure your child has a cartoon avatar before creating a story.",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      console.log('Starting story generation...');
      
      const { data, error } = await supabase.functions.invoke('generate-illustrated-story', {
        body: {
          template_id: selectedTemplate,
          child_id: selectedChild
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to create story');
      }

      if (data.success && data.story_id) {
        toast({
          title: "Story Created!",
          description: `Your personalized story is being generated. This may take a few minutes.`,
        });
        
        // Navigate to the story reader with the new story ID
        navigate(`/story/${data.story_id}`);
      } else {
        throw new Error('Failed to create story');
      }
    } catch (error) {
      console.error('Error creating story:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create story",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const getStoryEmoji = (subject: string) => {
    switch (subject.toLowerCase()) {
      case 'history': return '🏛️';
      case 'science': return '🔬';
      case 'math': return '🔢';
      default: return '📖';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="text-center py-8">
              <p>Please sign in to create stories</p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (childrenLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-fredoka font-bold">Choose Your Adventure</h2>
              <p className="text-muted-foreground">
                Select a story template to personalize with your child's avatar and interests.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {templates.map((template) => (
                <Card 
                  key={template.id}
                  className={`cursor-pointer transition-smooth hover-lift ${
                    selectedTemplate === template.id 
                      ? 'ring-2 ring-primary shadow-card' 
                      : 'shadow-soft'
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <div className="text-6xl">{getStoryEmoji(template.subject)}</div>
                      <div className="space-y-2">
                        <Badge className="bg-gradient-cosmic text-white border-0 font-fredoka">
                          {template.subject}
                        </Badge>
                        <h3 className="font-fredoka font-semibold text-xl">{template.title}</h3>
                        <p className="text-muted-foreground text-sm">{template.description}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>12-15 min</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>Ages {template.age_min}-{template.age_max}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-fredoka font-bold">Select Child Profile</h2>
              <p className="text-muted-foreground">
                Choose which child will be the hero of this adventure.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {children.map((child) => (
                <div 
                  key={child.id}
                  className={`cursor-pointer transition-smooth ${
                    selectedChild === child.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedChild(child.id)}
                >
                  <ChildProfileCard 
                    name={child.name} 
                    age={child.age || 0} 
                    avatarUrl={child.avatar_url} 
                    storiesCompleted={child.stories_completed || 0} 
                    badges={child.badges || 0} 
                  />
                </div>
              ))}
              {children.length < 5 && (
                <Card 
                  className="cursor-pointer transition-smooth hover-lift shadow-soft border-dashed border-2"
                  onClick={() => setShowChildForm(true)}
                >
                  <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[200px]">
                    <Plus className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="font-fredoka font-semibold text-lg mb-2">Add New Child</h3>
                    <p className="text-muted-foreground text-sm text-center">
                      Create a new profile to personalize stories
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-fredoka font-bold">Ready to Create!</h2>
              <p className="text-muted-foreground">
                Review your selection and create your personalized story.
              </p>
            </div>
            
            <Card className="max-w-2xl mx-auto bg-gradient-card border-0 shadow-card">
              <CardContent className="p-8 space-y-6">
                <div className="text-center space-y-4">
                  <div className="text-6xl">
                    {getStoryEmoji(templates.find(t => t.id === selectedTemplate)?.subject || '')}
                  </div>
                  <h3 className="text-2xl font-fredoka font-bold">
                    {templates.find(t => t.id === selectedTemplate)?.title || ''} with {children.find(c => c.id === selectedChild)?.name || ''}
                  </h3>
                  <Badge className="bg-gradient-cosmic text-white border-0 font-fredoka">
                    {templates.find(t => t.id === selectedTemplate)?.subject || ''}
                  </Badge>
                </div>

                <div className="space-y-4 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium">Child:</span> {children.find(c => c.id === selectedChild)?.name || ''}
                    </div>
                    <div>
                      <span className="font-medium">Age:</span> {children.find(c => c.id === selectedChild)?.age || ''} years old
                    </div>
                    <div>
                      <span className="font-medium">Template:</span> {templates.find(t => t.id === selectedTemplate)?.title || ''}
                    </div>
                    <div>
                      <span className="font-medium">Pages:</span> ~35 illustrated pages
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-fredoka font-semibold mb-2">What happens next:</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We'll create a personalized 35-page story featuring {children.find(c => c.id === selectedChild)?.name || ''} as the main character. Each page will have a custom illustration generated using your child's cartoon avatar. This process may take a few minutes.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Progress Header */}
      <section className="py-8 bg-gradient-to-br from-accent/5 to-primary/5">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            {/* Progress Bar */}
            <div className="flex items-center justify-between mb-6">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-fredoka font-bold text-sm ${
                    currentStep >= step ? 'bg-gradient-cosmic text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {step}
                  </div>
                  {step < 4 && (
                    <div className={`w-20 h-1 mx-4 ${
                      currentStep > step ? 'bg-primary' : 'bg-muted'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step Labels */}
            <div className="grid grid-cols-4 gap-4 text-center text-sm">
              <div className={currentStep >= 1 ? 'text-primary font-medium' : 'text-muted-foreground'}>
                Choose Template
              </div>
              <div className={currentStep >= 2 ? 'text-primary font-medium' : 'text-muted-foreground'}>
                Select Child
              </div>
              <div className={currentStep >= 3 ? 'text-primary font-medium' : 'text-muted-foreground'}>
                Customize Story
              </div>
              <div className={currentStep >= 4 ? 'text-primary font-medium' : 'text-muted-foreground'}>
                Preview & Create
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            {renderStepContent()}
            
            {/* Navigation Buttons */}
            <div className="flex justify-between mt-12">
              <Button 
                variant="outline" 
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-8"
              >
                Previous
              </Button>
              
              {currentStep < 4 ? (
                <Button 
                  variant="hero" 
                  onClick={nextStep}
                  disabled={
                    (currentStep === 1 && !selectedTemplate) ||
                    (currentStep === 2 && !selectedChild)
                  }
                  className="px-8"
                >
                  Next Step
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  variant="magic" 
                  className="px-8"
                  onClick={createStory}
                  disabled={creating}
                >
                  {creating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Wand2 className="h-4 w-4 mr-2" />
                  )}
                  {creating ? 'Creating...' : 'Create My Story!'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
      
      <Dialog open={showChildForm} onOpenChange={setShowChildForm}>
        <DialogContent className="max-w-md">
          <ChildProfileForm 
            onClose={() => setShowChildForm(false)}
            existingChildrenCount={children.length}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateStory;