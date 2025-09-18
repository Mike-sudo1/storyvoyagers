import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useStoryGeneration } from '@/hooks/useStoryGeneration';
import { Loader2, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';

interface StoryGenerationButtonProps {
  storyId: string;
  childId: string;
  onGenerationComplete?: () => void;
}

export const StoryGenerationButton: React.FC<StoryGenerationButtonProps> = ({
  storyId,
  childId,
  onGenerationComplete
}) => {
  const { toast } = useToast();
  const {
    progress,
    error,
    checkExistingPages,
    generateStoryIllustrations,
    resetProgress
  } = useStoryGeneration();

  React.useEffect(() => {
    // Check for existing pages on mount
    checkExistingPages(storyId);
  }, [storyId]);

  const handleGenerate = async () => {
    try {
      const success = await generateStoryIllustrations(storyId, childId);
      
      if (success) {
        toast({
          title: "Story Generated!",
          description: `Generated ${progress.generated_count} new pages, found ${progress.cached_count} existing pages.`,
        });
        onGenerationComplete?.();
      } else {
        toast({
          title: "Generation Error",
          description: error || "Failed to generate story illustrations",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Generation Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = () => {
    switch (progress.status) {
      case 'generating':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const getButtonText = () => {
    switch (progress.status) {
      case 'generating':
        return 'Generating Story...';
      case 'complete':
        return progress.cached_count === 35 ? 'Story Ready!' : 'Regenerate Story';
      case 'error':
        return 'Retry Generation';
      default:
        return 'Generate Story Illustrations';
    }
  };

  const progressPercentage = progress.total_pages > 0 
    ? ((progress.generated_count + progress.cached_count) / progress.total_pages) * 100 
    : 0;

  return (
    <div className="space-y-4">
      <Button
        onClick={handleGenerate}
        disabled={progress.status === 'generating'}
        className="w-full"
        variant={progress.status === 'complete' ? 'outline' : 'default'}
      >
        {getStatusIcon()}
        {getButtonText()}
      </Button>

      {progress.status === 'generating' && (
        <div className="space-y-2">
          <Progress value={progressPercentage} className="w-full" />
          <p className="text-sm text-muted-foreground text-center">
            Generated: {progress.generated_count + progress.cached_count} / {progress.total_pages} pages
          </p>
        </div>
      )}

      {progress.status === 'complete' && (
        <div className="text-sm text-muted-foreground text-center">
          ✅ {progress.cached_count} pages ready
          {progress.generated_count > 0 && ` (${progress.generated_count} newly generated)`}
        </div>
      )}

      {progress.status === 'error' && (
        <div className="text-sm text-destructive text-center">
          ❌ {progress.error_count} pages failed to generate
          {error && <div className="mt-1">{error}</div>}
        </div>
      )}

      {progress.status !== 'idle' && progress.status !== 'generating' && (
        <Button
          variant="ghost"
          size="sm"
          onClick={resetProgress}
          className="w-full"
        >
          Reset
        </Button>
      )}
    </div>
  );
};