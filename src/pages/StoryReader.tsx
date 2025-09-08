import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, User } from "lucide-react";
import { useStory } from "@/hooks/useStories";
import { useChildren } from "@/hooks/useChildren";
import { usePersonalization } from "@/hooks/usePersonalization";
import { useIllustrationGeneration } from "@/hooks/useIllustrationGeneration";
import { usePersonalizedImage } from "@/hooks/usePersonalizedImage";
import { useFaceInjection } from "@/hooks/useFaceInjection";
import { ChildSelector } from "@/components/ChildSelector";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import threePigsPage1 from "@/assets/three-pigs-page1.jpg";
import threePigsPage2 from "@/assets/three-pigs-page2.jpg";
import threePigsPage3 from "@/assets/three-pigs-page3.jpg";
import threePigsPage4 from "@/assets/three-pigs-page4.jpg";
import threePigsPage5 from "@/assets/three-pigs-page5.jpg";
import egyptPage1 from "@/assets/egypt-page1.jpg";
import egyptPage2 from "@/assets/egypt-page2.jpg";
import egyptPage3 from "@/assets/egypt-page3.jpg";

interface Child {
  id: string;
  name: string;
  age: number;
  avatar_url?: string;
  grade?: string;
  language_preference?: string;
}

const StoryReader = () => {
  // ALL HOOKS MUST BE CALLED FIRST - BEFORE ANY EARLY RETURNS
  const { storyId } = useParams();
  const navigate = useNavigate();
  
  // State hooks
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [showChildSelector, setShowChildSelector] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [personalizedImages, setPersonalizedImages] = useState<{ [key: string]: string }>({});
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(false);

  // Custom hooks
  const { data: story, isLoading: storyLoading } = useStory(storyId!);
  const { data: children, isLoading: childrenLoading } = useChildren();
  const { personalizeStory } = usePersonalization();
  const { generateIllustration, extractChildFeatures } = useIllustrationGeneration();
  const { getEmotionForScene } = usePersonalizedImage();
  const { injectAvatarIntoImage, isInjecting } = useFaceInjection();

  // Get personalized content - this needs to be computed before useEffect
  const getPersonalizedContent = () => {
    if (!story?.is_template || !story?.template_content || !selectedChild) {
      return {
        content: story?.content || '',
        illustrations: []
      };
    }
    return personalizeStory(story.template_content, selectedChild);
  };

  const personalizedStory = getPersonalizedContent();
  const storyPages = personalizedStory.content.split('\n\n').filter(page => page.trim());

  // Map page numbers to story images
  const getStoryImage = (pageIndex: number) => {
    if (story?.title === "Adventure in Ancient Egypt") {
      const egyptImageMap: { [key: number]: string } = {
        0: egyptPage1,
        1: egyptPage2,
        2: egyptPage3,
      };
      return egyptImageMap[pageIndex];
    }
    
    const imageMap: { [key: number]: string } = {
      0: threePigsPage1,
      1: threePigsPage2,
      2: threePigsPage3,
      3: threePigsPage4,
      4: threePigsPage5,
    };
    return imageMap[pageIndex];
  };

  // Handle personalized image generation
  const loadPersonalizedImage = async (pageIndex: number) => {
    if (!selectedChild?.avatar_url) return;

    const cacheKey = `${story?.id}_${pageIndex}`;

    // Check if we have a cached image for this specific story/page combination
    if (personalizedImages[cacheKey]) {
      setCurrentImageUrl(personalizedImages[cacheKey]);
      return;
    }

    // Get the illustration data for current page
    const illustration = personalizedStory.illustrations?.find(ill => ill.page === pageIndex + 1);
    
    // Determine the base image to use for personalization
    let baseImageUrl = null;
    
    // Priority 1: Use image_url from illustration if defined
    if (illustration?.image_url || illustration?.image) {
      baseImageUrl = illustration.image_url || illustration.image;
    }
    // Priority 2: Fallback to story cover image
    else if (story?.cover_image_url) {
      baseImageUrl = story.cover_image_url;
    }
    
    // Only proceed with personalization if we have a base image
    if (baseImageUrl) {
      setLoadingImage(true);
      
      try {
        const pageText = storyPages[pageIndex] || '';
        const emotion = getEmotionForScene(pageText, pageIndex);
        
        // Only inject avatar if placeholder_avatar is true
        if (illustration?.placeholder_avatar && selectedChild?.avatar_url) {
          console.log(`Injecting avatar for page ${pageIndex + 1}:`, {
            baseImageUrl,
            hasIllustrationImage: !!(illustration?.image_url || illustration?.image),
            emotion,
            placeholderAvatar: illustration.placeholder_avatar
          });
          
          const personalizedImageUrl = await injectAvatarIntoImage({
            baseImageUrl,
            avatarUrl: selectedChild.avatar_url,
            childId: selectedChild.id,
            storyId: story.id,
            pageIndex,
            emotion
          });
          
          if (personalizedImageUrl) {
            setPersonalizedImages(prev => ({
              ...prev,
              [cacheKey]: personalizedImageUrl
            }));
            setCurrentImageUrl(personalizedImageUrl);
          }
        } else {
          console.log(`Skipping avatar injection for page ${pageIndex + 1}`, {
            hasPlaceholderFlag: !!illustration?.placeholder_avatar,
            hasAvatar: !!selectedChild?.avatar_url,
            illustration: illustration ? { page: illustration.page, placeholder_avatar: illustration.placeholder_avatar } : null
          });
          
          // If no personalization needed, use the base image directly
          setCurrentImageUrl(baseImageUrl);
        }
      } catch (error) {
        console.error('Error injecting avatar:', error);
      } finally {
        setLoadingImage(false);
      }
    } 
    // If illustration has image_url but no personalization possible, use it directly
    else if (illustration?.image_url || illustration?.image) {
      setCurrentImageUrl(illustration.image_url || illustration.image);
    }
  };

  // useEffect for loading personalized images
  useEffect(() => {
    const run = async () => {
      if (story && selectedChild) {
        await loadPersonalizedImage(currentPage);
      } else {
        setCurrentImageUrl(null);
      }
    };
    run();
  }, [currentPage, selectedChild?.id, story?.id]);

  // Helper functions
  const handlePreviousPage = () => {
    setCurrentPage(Math.max(0, currentPage - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(Math.min(storyPages.length - 1, currentPage + 1));
  };

  const currentIllustration = personalizedStory.illustrations?.find(
    ill => ill.page === currentPage + 1
  );

  const hasIntegratedIllustrations = story?.id !== 'three-little-pigs' && personalizedStory.illustrations?.length > 0;

  // NOW WE CAN DO CONDITIONAL RENDERING - ALL HOOKS HAVE BEEN CALLED
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
                
                <div className="text-sm text-muted-foreground mb-6">
                  Page {currentPage + 1} of {storyPages.length}
                </div>
              </div>

              <div className="prose prose-lg max-w-none text-center mb-8">
                <p className="text-lg leading-relaxed font-medium">
                  {storyPages[currentPage]}
                </p>
              </div>

              {/* Story illustration */}
              {(currentImageUrl || getStoryImage(currentPage) || currentIllustration?.image_url || currentIllustration?.image) && (
                <div className="relative mb-8 mx-auto max-w-2xl">
                  {loadingImage && (
                    <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                        <p className="text-sm text-muted-foreground">Personalizing illustration...</p>
                      </div>
                    </div>
                  )}
                  
                  {!loadingImage && (
                    <img 
                      src={
                        currentImageUrl || 
                        currentIllustration?.image_url || 
                        currentIllustration?.image || 
                        getStoryImage(currentPage)
                      } 
                      alt={currentIllustration?.description || `Story illustration for page ${currentPage + 1}`}
                      className="w-full h-auto rounded-lg shadow-lg"
                    />
                  )}
                  
                  {/* Legacy avatar overlay for Three Little Pigs only */}
                  {!hasIntegratedIllustrations && !currentImageUrl && selectedChild?.avatar_url && currentIllustration?.placeholder_avatar && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <Avatar className="h-16 w-16 border-2 border-white shadow-lg">
                        <AvatarImage src={selectedChild.avatar_url} />
                        <AvatarFallback>
                          <User className="h-8 w-8" />
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}
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