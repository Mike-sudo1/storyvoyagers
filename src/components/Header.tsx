import { Button } from "@/components/ui/button";
import { BookOpen, User, Search, Home, Compass, Library, Sparkles } from "lucide-react";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <BookOpen className="h-8 w-8 text-primary animate-float" />
            <Sparkles className="h-4 w-4 text-accent absolute -top-1 -right-1 animate-sparkle" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-fredoka font-bold text-lg text-primary">Kid Inside</h1>
            <p className="text-xs text-muted-foreground font-medium -mt-1">The Story</p>
          </div>
        </div>

        {/* Navigation - Hidden on mobile */}
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#" className="flex items-center space-x-2 text-foreground hover:text-primary transition-smooth">
            <Home className="h-4 w-4" />
            <span className="font-medium">Home</span>
          </a>
          <a href="#" className="flex items-center space-x-2 text-foreground hover:text-primary transition-smooth">
            <Compass className="h-4 w-4" />
            <span className="font-medium">Explore</span>
          </a>
          <a href="#" className="flex items-center space-x-2 text-foreground hover:text-primary transition-smooth">
            <Library className="h-4 w-4" />
            <span className="font-medium">My Library</span>
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="outline">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Sign In</span>
          </Button>
          <Button variant="hero">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Get Started</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;