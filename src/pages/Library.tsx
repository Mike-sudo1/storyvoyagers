import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StoryPreview from "@/components/StoryPreview";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Library as LibraryIcon, 
  BookOpen, 
  Clock, 
  CheckCircle, 
  Heart,
  Play,
  RotateCcw
} from "lucide-react";

const libraryStories = [
  {
    title: "Space Adventure with Luna",
    subject: "Science",
    ageRange: "Ages 6-9",
    duration: "15 min",
    rating: 4.8,
    description: "Join Luna on an incredible journey through the solar system.",
    isPremium: false,
    isDownloaded: true,
    progress: 100,
    status: "completed",
    lastRead: "2 days ago"
  },
  {
    title: "The Great Dinosaur Discovery",
    subject: "History", 
    ageRange: "Ages 5-8",
    duration: "12 min",
    rating: 4.9,
    description: "Become a paleontologist and uncover amazing dinosaur fossils.",
    isPremium: true,
    isDownloaded: true,
    progress: 65,
    status: "reading",
    lastRead: "Today"
  },
  {
    title: "Math Magic Kingdom",
    subject: "Math",
    ageRange: "Ages 7-10", 
    duration: "18 min",
    rating: 4.7,
    description: "Use the power of numbers to save the Math Kingdom.",
    isPremium: false,
    isDownloaded: false,
    progress: 0,
    status: "saved",
    lastRead: "Never"
  },
  {
    title: "Ocean Explorer's Quest",
    subject: "Science",
    ageRange: "Ages 6-9",
    duration: "14 min", 
    rating: 4.6,
    description: "Dive deep into the ocean and discover amazing sea creatures.",
    isPremium: true,
    isDownloaded: true,
    progress: 25,
    status: "reading",
    lastRead: "3 days ago"
  }
];

const Library = () => {
  const [activeTab, setActiveTab] = useState("all");

  const completedStories = libraryStories.filter(story => story.status === "completed");
  const currentStories = libraryStories.filter(story => story.status === "reading");
  const savedStories = libraryStories.filter(story => story.status === "saved");

  const getStoriesForTab = (tab: string) => {
    switch (tab) {
      case "completed": return completedStories;
      case "current": return currentStories;
      case "saved": return savedStories;
      default: return libraryStories;
    }
  };

  const getStatusBadge = (story: any) => {
    switch (story.status) {
      case "completed":
        return (
          <Badge className="bg-success text-success-foreground border-0 font-fredoka text-xs">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "reading":
        return (
          <Badge className="bg-secondary text-secondary-foreground border-0 font-fredoka text-xs">
            <Play className="h-3 w-3 mr-1" />
            Continue Reading
          </Badge>
        );
      case "saved":
        return (
          <Badge className="bg-accent text-accent-foreground border-0 font-fredoka text-xs">
            <Heart className="h-3 w-3 mr-1" />
            Saved
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-success/5 to-primary/5">
        <div className="container">
          <div className="text-center space-y-6 mb-12">
            <Badge variant="outline" className="border-success/20 text-success font-fredoka">
              <LibraryIcon className="h-3 w-3 mr-1" />
              Your Library
            </Badge>
            <h1 className="text-4xl md:text-6xl font-fredoka font-bold">
              Your Reading
              <span className="bg-gradient-success bg-clip-text text-transparent"> Journey</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Track your progress, continue your adventures, and discover what you've accomplished
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <Card className="bg-gradient-card border-0 shadow-soft">
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-primary/10 rounded-xl w-fit mx-auto mb-3">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div className="font-fredoka font-bold text-2xl">{libraryStories.length}</div>
                <div className="text-sm text-muted-foreground">Total Stories</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-0 shadow-soft">
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-success/10 rounded-xl w-fit mx-auto mb-3">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
                <div className="font-fredoka font-bold text-2xl">{completedStories.length}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-0 shadow-soft">
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-secondary/10 rounded-xl w-fit mx-auto mb-3">
                  <Clock className="h-6 w-6 text-secondary" />
                </div>
                <div className="font-fredoka font-bold text-2xl">{currentStories.length}</div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-0 shadow-soft">
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-accent/10 rounded-xl w-fit mx-auto mb-3">
                  <Heart className="h-6 w-6 text-accent" />
                </div>
                <div className="font-fredoka font-bold text-2xl">{savedStories.length}</div>
                <div className="text-sm text-muted-foreground">Saved</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Library Content */}
      <section className="py-12">
        <div className="container">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-between items-center mb-8">
              <TabsList className="grid w-fit grid-cols-4">
                <TabsTrigger value="all" className="font-fredoka">All Stories</TabsTrigger>
                <TabsTrigger value="current" className="font-fredoka">Current</TabsTrigger>
                <TabsTrigger value="completed" className="font-fredoka">Completed</TabsTrigger>
                <TabsTrigger value="saved" className="font-fredoka">Saved</TabsTrigger>
              </TabsList>
              
              <Button variant="outline" className="font-fredoka">
                <RotateCcw className="h-4 w-4 mr-2" />
                Sync Library
              </Button>
            </div>

            <TabsContent value="all" className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {libraryStories.map((story, index) => (
                  <div key={index} className="relative">
                    <Card className="bg-gradient-card border-0 shadow-soft hover:shadow-glow transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <Badge variant="outline" className="font-fredoka text-xs">
                            {story.subject}
                          </Badge>
                          {getStatusBadge(story)}
                        </div>
                        
                        <h3 className="font-fredoka font-bold text-lg mb-2 line-clamp-2">
                          {story.title}
                        </h3>
                        
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                          {story.description}
                        </p>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-fredoka font-medium">{story.progress}%</span>
                          </div>
                          <Progress value={story.progress} className="h-2" />
                          
                          <div className="flex justify-between items-center text-sm text-muted-foreground">
                            <span>{story.ageRange}</span>
                            <span>{story.duration}</span>
                          </div>
                          
                          <div className="text-xs text-muted-foreground">
                            Last read: {story.lastRead}
                          </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                          <Button size="sm" className="flex-1 font-fredoka">
                            {story.status === "completed" ? "Read Again" : 
                             story.status === "reading" ? "Continue" : "Start Reading"}
                          </Button>
                          {story.status === "saved" && (
                            <Button size="sm" variant="outline" className="font-fredoka">
                              Remove
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="current">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getStoriesForTab("current").map((story, index) => (
                  <div key={index} className="relative">
                    <Card className="bg-gradient-card border-0 shadow-soft">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <Badge variant="outline" className="font-fredoka text-xs">
                            {story.subject}
                          </Badge>
                          {getStatusBadge(story)}
                        </div>
                        
                        <h3 className="font-fredoka font-bold text-lg mb-2">
                          {story.title}
                        </h3>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-fredoka font-medium">{story.progress}%</span>
                          </div>
                          <Progress value={story.progress} className="h-2" />
                        </div>

                        <Button size="sm" className="w-full mt-4 font-fredoka">
                          <Play className="h-4 w-4 mr-2" />
                          Continue Reading
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
              {currentStories.length === 0 && (
                <div className="text-center py-16">
                  <Clock className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="font-fredoka font-semibold text-xl mb-2">No Stories in Progress</h3>
                  <p className="text-muted-foreground">Start reading a story to see it here!</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getStoriesForTab("completed").map((story, index) => (
                  <StoryPreview key={index} {...story} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="saved">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getStoriesForTab("saved").map((story, index) => (
                  <StoryPreview key={index} {...story} />
                ))}
              </div>
              {savedStories.length === 0 && (
                <div className="text-center py-16">
                  <Heart className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="font-fredoka font-semibold text-xl mb-2">No Saved Stories</h3>
                  <p className="text-muted-foreground">Save stories you want to read later!</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Library;