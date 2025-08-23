import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Sparkles, 
  BookOpen, 
  Users, 
  Globe, 
  Heart, 
  Star,
  Check,
  Zap,
  Shield,
  Headphones
} from "lucide-react";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import StoriesShowcase from "@/components/StoriesShowcase";
import ChildProfilesSection from "@/components/ChildProfilesSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-cosmic rounded-xl flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="font-fredoka font-bold text-xl">StoryVoyagers</h1>
                <p className="text-xs text-muted-foreground">Educational Adventures</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main>
        <HeroSection />
        <FeaturesSection />
        <StoriesShowcase />
        <ChildProfilesSection />

        {/* Pricing Section */}
        <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container">
            <div className="text-center space-y-6 mb-12">
              <Badge variant="outline" className="border-secondary/20 text-secondary font-fredoka">
                <Star className="h-3 w-3 mr-1" />
                Premium Membership
              </Badge>
              <h2 className="text-4xl md:text-5xl font-fredoka font-bold">
                Unlock Unlimited
                <span className="bg-gradient-adventure bg-clip-text text-transparent"> Adventures</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Give your child access to our complete library of educational stories and premium features
              </p>
            </div>

            <div className="max-w-md mx-auto">
              <Card className="bg-gradient-card border-2 border-primary/20 shadow-glow">
                <CardContent className="p-8 text-center">
                  <div className="mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-cosmic rounded-2xl mb-4">
                      <Zap className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-fredoka font-bold text-2xl mb-2">Premium Access</h3>
                    <p className="text-muted-foreground">Everything your child needs to learn and grow</p>
                  </div>

                  <div className="mb-8">
                    <div className="flex items-baseline justify-center mb-2">
                      <span className="text-4xl font-fredoka font-bold">$35.99</span>
                      <span className="text-muted-foreground ml-2">/month</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Cancel anytime</p>
                  </div>

                  <div className="space-y-4 mb-8 text-left">
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-success rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-sm">Unlimited story access</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-success rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-sm">Cartoon avatar creation</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-success rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-sm">Offline reading</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-success rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-sm">Progress tracking</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-success rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-sm">Audio narration</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-success rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-sm">Bilingual support</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button size="lg" className="w-full font-fredoka text-lg">
                      Start Free Trial
                    </Button>
                    <Link to="/signin">
                      <Button variant="outline" size="lg" className="w-full font-fredoka">
                        Sign In
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
