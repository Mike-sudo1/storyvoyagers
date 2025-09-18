import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChildProfileCard from "@/components/ChildProfileCard";
import ChildProfileForm from "@/components/ChildProfileForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useChildren } from "@/hooks/useChildren";
import { supabase } from "@/integrations/supabase/client";
import { storyTemplates } from "@/data/storyTemplates";
import { 
  Wand2, 
  ArrowRight,
  User,
  Clock,
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
  
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [showChildForm, setShowChildForm] = useState(false);
  const [templates] = useState<StoryTemplate[]>(storyTemplates);

  const createStory = async () => {
    // Validate selections
    if (!selectedTemplate || !selectedChild) {
      toast({
        title: "Missing Selection",
        description: "Please select both a story template and a child profile.",
        variant: "destructive",
      });
      return;
    }

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
      console.log('🚀 Starting story creation...', {
        template_id: selectedTemplate,
        child_id: selectedChild,
        child_name: selectedChildData.name,
        avatar_url: selectedChildData.avatar_url
      });
      
      const { data, error } = await supabase.functions.invoke('generate-illustrated-story', {
        body: {
          template_id: selectedTemplate,
          child_id: selectedChild
        }
      });

      console.log('📡 Edge function response:', { data, error });

      if (error) {
        console.error('❌ Story creation failed:', error);
        throw new Error(error.message || 'Failed to create story');
      }

      if (data?.success && data?.story_id) {
        console.log('✅ Story created successfully:', data.story_id);
        toast({
          title: "Story Created!",
          description: `Your personalized story has been generated successfully.`,
        });
        
        // Navigate to the story reader
        navigate(`/read/${data.story_id}`);
      } else {
        console.error('❌ Unexpected response format:', data);
        throw new Error(data?.error || 'Failed to create story');
      }
    } catch (error) {
      console.error('❌ Story creation failed:', error);
      toast({
        title: "Story Creation Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
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

  const canProceed = selectedTemplate && selectedChild;

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Main Content */}
      <section className="py-12">
        <div className="container">
          <div className="max-w-6xl mx-auto space-y-12">
            
            {/* Step 1: Template Selection */}
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <h1 className="text-4xl font-fredoka font-bold">Choose Your Adventure</h1>
                <p className="text-muted-foreground">
                  Select a story template to personalize with your child's avatar
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

            {/* Step 2: Child Selection */}
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-fredoka font-bold">Select Child Profile</h2>
                <p className="text-muted-foreground">
                  Choose which child will be the hero of this adventure
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {children.map((child) => (
                  <div 
                    key={child.id}
                    className={`cursor-pointer transition-smooth ${
                      selectedChild === child.id ? 'ring-2 ring-primary rounded-lg' : ''
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

            {/* Create Story Button */}
            <div className="text-center">
              <Button 
                variant="hero" 
                size="lg"
                onClick={createStory}
                disabled={creating || !canProceed}
                className="px-12 py-6 text-lg"
              >
                {creating ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Creating Story...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-5 w-5 mr-2" />
                    Create My Story!
                  </>
                )}
              </Button>
              
              {!canProceed && (
                <p className="text-sm text-muted-foreground mt-2">
                  Please select both a story template and child profile to continue
                </p>
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