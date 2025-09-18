import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { useStoryGeneration } from '@/hooks/useStoryGeneration';

interface StoryViewerProps {
  storyId: string;
  storyTitle: string;
}

export const StoryViewer: React.FC<StoryViewerProps> = ({ storyId, storyTitle }) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const { storyPages, checkExistingPages } = useStoryGeneration();

  React.useEffect(() => {
    checkExistingPages(storyId);
  }, [storyId]);

  const currentStoryPage = storyPages.find(page => page.page_number === currentPage);
  const totalPages = storyPages.length || 35;

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  const renderPageContent = () => {
    if (!currentStoryPage) {
      return (
        <div className="text-center text-muted-foreground py-8">
          <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Page {currentPage} not yet generated</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {currentStoryPage.image_url ? (
          <div className="relative aspect-square w-full max-w-md mx-auto overflow-hidden rounded-lg border">
            <img
              src={currentStoryPage.image_url}
              alt={`Story page ${currentPage}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="aspect-square w-full max-w-md mx-auto bg-muted rounded-lg border flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Image generating...</p>
            </div>
          </div>
        )}
        
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-lg leading-relaxed">
            {currentStoryPage.text_content}
          </p>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center flex items-center justify-center gap-2">
          <BookOpen className="w-5 h-5" />
          {storyTitle}
        </CardTitle>
        <div className="text-center text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {renderPageContent()}
        
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          <div className="text-sm text-muted-foreground">
            {currentPage} / {totalPages}
          </div>
          
          <Button
            variant="outline"
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};