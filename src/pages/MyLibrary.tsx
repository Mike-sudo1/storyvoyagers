import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StoryPreview from "@/components/StoryPreview";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Library, 
  Download, 
  Clock, 
  Trophy, 
  Sparkles,
  BookOpen,
  Play,
  CheckCircle,
  WifiOff,
  Plus
} from "lucide-react";

const libraryStories = [
  {
    title: "Moon Landing Adventure with Emma",
    subject: "History",
    ageRange: "Ages 6-9", 
    duration: "12 min",
    rating: 4.9,
    description: "Join Emma as she becomes an astronaut alongside Neil Armstrong and Buzz Aldrin.",
    isPremium: false,
    isDownloaded: true,
    progress: 100,
    completed: true
  },
  {
    title: "Multiplication Pizza Party with Marcus",
    subject: "Math", 
    ageRange: "Ages 6-9",
    duration: "10 min",
    rating: 4.7,
    description: "Marcus opens his own pizza restaurant and learns multiplication.",
    isPremium: false,
    isDownloaded: true,
    progress: 75,
    completed: false
  },
  {
    title: "The Water Cycle Quest with Alex",
    subject: "Science",
    ageRange: "Ages 5-8",
    duration: "8 min", 
    rating: 4.8,
    description: "Alex discovers how water travels around our planet!",
    isPremium: true,
    isDownloaded: false,
    progress: 30,
    completed: false
  }
];

const badges = [
  { name: "Space Explorer", description: "Completed 3 space stories", icon: "🚀", earned: true },
  { name: "Math Wizard", description: "Mastered multiplication", icon: "🧮", earned: true },
  { name: "History Buff", description: "Explored 5 historical events", icon: "🏛️", earned: true },
  { name: "Science Detective", description: "Solved 10 science mysteries", icon: "🔬", earned: false },
  { name: "Geography Champion", description: "Visited all continents", icon: "🌍", earned: false },
  { name: "Reading Streak", description: "Read for 7 days straight", icon: "📚", earned: false }
];

const MyLibrary = () => {
  const [activeTab, setActiveTab] = useState("all");

  const completedStories = libraryStories.filter(story => story.completed);
  const inProgressStories = libraryStories.filter(story => !story.completed && story.progress > 0);
  const downloadedStories = libraryStories.filter(story => story.isDownloaded);

  const getStoriesForTab = (tab: string) => {
    switch (tab) {
      case "completed": return completedStories;
      case "progress": return inProgressStories;
      case "downloaded": return downloadedStories;
      default: return libraryStories;
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
              <Library className="h-3 w-3 mr-1" />
              Personal Library
            </Badge>
            <h1 className="text-4xl md:text-6xl font-fredoka font-bold">
              Your Learning
              <span className="bg-gradient-success bg-clip-text text-transparent"> Adventures</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Track your progress, collect badges, and continue your educational journey. All your personalized stories in one place!
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
                  <Trophy className="h-6 w-6 text-secondary" />
                </div>
                <div className="font-fredoka font-bold text-2xl">{badges.filter(b => b.earned).length}</div>
                <div className="text-sm text-muted-foreground">Badges Earned</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-0 shadow-soft">
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-accent/10 rounded-xl w-fit mx-auto mb-3">
                  <Download className="h-6 w-6 text-accent" />
                </div>
                <div className="font-fredoka font-bold text-2xl">{downloadedStories.length}</div>
                <div className="text-sm text-muted-foreground">Downloaded</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Library */}
            <div className="lg:col-span-3">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-fredoka font-semibold text-2xl">My Stories</h2>
                <Button variant="hero" size="sm">
                  <Plus className="h-4 w-4" />
                  Add New Story
                </Button>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="all" className="font-fredoka">All Stories</TabsTrigger>
                  <TabsTrigger value="progress" className="font-fredoka">In Progress</TabsTrigger>
                  <TabsTrigger value="completed" className="font-fredoka">Completed</TabsTrigger>
                  <TabsTrigger value="downloaded" className="font-fredoka">
                    <WifiOff className="h-3 w-3 mr-1" />
                    Offline
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {getStoriesForTab("all").map((story, index) => (
                      <div key={index} className="relative">
                        <StoryPreview {...story} />
                        {story.progress > 0 && story.progress < 100 && (
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-secondary text-white border-0 font-fredoka text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {story.progress}% Complete
                            </Badge>
                          </div>
                        )}
                        {story.completed && (
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-success text-white border-0 font-fredoka text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="progress">
                  <div className="grid md:grid-cols-2 gap-6">
                    {getStoriesForTab("progress").map((story, index) => (
                      <div key={index} className="relative">
                        <StoryPreview {...story} />
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-secondary text-white border-0 font-fredoka text-xs">
                            <Play className="h-3 w-3 mr-1" />
                            Continue Reading
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  {inProgressStories.length === 0 && (
                    <div className="text-center py-12">
                      <Clock className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                      <h3 className="font-fredoka font-semibold text-xl mb-2">No Stories in Progress</h3>
                      <p className="text-muted-foreground">Start reading a story to see it here!</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="completed">
                  <div className="grid md:grid-cols-2 gap-6">
                    {getStoriesForTab("completed").map((story, index) => (
                      <StoryPreview key={index} {...story} />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="downloaded">
                  <div className="grid md:grid-cols-2 gap-6">
                    {getStoriesForTab("downloaded").map((story, index) => (
                      <StoryPreview key={index} {...story} />
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar - Badges */}
            <div className="lg:col-span-1">
              <Card className="bg-gradient-card border-0 shadow-soft sticky top-6">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-6">
                    <Trophy className="h-5 w-5 text-secondary" />
                    <h3 className="font-fredoka font-semibold text-lg">Achievement Badges</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {badges.map((badge, index) => (
                      <div 
                        key={index}
                        className={`p-4 rounded-xl border transition-smooth ${
                          badge.earned 
                            ? 'bg-gradient-adventure border-secondary/20' 
                            : 'bg-muted/50 border-border grayscale'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="text-2xl">{badge.icon}</div>
                          <div className="flex-1">
                            <h4 className={`font-fredoka font-medium text-sm ${
                              badge.earned ? 'text-white' : 'text-muted-foreground'
                            }`}>
                              {badge.name}
                            </h4>
                            <p className={`text-xs ${
                              badge.earned ? 'text-white/80' : 'text-muted-foreground'
                            }`}>
                              {badge.description}
                            </p>
                          </div>
                          {badge.earned && (
                            <CheckCircle className="h-4 w-4 text-white" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MyLibrary;