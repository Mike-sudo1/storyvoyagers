import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Sparkles, Users, BookOpen, Award, Globe } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden py-20 lg:py-28">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5"></div>
      <div className="absolute top-10 left-10 text-accent/20 animate-float">
        <Sparkles className="h-12 w-12" />
      </div>
      <div className="absolute bottom-20 right-10 text-secondary/20 animate-float" style={{ animationDelay: '1s' }}>
        <BookOpen className="h-16 w-16" />
      </div>
      <div className="absolute top-32 right-20 text-primary/20 animate-sparkle">
        <Award className="h-8 w-8" />
      </div>

      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="bg-gradient-adventure text-white border-0 font-fredoka">
                <Sparkles className="h-3 w-3 mr-1" />
                New: Cartoon Avatar Feature!
              </Badge>
              
              <h1 className="text-4xl md:text-6xl font-fredoka font-bold leading-tight">
                Your Child Becomes the
                <span className="bg-gradient-cosmic bg-clip-text text-transparent"> Hero </span>
                of Every Story
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
                Transform learning into magical adventures! Our personalized educational storybooks place your child at the center of real historical events, scientific discoveries, and mathematical quests.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Custom Avatars</p>
                  <p className="text-xs text-muted-foreground">Cartoon face creation</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <BookOpen className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Educational</p>
                  <p className="text-xs text-muted-foreground">Real facts & learning</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-success/10 rounded-lg">
                  <Play className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Interactive</p>
                  <p className="text-xs text-muted-foreground">Audio & quizzes</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Globe className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Bilingual</p>
                  <p className="text-xs text-muted-foreground">English & Spanish</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" className="text-base px-8">
                <Sparkles className="h-5 w-5" />
                Start Creating Stories
              </Button>
              <Button variant="outline" size="lg" className="text-base px-8">
                <Play className="h-5 w-5" />
                Watch Demo
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Award className="h-4 w-4 text-success" />
                <span>Educational Standards Aligned</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-primary" />
                <span>10,000+ Happy Families</span>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-card hover-lift">
              <img 
                src={heroImage} 
                alt="Children exploring magical educational adventures in personalized storybooks"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent"></div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-6 -left-6 bg-gradient-card p-4 rounded-2xl shadow-card animate-float">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-cosmic rounded-full flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-fredoka font-semibold text-sm">Emma's Moon Adventure</p>
                  <p className="text-xs text-muted-foreground">History • Age 7</p>
                </div>
              </div>
            </div>
            
            <div className="absolute -bottom-6 -right-6 bg-gradient-card p-4 rounded-2xl shadow-card animate-float" style={{ animationDelay: '2s' }}>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-adventure rounded-full flex items-center justify-center">
                  <Award className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-fredoka font-semibold text-sm">Quiz Completed!</p>
                  <p className="text-xs text-muted-foreground">+50 Learning Points</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;