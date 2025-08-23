import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StoryPreview from "@/components/StoryPreview";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Clock, Heart, TrendingUp } from "lucide-react";

const recommendedStories = [
  {
    title: "Space Adventure with Luna",
    subject: "Science",
    ageRange: "Ages 6-9",
    duration: "15 min",
    rating: 4.8,
    description: "Join Luna on an incredible journey through the solar system, learning about planets, stars, and space exploration!",
    isPremium: false,
    isDownloaded: false,
    genre: "Adventure"
  },
  {
    title: "The Great Dinosaur Discovery",
    subject: "History", 
    ageRange: "Ages 5-8",
    duration: "12 min",
    rating: 4.9,
    description: "Become a paleontologist and uncover amazing dinosaur fossils in this exciting prehistoric adventure.",
    isPremium: true,
    isDownloaded: false,
    genre: "Discovery"
  },
  {
    title: "Math Magic Kingdom",
    subject: "Math",
    ageRange: "Ages 7-10", 
    duration: "18 min",
    rating: 4.7,
    description: "Use the power of numbers to save the Math Kingdom from the Chaos Dragon in this magical adventure.",
    isPremium: false,
    isDownloaded: false,
    genre: "Fantasy"
  },
  {
    title: "Ocean Explorer's Quest",
    subject: "Science",
    ageRange: "Ages 6-9",
    duration: "14 min", 
    rating: 4.6,
    description: "Dive deep into the ocean and discover amazing sea creatures and underwater ecosystems.",
    isPremium: true,
    isDownloaded: false,
    genre: "Adventure"
  }
];

const Home = () => {
  const [savedStories, setSavedStories] = useState<Set<string>>(new Set());

  const toggleSaveStory = (title: string) => {
    const newSaved = new Set(savedStories);
    if (newSaved.has(title)) {
      newSaved.delete(title);
    } else {
      newSaved.add(title);
    }
    setSavedStories(newSaved);
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Welcome Section */}
      <section className="py-12 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container">
          <div className="text-center space-y-6 mb-12">
            <Badge variant="outline" className="border-primary/20 text-primary font-fredoka">
              <BookOpen className="h-3 w-3 mr-1" />
              Welcome Back, Explorer!
            </Badge>
            <h1 className="text-4xl md:text-5xl font-fredoka font-bold">
              Your Next
              <span className="bg-gradient-adventure bg-clip-text text-transparent"> Adventure</span> Awaits
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover personalized stories crafted just for you. Continue your learning journey or start a new adventure!
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12">
            <Card className="bg-gradient-card border-0 shadow-soft">
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-primary/10 rounded-xl w-fit mx-auto mb-3">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div className="font-fredoka font-bold text-2xl">12</div>
                <div className="text-sm text-muted-foreground">Stories Completed</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-0 shadow-soft">
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-secondary/10 rounded-xl w-fit mx-auto mb-3">
                  <Clock className="h-6 w-6 text-secondary" />
                </div>
                <div className="font-fredoka font-bold text-2xl">45</div>
                <div className="text-sm text-muted-foreground">Minutes Read Today</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-0 shadow-soft">
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-accent/10 rounded-xl w-fit mx-auto mb-3">
                  <Heart className="h-6 w-6 text-accent" />
                </div>
                <div className="font-fredoka font-bold text-2xl">{savedStories.size}</div>
                <div className="text-sm text-muted-foreground">Stories Saved</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Recommended Stories */}
      <section className="py-16">
        <div className="container">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="font-fredoka font-bold text-3xl mb-2">Recommended for You</h2>
              <p className="text-muted-foreground">Stories picked based on your age and interests</p>
            </div>
            <Button variant="outline" className="font-fredoka">
              <Link to="/search">View All Stories</Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {recommendedStories.map((story, index) => (
              <div key={index} className="relative group">
                <StoryPreview 
                  {...story} 
                  onSave={() => toggleSaveStory(story.title)}
                  isSaved={savedStories.has(story.title)}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300 rounded-xl pointer-events-none" />
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button
                    size="sm"
                    variant={savedStories.has(story.title) ? "default" : "outline"}
                    onClick={() => toggleSaveStory(story.title)}
                    className="font-fredoka"
                  >
                    <Heart className={`h-4 w-4 ${savedStories.has(story.title) ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/search">
              <Button size="lg" className="font-fredoka">
                Explore More Stories
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;