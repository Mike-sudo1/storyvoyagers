import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Clock, 
  BookOpen, 
  Star, 
  Download, 
  User,
  Sparkles,
  Bookmark
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface StoryPreviewProps {
  id?: string;
  title: string;
  subject: string;
  ageRange: string;
  duration: string;
  rating: number;
  description: string;
  coverImage?: string;
  isPremium?: boolean;
  isDownloaded?: boolean;
  onSave?: () => void;
  isSaved?: boolean;
  isLoading?: boolean;
}

const StoryPreview = ({ 
  id,
  title, 
  subject, 
  ageRange, 
  duration, 
  rating, 
  description, 
  coverImage, 
  isPremium = false,
  isDownloaded = false,
  onSave,
  isSaved = false,
  isLoading = false
}: StoryPreviewProps) => {
  const navigate = useNavigate();

  const handleReadStory = () => {
    if (id) {
      navigate(`/story/${id}`);
    }
  };
  return (
    <Card className="group hover-lift bg-gradient-card border-0 shadow-soft hover:shadow-card transition-smooth overflow-hidden">
      {/* Cover Image */}
      <div className="relative h-48 bg-gradient-to-br from-primary/20 to-accent/20 overflow-hidden">
        {coverImage ? (
          <img src={coverImage} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="h-16 w-16 text-primary/40" />
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className="bg-gradient-cosmic text-white border-0 font-fredoka text-xs">
            {subject}
          </Badge>
          {isPremium && (
            <Badge className="bg-gradient-adventure text-white border-0 font-fredoka text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          )}
        </div>

        {/* Download Status */}
        {isDownloaded && (
          <div className="absolute top-3 right-3">
            <div className="p-1.5 bg-success/90 rounded-full">
              <Download className="h-3 w-3 text-white" />
            </div>
          </div>
        )}

        {/* Saved Status */}
        {isSaved && (
          <div className="absolute top-3 right-3" style={{ right: isDownloaded ? '3.5rem' : '0.75rem' }}>
            <div className="p-1.5 bg-primary/90 rounded-full">
              <Bookmark className="h-3 w-3 text-white fill-white" />
            </div>
          </div>
        )}

        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-smooth flex items-center justify-center">
          <Button size="icon" variant="secondary" className="rounded-full">
            <Play className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <CardHeader className="pb-2">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-fredoka font-semibold text-lg leading-tight line-clamp-2">
              {title}
            </h3>
            <div className="flex items-center space-x-1 ml-2">
              <Star className="h-4 w-4 fill-secondary text-secondary" />
              <span className="text-sm font-medium">{rating}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {description}
        </p>

        {/* Meta Information */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <User className="h-3 w-3" />
              <span>{ageRange}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{duration}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="hero" 
            size="sm" 
            className="flex-1 text-xs"
            onClick={handleReadStory}
            disabled={!id}
          >
            Read Story
          </Button>
          {onSave && (
            <Button 
              variant={isSaved ? "default" : "outline"} 
              size="sm"
              onClick={onSave}
              disabled={isLoading}
            >
              {isSaved ? (
                <Bookmark className="h-3 w-3 fill-current" />
              ) : (
                <BookOpen className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StoryPreview;