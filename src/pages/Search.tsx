import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StoryPreview from "@/components/StoryPreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search as SearchIcon, Filter, X } from "lucide-react";

const allStories = [
  {
    title: "Space Adventure with Luna",
    subject: "Science",
    ageRange: "Ages 6-9",
    duration: "15 min",
    rating: 4.8,
    description: "Join Luna on an incredible journey through the solar system.",
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
    description: "Become a paleontologist and uncover amazing dinosaur fossils.",
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
    description: "Use the power of numbers to save the Math Kingdom.",
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
    description: "Dive deep into the ocean and discover amazing sea creatures.",
    isPremium: true,
    isDownloaded: false,
    genre: "Adventure"
  },
  {
    title: "Medieval Castle Adventure",
    subject: "History",
    ageRange: "Ages 8-12",
    duration: "20 min",
    rating: 4.5,
    description: "Travel back in time to medieval castles and knights.",
    isPremium: false,
    isDownloaded: false,
    genre: "Historical"
  },
  {
    title: "Rainbow Science Lab",
    subject: "Science",
    ageRange: "Ages 5-7",
    duration: "10 min",
    rating: 4.8,
    description: "Learn about colors and light in this fun science adventure.",
    isPremium: true,
    isDownloaded: false,
    genre: "Educational"
  }
];

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [selectedAge, setSelectedAge] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const filteredStories = allStories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         story.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === "all" || story.genre === selectedGenre;
    const matchesAge = selectedAge === "all" || story.ageRange.includes(selectedAge);
    const matchesSubject = selectedSubject === "all" || story.subject === selectedSubject;
    
    return matchesSearch && matchesGenre && matchesAge && matchesSubject;
  });

  const clearFilters = () => {
    setSelectedGenre("all");
    setSelectedAge("all");
    setSelectedSubject("all");
  };

  const activeFilterCount = [selectedGenre, selectedAge, selectedSubject].filter(f => f !== "all").length;

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Search Header */}
      <section className="py-12 bg-gradient-to-br from-accent/5 to-primary/5">
        <div className="container">
          <div className="text-center space-y-6 mb-8">
            <Badge variant="outline" className="border-accent/20 text-accent font-fredoka">
              <SearchIcon className="h-3 w-3 mr-1" />
              Discover Stories
            </Badge>
            <h1 className="text-4xl md:text-5xl font-fredoka font-bold">
              Find Your Perfect
              <span className="bg-gradient-adventure bg-clip-text text-transparent"> Story</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Search through our vast collection of educational adventures
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Search for stories, characters, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-16 py-6 text-lg font-fredoka border-2 focus:border-primary"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 font-fredoka"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      {showFilters && (
        <section className="py-6 bg-muted/50 border-b">
          <div className="container">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-fredoka font-semibold text-lg">Filter Stories</h3>
                  <div className="flex gap-2">
                    {activeFilterCount > 0 && (
                      <Button variant="outline" size="sm" onClick={clearFilters} className="font-fredoka">
                        <X className="h-4 w-4 mr-1" />
                        Clear All
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-fredoka font-medium mb-2">Genre</label>
                    <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Genres" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Genres</SelectItem>
                        <SelectItem value="Adventure">Adventure</SelectItem>
                        <SelectItem value="Discovery">Discovery</SelectItem>
                        <SelectItem value="Fantasy">Fantasy</SelectItem>
                        <SelectItem value="Historical">Historical</SelectItem>
                        <SelectItem value="Educational">Educational</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-fredoka font-medium mb-2">Age Range</label>
                    <Select value={selectedAge} onValueChange={setSelectedAge}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Ages" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Ages</SelectItem>
                        <SelectItem value="5">Ages 5-7</SelectItem>
                        <SelectItem value="6">Ages 6-9</SelectItem>
                        <SelectItem value="7">Ages 7-10</SelectItem>
                        <SelectItem value="8">Ages 8-12</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-fredoka font-medium mb-2">Subject</label>
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Subjects" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Subjects</SelectItem>
                        <SelectItem value="Science">Science</SelectItem>
                        <SelectItem value="Math">Math</SelectItem>
                        <SelectItem value="History">History</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Results */}
      <section className="py-12">
        <div className="container">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="font-fredoka font-bold text-2xl">
                {filteredStories.length} Stories Found
              </h2>
              {searchQuery && (
                <p className="text-muted-foreground">
                  Results for "{searchQuery}"
                </p>
              )}
            </div>
          </div>

          {filteredStories.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStories.map((story, index) => (
                <StoryPreview key={index} {...story} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <SearchIcon className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="font-fredoka font-semibold text-xl mb-2">No Stories Found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search terms or filters
              </p>
              <Button onClick={clearFilters} className="font-fredoka">
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Search;