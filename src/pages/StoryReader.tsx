import React from 'react';
import { useParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { StoryViewer } from '@/components/StoryViewer';
import { StoryGenerationButton } from '@/components/StoryGenerationButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const StoryReader = () => {
  const { storyId } = useParams();
  const { user } = useAuth();
  const [story, setStory] = React.useState<any>(null);
  const [children, setChildren] = React.useState<any[]>([]);
  const [selectedChild, setSelectedChild] = React.useState<string>('');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      if (!storyId || !user) return;

      try {
        // Fetch story
        const { data: storyData, error: storyError } = await supabase
          .from('stories')
          .select('*')
          .eq('id', storyId)
          .single();

        if (storyError) throw storyError;
        setStory(storyData);

        // Fetch user's children
        const { data: childrenData, error: childrenError } = await supabase
          .from('children')
          .select('*')
          .eq('user_id', user.id);

        if (childrenError) throw childrenError;
        setChildren(childrenData || []);
        
        // Auto-select first child if available
        if (childrenData && childrenData.length > 0) {
          setSelectedChild(childrenData[0].id);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [storyId, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="text-center py-8">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p>Story not found</p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-8">
        
        {/* Child Selection & Generation */}
        {children.length > 0 && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Choose Character</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {children.map((child) => (
                  <div
                    key={child.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedChild === child.id
                        ? 'border-primary bg-primary/10'
                        : 'border-muted hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedChild(child.id)}
                  >
                    <div className="text-center space-y-2">
                      {child.avatar_url ? (
                        <img
                          src={child.avatar_url}
                          alt={child.name}
                          className="w-16 h-16 rounded-full mx-auto object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full mx-auto bg-muted flex items-center justify-center">
                          <User className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                      <p className="font-medium">{child.name}</p>
                      <p className="text-sm text-muted-foreground">Age {child.age}</p>
                      {!child.avatar_url && (
                        <p className="text-xs text-orange-600">
                          Avatar needed for personalization
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {selectedChild && (
                <StoryGenerationButton
                  storyId={storyId!}
                  childId={selectedChild}
                />
              )}
            </CardContent>
          </Card>
        )}

        {/* No Children Message */}
        {children.length === 0 && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Create a Child Profile</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                You need to create a child profile to read personalized stories.
              </p>
              <p className="text-sm text-muted-foreground">
                Visit your Profile page to add up to 5 child profiles.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Story Viewer */}
        {selectedChild && (
          <StoryViewer
            storyId={storyId!}
            storyTitle={story.title}
          />
        )}

      </main>
      <Footer />
    </div>
  );
};

export default StoryReader;