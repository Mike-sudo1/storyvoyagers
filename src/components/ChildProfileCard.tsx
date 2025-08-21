import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Camera, 
  Trophy, 
  BookOpen, 
  Plus, 
  Sparkles,
  Upload 
} from "lucide-react";

interface ChildProfileCardProps {
  name?: string;
  age?: number;
  avatarUrl?: string;
  storiesCompleted?: number;
  badges?: number;
  isNew?: boolean;
}

const ChildProfileCard = ({
  name,
  age,
  avatarUrl,
  storiesCompleted = 0,
  badges = 0,
  isNew = false
}: ChildProfileCardProps) => {
  if (isNew) {
    return (
      <Card className="group hover-lift bg-gradient-card border-2 border-dashed border-primary/30 shadow-soft hover:shadow-card transition-smooth cursor-pointer">
        <CardContent className="p-8 flex flex-col items-center justify-center space-y-4 min-h-[280px]">
          <div className="p-6 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-smooth">
            <Plus className="h-12 w-12 text-primary" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="font-fredoka font-semibold text-lg">Add New Child</h3>
            <p className="text-sm text-muted-foreground">
              Create a profile and upload a photo to generate their cartoon avatar
            </p>
          </div>
          <Button variant="hero" size="sm">
            <Sparkles className="h-4 w-4" />
            Get Started
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group hover-lift bg-gradient-card border-0 shadow-soft hover:shadow-card transition-smooth">
      <CardContent className="p-6 space-y-4">
        {/* Avatar Section */}
        <div className="relative mx-auto w-24 h-24">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={`${name}'s cartoon avatar`}
              className="w-full h-full rounded-full object-cover border-4 border-primary/20"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-gradient-cosmic flex items-center justify-center border-4 border-primary/20">
              <User className="h-10 w-10 text-white" />
            </div>
          )}
          
          {/* Upload/Edit Avatar Button */}
          <Button 
            size="icon" 
            variant="secondary" 
            className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full shadow-soft"
          >
            {avatarUrl ? <Camera className="h-3 w-3" /> : <Upload className="h-3 w-3" />}
          </Button>
        </div>

        {/* Child Info */}
        <div className="text-center space-y-2">
          <h3 className="font-fredoka font-bold text-xl">{name || 'New Child'}</h3>
          {age && (
            <Badge variant="outline" className="border-primary/20 text-primary font-medium">
              Age {age}
            </Badge>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center space-x-1">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="font-fredoka font-bold text-lg">{storiesCompleted}</span>
            </div>
            <p className="text-xs text-muted-foreground">Stories</p>
          </div>
          
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center space-x-1">
              <Trophy className="h-4 w-4 text-secondary" />
              <span className="font-fredoka font-bold text-lg">{badges}</span>
            </div>
            <p className="text-xs text-muted-foreground">Badges</p>
          </div>
        </div>

        {/* Action Button */}
        <Button variant="adventure" className="w-full text-sm">
          <Sparkles className="h-4 w-4" />
          {avatarUrl ? 'Create Story' : 'Upload Photo'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ChildProfileCard;