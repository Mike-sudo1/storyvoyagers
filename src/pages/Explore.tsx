import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StoryPreview from "@/components/StoryPreview";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, 
  Filter, 
  Compass, 
  BookOpen, 
  Sparkles,
  Clock,
  Star,
  Users
} from "lucide-react";

const subjects = ["All", "History", "Science", "Math", "Geography"];
const ageRanges = ["All Ages", "Ages 3-5", "Ages 6-8", "Ages 9-12"];

const allStories = [
  {
    title: "Moon Landing Adventure with Emma",
    subject: "History",
    ageRange: "Ages 6-9",
    duration: "12 min",
    rating: 4.9,
    description: "Join Emma as she becomes an astronaut alongside Neil Armstrong and Buzz Aldrin in the historic Apollo 11 mission.",
    isPremium: false,
    isDownloaded: true
  },
  {
    title: "The Water Cycle Quest with Alex",
    subject: "Science", 
    ageRange: "Ages 5-8",
    duration: "8 min",
    rating: 4.8,
    description: "Alex discovers how water travels around our planet! From fluffy clouds to rushing rivers.",
    isPremium: true,
    isDownloaded: false
  },
  {
    title: "Egyptian Pyramid Mystery with Sofia",
    subject: "History",
    ageRange: "Ages 7-10", 
    duration: "15 min",
    rating: 4.9,
    description: "Sofia travels back in time to ancient Egypt to help build the Great Pyramid of Giza.",
    isPremium: true,
    isDownloaded: false
  },
  {
    title: "Multiplication Pizza Party with Marcus",
    subject: "Math",
    ageRange: "Ages 6-9",
    duration: "10 min",
    rating: 4.7,
    description: "Marcus opens his own pizza restaurant and learns multiplication by serving hungry customers.",
    isPremium: false,
    isDownloaded: true
  },
  {
    title: "Volcano Explorer with Maya",
    subject: "Science",
    ageRange: "Ages 8-11",
    duration: "14 min", 
    rating: 4.8,
    description: "Maya becomes a volcanologist studying how volcanoes form and why they erupt.",
    isPremium: true,
    isDownloaded: false
  },
  {
    title: "Ancient Rome Adventure with Lucas",
    subject: "History",
    ageRange: "Ages 9-12",
    duration: "18 min",
    rating: 4.9,
    description: "Lucas becomes a gladiator trainer in ancient Rome, learning about Roman culture and history.",
    isPremium: true,
    isDownloaded: false
  }
];

const Explore = () => {
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [selectedAge, setSelectedAge] = useState("All Ages");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStories = allStories.filter(story => {
    const matchesSubject = selectedSubject === "All" || story.subject === selectedSubject;
    const matchesAge = selectedAge === "All Ages" || story.ageRange === selectedAge;
    const matchesSearch = story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         story.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesAge && matchesSearch;
  });

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container">
          <div className="text-center space-y-6 mb-12">
            <Badge variant="outline" className="border-primary/20 text-primary font-fredoka">
              <Compass className="h-3 w-3 mr-1" />
              Discover Adventures
            </Badge>
            <h1 className="text-4xl md:text-6xl font-fredoka font-bold">
              Explore Our
              <span className="bg-gradient-cosmic bg-clip-text text-transparent"> Story Universe</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover educational adventures across history, science, math, and geography. Every story can be personalized with your child's cartoon avatar!
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for adventures..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg rounded-2xl border-2 focus:border-primary"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filters & Content */}
      <section className="py-12">
        <div className="container">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <div className="lg:w-1/4 space-y-6">
              <Card className="bg-gradient-card border-0 shadow-soft">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Filter className="h-5 w-5 text-primary" />
                    <h3 className="font-fredoka font-semibold text-lg">Filters</h3>
                  </div>
                  
                  {/* Subject Filter */}
                  <div className="space-y-3 mb-6">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Subject</h4>
                    <div className="flex flex-wrap gap-2">
                      {subjects.map((subject) => (
                        <Button
                          key={subject}
                          variant={selectedSubject === subject ? "hero" : "outline"}
                          size="sm"
                          onClick={() => setSelectedSubject(subject)}
                          className="text-xs"
                        >
                          {subject}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Age Filter */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Age Range</h4>
                    <div className="flex flex-col gap-2">
                      {ageRanges.map((age) => (
                        <Button
                          key={age}
                          variant={selectedAge === age ? "hero" : "ghost"}
                          size="sm"
                          onClick={() => setSelectedAge(age)}
                          className="justify-start text-xs"
                        >
                          <Users className="h-3 w-3 mr-2" />
                          {age}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Card */}
              <Card className="bg-gradient-adventure border-0 shadow-soft">
                <CardContent className="p-6 text-white">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="h-5 w-5" />
                      <h3 className="font-fredoka font-semibold">Story Stats</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="font-fredoka font-bold text-2xl">50+</div>
                        <div className="text-xs opacity-90">Total Stories</div>
                      </div>
                      <div className="text-center">
                        <div className="font-fredoka font-bold text-2xl">4.8</div>
                        <div className="text-xs opacity-90">Avg Rating</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Story Grid */}
            <div className="lg:w-3/4">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="font-fredoka font-semibold text-2xl">
                    {filteredStories.length} Stories Found
                  </h2>
                  <p className="text-muted-foreground">
                    {selectedSubject !== "All" && `in ${selectedSubject}`}
                    {selectedAge !== "All Ages" && ` for ${selectedAge}`}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-secondary" />
                  <span className="text-sm text-muted-foreground">Sorted by popularity</span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredStories.map((story, index) => (
                  <StoryPreview key={index} {...story} />
                ))}
              </div>

              {filteredStories.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="font-fredoka font-semibold text-xl mb-2">No Stories Found</h3>
                  <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
                  <Button 
                    variant="hero" 
                    className="mt-4"
                    onClick={() => {
                      setSelectedSubject("All");
                      setSelectedAge("All Ages");
                      setSearchQuery("");
                    }}
                  >
                    <Sparkles className="h-4 w-4" />
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Explore;