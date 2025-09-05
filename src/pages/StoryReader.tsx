import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, BookOpen, User } from "lucide-react";
import { useStory } from "@/hooks/useStories";
import { useChildren } from "@/hooks/useChildren";
import { usePersonalization } from "@/hooks/usePersonalization";
import { ChildSelector } from "@/components/ChildSelector";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Child {
  id: string;
  name: string;
  age: number;
  avatar_url?: string;
  grade?: string;
  language_preference?: string;
}

const StoryReader = () => {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [showChildSelector, setShowChildSelector] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  const { data: story, isLoading: storyLoading } = useStory(storyId!);
  const { data: children, isLoading: childrenLoading } = useChildren();
  const { personalizeStory } = usePersonalization();

  if (storyLoading || childrenLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container max-w-4xl py-16">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-8" />
          <Skeleton className="h-64 w-full" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container max-w-4xl py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Story Not Found</h1>
          <Button onClick={() => navigate('/explore')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Explore
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  // Show child selector if no child is selected and children exist
  if (showChildSelector && children && children.length > 0) {
    return (
      <div className="min-h-screen">
        <Header />
        <ChildSelector
          children={children}
          selectedChild={selectedChild}
          onChildSelect={setSelectedChild}
          onContinue={() => setShowChildSelector(false)}
          storyTitle={story.title}
        />
        <Footer />
      </div>
    );
  }

  // Get personalized content
  const getPersonalizedContent = () => {
    if (!story.is_template || !story.template_content || !selectedChild) {
      return {
        content: story.content,
        illustrations: []
      };
    }

    return personalizeStory(story.template_content, selectedChild);
  };

  const personalizedStory = getPersonalizedContent();
  const storyPages = personalizedStory.content.split('\n\n').filter(page => page.trim());

  const handlePreviousPage = () => {
    setCurrentPage(Math.max(0, currentPage - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(Math.min(storyPages.length - 1, currentPage + 1));
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <section className="py-8">
        <div className="container max-w-4xl">
          {/* Story Header */}
          <div className="flex items-center justify-between mb-8">
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
              className="font-fredoka"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            {selectedChild && (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-muted-foreground">Reading as:</span>
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={selectedChild.avatar_url || undefined} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{selectedChild.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowChildSelector(true)}
                  className="text-xs"
                >
                  Change
                </Button>
              </div>
            )}
          </div>

          {/* Story Content */}
          <Card className="bg-gradient-card border-0 shadow-soft">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <h1 className="font-fredoka font-bold text-3xl mb-4">
                  {story.title}
                </h1>
                
                {/* Page indicator */}
                <div className="text-sm text-muted-foreground mb-6">
                  Page {currentPage + 1} of {storyPages.length}
                </div>
              </div>

              {/* Current story page */}
              <div className="prose prose-lg max-w-none text-center mb-8">
                <p className="text-lg leading-relaxed font-medium">
                  {storyPages[currentPage]}
                </p>
              </div>

              {/* Avatar illustration placeholder */}
              {selectedChild?.avatar_url && (
                <div className="flex justify-center mb-8">
                  <div className="relative">
                    <Avatar className="h-32 w-32 border-4 border-primary/20">
                      <AvatarImage src={selectedChild.avatar_url} />
                      <AvatarFallback>
                        <User className="h-16 w-16" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-2">
                      <BookOpen className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between items-center">
                <Button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 0}
                  variant="outline"
                  className="font-fredoka"
                >
                  Previous
                </Button>
                
                <div className="flex space-x-2">
                  {storyPages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(index)}
                      className={`
                        w-3 h-3 rounded-full transition-colors
                        ${index === currentPage 
                          ? 'bg-primary' 
                          : 'bg-primary/20 hover:bg-primary/40'
                        }
                      `}
                    />
                  ))}
                </div>
                
                <Button
                  onClick={handleNextPage}
                  disabled={currentPage === storyPages.length - 1}
                  className="font-fredoka"
                >
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default StoryReader;