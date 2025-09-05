import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, ChevronRight } from 'lucide-react';

interface Child {
  id: string;
  name: string;
  age: number;
  avatar_url?: string;
  grade?: string;
  language_preference?: string;
}

interface ChildSelectorProps {
  children: Child[];
  selectedChild?: Child;
  onChildSelect: (child: Child) => void;
  onContinue: () => void;
  storyTitle: string;
}

export const ChildSelector = ({ 
  children, 
  selectedChild, 
  onChildSelect, 
  onContinue,
  storyTitle 
}: ChildSelectorProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Choose Your Character</CardTitle>
          <p className="text-muted-foreground">
            Who would you like to be the hero of "{storyTitle}"?
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            {children.map((child) => (
              <div
                key={child.id}
                className={`
                  p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-[1.02]
                  ${selectedChild?.id === child.id 
                    ? 'border-primary bg-primary/5 shadow-md' 
                    : 'border-border hover:border-primary/50'
                  }
                `}
                onClick={() => onChildSelect(child)}
              >
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage 
                      src={child.avatar_url || undefined} 
                      alt={child.name}
                    />
                    <AvatarFallback>
                      <User className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{child.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="secondary">Age {child.age}</Badge>
                      {child.grade && (
                        <Badge variant="outline">Grade {child.grade}</Badge>
                      )}
                    </div>
                  </div>
                  
                  {selectedChild?.id === child.id && (
                    <div className="text-primary">
                      <ChevronRight className="h-6 w-6" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="pt-4">
            <Button 
              onClick={onContinue}
              disabled={!selectedChild}
              className="w-full h-12 text-lg"
            >
              Start Reading with {selectedChild?.name || 'Selected Child'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};