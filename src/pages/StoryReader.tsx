import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, BookOpen } from "lucide-react";

const StoryReader = () => {
  const { storyId } = useParams();

  return (
    <div className="min-h-screen">
      <Header />
      
      <section className="py-16">
        <div className="container max-w-4xl">
          <div className="text-center py-32">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-cosmic rounded-2xl mb-8">
              <BookOpen className="h-12 w-12 text-white" />
            </div>
            
            <h1 className="font-fredoka font-bold text-4xl mb-4">
              Story Placeholder
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Your personalized educational adventure will appear here soon! We're working on bringing your stories to life with your cartoon avatar.
            </p>
            
            <div className="space-y-4 max-w-md mx-auto">
              <Card className="bg-gradient-card border-0 shadow-soft p-6">
                <CardContent className="space-y-4">
                  <div className="text-left">
                    <h3 className="font-fredoka font-semibold text-lg mb-2">Coming Soon:</h3>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li>• Interactive story pages with your cartoon avatar</li>
                      <li>• Audio narration and sound effects</li>
                      <li>• Educational quizzes and activities</li>
                      <li>• Progress tracking and achievements</li>
                      <li>• Bilingual reading support</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full font-fredoka"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default StoryReader;