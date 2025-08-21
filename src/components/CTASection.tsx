import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight, Camera, BookOpen, Heart } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-20 lg:py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-10 left-10 text-primary/20 animate-float">
        <BookOpen className="h-16 w-16" />
      </div>
      <div className="absolute bottom-10 right-10 text-secondary/20 animate-float" style={{ animationDelay: '2s' }}>
        <Heart className="h-12 w-12" />
      </div>
      <div className="absolute top-32 right-20 text-accent/20 animate-sparkle">
        <Sparkles className="h-10 w-10" />
      </div>

      <div className="container relative">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <Badge className="bg-gradient-adventure text-white border-0 font-fredoka text-sm px-4 py-2">
            <Sparkles className="h-4 w-4 mr-2" />
            Start Your Family's Learning Adventure
          </Badge>

          <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-fredoka font-bold leading-tight">
              Ready to Make Your Child the 
              <span className="bg-gradient-cosmic bg-clip-text text-transparent"> Hero</span>?
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Join thousands of families who are transforming screen time into meaningful learning adventures. Create your first personalized story today!
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="grid md:grid-cols-3 gap-6 my-12">
            <div className="bg-gradient-card p-6 rounded-2xl shadow-soft border border-primary/10">
              <div className="p-3 bg-primary/10 rounded-xl w-fit mx-auto mb-4">
                <Camera className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-fredoka font-semibold text-lg mb-2">Upload Photo</h3>
              <p className="text-muted-foreground text-sm">Transform your child into a cartoon character in seconds</p>
            </div>
            
            <div className="bg-gradient-card p-6 rounded-2xl shadow-soft border border-secondary/10">
              <div className="p-3 bg-secondary/10 rounded-xl w-fit mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="font-fredoka font-semibold text-lg mb-2">Choose Adventure</h3>
              <p className="text-muted-foreground text-sm">Pick from 50+ educational stories across all subjects</p>
            </div>
            
            <div className="bg-gradient-card p-6 rounded-2xl shadow-soft border border-success/10">
              <div className="p-3 bg-success/10 rounded-xl w-fit mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-success" />
              </div>
              <h3 className="font-fredoka font-semibold text-lg mb-2">Learn Together</h3>
              <p className="text-muted-foreground text-sm">Watch your child's love for learning grow with each story</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" className="text-lg px-8 py-4">
              <Camera className="h-5 w-5" />
              Create Your Child's Avatar
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4">
              <BookOpen className="h-5 w-5" />
              Browse Story Library
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="pt-8 border-t border-border/50">
            <div className="grid md:grid-cols-3 gap-6 text-sm text-muted-foreground">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span>Free to start • No credit card required</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>COPPA compliant • Privacy protected</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                <span>Educational standards aligned</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;