import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  Palette, 
  BookOpen, 
  Headphones, 
  Globe, 
  Download, 
  Trophy, 
  Users,
  Sparkles
} from "lucide-react";

const features = [
  {
    icon: Camera,
    title: "Photo to Cartoon Avatar",
    description: "Upload your child's photo and watch it transform into a friendly cartoon character that appears throughout their personalized stories.",
    badge: "New!",
    color: "accent"
  },
  {
    icon: BookOpen,
    title: "Educational Adventures",
    description: "Real historical events, scientific discoveries, and mathematical concepts woven into engaging stories that make learning unforgettable.",
    badge: "Core Feature",
    color: "primary"
  },
  {
    icon: Palette,
    title: "Personalized Stories",
    description: "Every story is uniquely crafted with your child's name, interests, and cartoon avatar integrated into the illustrations and narrative.",
    badge: "Popular",
    color: "secondary"
  },
  {
    icon: Headphones,
    title: "Audio Narration",
    description: "Professional narration with word highlighting, adjustable speed, and multiple voice options to support different learning styles.",
    badge: "Accessibility",
    color: "success"
  },
  {
    icon: Globe,
    title: "Bilingual Learning",
    description: "Stories available in English and Spanish with side-by-side translation mode to support multilingual families.",
    badge: "Inclusive",
    color: "accent"
  },
  {
    icon: Download,
    title: "Offline Reading",
    description: "Download stories for offline reading during travel, with progress syncing when you're back online.",
    badge: "Convenience",
    color: "primary"
  },
  {
    icon: Trophy,
    title: "Progress Tracking",
    description: "Interactive quizzes, learning badges, and detailed progress reports help parents track their child's educational journey.",
    badge: "Parent Insight",
    color: "success"
  },
  {
    icon: Users,
    title: "Family Profiles",
    description: "Create multiple child profiles with individual avatars, preferences, and reading levels all under one family account.",
    badge: "Multi-Child",
    color: "secondary"
  }
];

const colorMap = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/10 text-secondary", 
  accent: "bg-accent/10 text-accent",
  success: "bg-success/10 text-success"
};

const badgeColorMap = {
  primary: "bg-gradient-cosmic",
  secondary: "bg-gradient-adventure",
  accent: "bg-gradient-cosmic",
  success: "bg-gradient-success"
};

const FeaturesSection = () => {
  return (
    <section className="py-20 lg:py-28">
      <div className="container">
        <div className="text-center space-y-4 mb-16">
          <Badge variant="outline" className="border-primary/20 text-primary font-fredoka">
            <Sparkles className="h-3 w-3 mr-1" />
            Features That Make Magic
          </Badge>
          <h2 className="text-3xl md:text-5xl font-fredoka font-bold">
            Where Learning Meets
            <span className="bg-gradient-cosmic bg-clip-text text-transparent"> Adventure</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Discover the powerful features that transform ordinary stories into personalized educational adventures that captivate young minds.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className="relative group hover-lift bg-gradient-card border-0 shadow-soft hover:shadow-card transition-smooth"
              >
                <CardContent className="p-6 space-y-4">
                  {/* Badge */}
                  <Badge 
                    className={`absolute top-4 right-4 ${badgeColorMap[feature.color as keyof typeof badgeColorMap]} text-white border-0 text-xs font-fredoka`}
                  >
                    {feature.badge}
                  </Badge>

                  {/* Icon */}
                  <div className={`p-3 rounded-xl ${colorMap[feature.color as keyof typeof colorMap]} w-fit`}>
                    <Icon className="h-6 w-6" />
                  </div>

                  {/* Content */}
                  <div className="space-y-2 pt-2">
                    <h3 className="font-fredoka font-semibold text-lg leading-tight">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;