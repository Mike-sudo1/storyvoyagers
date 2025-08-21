import StoryPreview from "@/components/StoryPreview";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

const sampleStories = [
  {
    title: "Moon Landing Adventure with Emma",
    subject: "History",
    ageRange: "Ages 6-9",
    duration: "12 min",
    rating: 4.9,
    description: "Join Emma as she becomes an astronaut alongside Neil Armstrong and Buzz Aldrin in the historic Apollo 11 mission. Learn about space travel, the moon's surface, and the courage it took to make this giant leap for mankind.",
    isPremium: false,
    isDownloaded: true
  },
  {
    title: "The Water Cycle Quest with Alex",
    subject: "Science",
    ageRange: "Ages 5-8",
    duration: "8 min",
    rating: 4.8,
    description: "Alex discovers how water travels around our planet! From fluffy clouds to rushing rivers, explore evaporation, condensation, and precipitation in this wet and wonderful adventure.",
    isPremium: true,
    isDownloaded: false
  },
  {
    title: "Egyptian Pyramid Mystery with Sofia",
    subject: "History",
    ageRange: "Ages 7-10",
    duration: "15 min",
    rating: 4.9,
    description: "Sofia travels back in time to ancient Egypt to help build the Great Pyramid of Giza. Meet pharaohs, learn about hieroglyphs, and discover the incredible engineering behind these ancient wonders.",
    isPremium: true,
    isDownloaded: false
  },
  {
    title: "Multiplication Pizza Party with Marcus",
    subject: "Math",
    ageRange: "Ages 6-9",
    duration: "10 min", 
    rating: 4.7,
    description: "Marcus opens his own pizza restaurant and learns multiplication by serving hungry customers. From doubling recipes to calculating change, math becomes deliciously fun!",
    isPremium: false,
    isDownloaded: true
  }
];

const StoriesShowcase = () => {
  return (
    <section className="py-20 lg:py-28 bg-muted/30">
      <div className="container">
        <div className="text-center space-y-4 mb-16">
          <Badge variant="outline" className="border-secondary/20 text-secondary font-fredoka">
            <Sparkles className="h-3 w-3 mr-1" />
            Story Library
          </Badge>
          <h2 className="text-3xl md:text-5xl font-fredoka font-bold">
            Educational Adventures
            <span className="bg-gradient-adventure bg-clip-text text-transparent"> Await</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Explore our growing collection of personalized stories that turn learning into unforgettable adventures. Each story adapts to your child's interests and reading level.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {sampleStories.map((story, index) => (
            <StoryPreview key={index} {...story} />
          ))}
        </div>

        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            <span className="font-semibold">50+ stories</span> available across History, Science, Math, and Geography
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge className="bg-gradient-cosmic text-white border-0 font-fredoka">History</Badge>
            <Badge className="bg-gradient-adventure text-white border-0 font-fredoka">Science</Badge>
            <Badge className="bg-gradient-success text-white border-0 font-fredoka">Math</Badge>
            <Badge className="bg-accent text-accent-foreground font-fredoka">Geography</Badge>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StoriesShowcase;