import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChildProfileCard from "@/components/ChildProfileCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useChildren } from "@/hooks/useChildren";
import { supabase } from "@/integrations/supabase/client";
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
  Loader2
} from "lucide-react";

interface Story {
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
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [storySettings, setStorySettings] = useState({
    tone: "adventurous",
    length: "medium",
    readingLevel: "grade-2",
    language: "english",
    narration: true,
    illustrationStyle: "cartoon"
  });

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select('id, title, subject, description, age_min, age_max')
        .order('title');

      if (error) throw error;
      setStories(data || []);
    } catch (error) {
      console.error('Error fetching stories:', error);
      toast({
        title: "Error",
        description: "Failed to load stories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const createStory = async () => {
    if (!selectedTemplate || !selectedChild) return;

    setCreating(true);
    try {
      // Navigate to story reader page
      navigate(`/story/${selectedTemplate}`);
      
      toast({
        title: "Story Ready!",
        description: "Your personalized story is ready to generate illustrations.",
      });
    } catch (error) {
      console.error('Error creating story:', error);
      toast({
        title: "Error",
        description: "Failed to create story",
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

  if (loading || childrenLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Loading stories...</p>
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
              {stories.map((story) => (
                <Card 
                  key={story.id}
                  className={`cursor-pointer transition-smooth hover-lift ${
                    selectedTemplate === story.id 
                      ? 'ring-2 ring-primary shadow-card' 
                      : 'shadow-soft'
                  }`}
                  onClick={() => setSelectedTemplate(story.id)}
                >
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <div className="text-6xl">{getStoryEmoji(story.subject)}</div>
                      <div className="space-y-2">
                        <Badge className="bg-gradient-cosmic text-white border-0 font-fredoka">
                          {story.subject}
                        </Badge>
                        <h3 className="font-fredoka font-semibold text-xl">{story.title}</h3>
                        <p className="text-muted-foreground text-sm">{story.description}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>12-15 min</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>Ages {story.age_min}-{story.age_max}</span>
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
              {children.length < 5 && <ChildProfileCard isNew={true} />}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-fredoka font-bold">Customize Your Story</h2>
              <p className="text-muted-foreground">
                Adjust the settings to create the perfect learning experience.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="bg-gradient-card border-0 shadow-soft">
                <CardHeader>
                  <CardTitle className="font-fredoka text-lg flex items-center">
                    <Palette className="h-5 w-5 mr-2" />
                    Story Style
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Tone</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {["adventurous", "cozy", "funny"].map((tone) => (
                        <Button
                          key={tone}
                          variant={storySettings.tone === tone ? "hero" : "outline"}
                          size="sm"
                          onClick={() => setStorySettings(prev => ({...prev, tone}))}
                          className="capitalize text-xs"
                        >
                          {tone}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Length</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {[
                        { id: "short", label: "Short (6-8 pages)" },
                        { id: "medium", label: "Medium (10-14 pages)" },
                        { id: "long", label: "Long (16-24 pages)" }
                      ].map((length) => (
                        <Button
                          key={length.id}
                          variant={storySettings.length === length.id ? "hero" : "outline"}
                          size="sm"
                          onClick={() => setStorySettings(prev => ({...prev, length: length.id}))}
                          className="text-xs h-auto py-2"
                        >
                          {length.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Illustration Style</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {["cartoon", "flat", "hand-drawn"].map((style) => (
                        <Button
                          key={style}
                          variant={storySettings.illustrationStyle === style ? "hero" : "outline"}
                          size="sm"
                          onClick={() => setStorySettings(prev => ({...prev, illustrationStyle: style}))}
                          className="capitalize text-xs"
                        >
                          {style}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-0 shadow-soft">
                <CardHeader>
                  <CardTitle className="font-fredoka text-lg flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Learning Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Reading Level</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {[
                        { id: "grade-1", label: "Grade 1-2" },
                        { id: "grade-2", label: "Grade 2-3" },
                        { id: "grade-3", label: "Grade 3-4" },
                        { id: "grade-4", label: "Grade 4-5" }
                      ].map((level) => (
                        <Button
                          key={level.id}
                          variant={storySettings.readingLevel === level.id ? "hero" : "outline"}
                          size="sm"
                          onClick={() => setStorySettings(prev => ({...prev, readingLevel: level.id}))}
                          className="text-xs"
                        >
                          {level.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium flex items-center">
                      <Globe className="h-4 w-4 mr-1" />
                      Language
                    </Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {[
                        { id: "english", label: "English" },
                        { id: "spanish", label: "Spanish" },
                        { id: "bilingual", label: "Bilingual" }
                      ].map((lang) => (
                        <Button
                          key={lang.id}
                          variant={storySettings.language === lang.id ? "hero" : "outline"}
                          size="sm"
                          onClick={() => setStorySettings(prev => ({...prev, language: lang.id}))}
                          className="text-xs"
                        >
                          {lang.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Volume2 className="h-4 w-4 text-muted-foreground" />
                      <Label className="text-sm font-medium">Audio Narration</Label>
                    </div>
                    <Button
                      variant={storySettings.narration ? "success" : "outline"}
                      size="sm"
                      onClick={() => setStorySettings(prev => ({...prev, narration: !prev.narration}))}
                      className="text-xs"
                    >
                      {storySettings.narration ? "On" : "Off"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-fredoka font-bold">Story Preview</h2>
              <p className="text-muted-foreground">
                Review your personalized story before we create it for you.
              </p>
            </div>
            
            <Card className="max-w-2xl mx-auto bg-gradient-card border-0 shadow-card">
              <CardContent className="p-8 space-y-6">
                <div className="text-center space-y-4">
                  <div className="text-6xl">
                    {getStoryEmoji(stories.find(s => s.id === selectedTemplate)?.subject || '')}
                  </div>
                  <h3 className="text-2xl font-fredoka font-bold">
                    {stories.find(s => s.id === selectedTemplate)?.title || ''} with {children.find(c => c.id === selectedChild)?.name || ''}
                  </h3>
                  <Badge className="bg-gradient-cosmic text-white border-0 font-fredoka">
                    {stories.find(s => s.id === selectedTemplate)?.subject || ''}
                  </Badge>
                </div>

                  <div className="space-y-4 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium">Child:</span> {children.find(c => c.id === selectedChild)?.name || ''}
                      </div>
                      <div>
                        <span className="font-medium">Tone:</span> {storySettings.tone}
                      </div>
                      <div>
                        <span className="font-medium">Length:</span> {storySettings.length}
                      </div>
                      <div>
                        <span className="font-medium">Language:</span> {storySettings.language}
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-fredoka font-semibold mb-2">Story Preview:</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      "Get ready for an incredible adventure! {children.find(c => c.id === selectedChild)?.name || ''} is about to embark on a {storySettings.tone} journey through {stories.find(s => s.id === selectedTemplate)?.title?.toLowerCase() || ''}. With their cartoon avatar leading the way, they'll discover amazing facts and have fun learning along the way..."
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
              {[1, 2, 3, 4].map((step) => (
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
    </div>
  );
};

export default CreateStory;