import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { 
  Sparkles, 
  Menu, 
  X, 
  User, 
  Search, 
  Home, 
  Library, 
  LogOut,
  Plus,
  BookOpen,
  Compass
} from "lucide-react";
import { useState } from "react";

const Header = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  const authenticatedNavigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Explore", href: "/explore", icon: Compass },
    { name: "Search", href: "/search", icon: Search },
    { name: "Library", href: "/library", icon: Library },
    { name: "Create", href: "/create-story", icon: Plus },
  ];

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      toast.success("Signed out successfully");
    }
  };

  return (
    <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to={user ? "/" : "/about"} className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/3bf06096-e00d-42ad-b576-8d028ecb75d9.png" 
              alt="StoryVoyagers Logo" 
              className="h-10 w-10 rounded-xl"
            />
            <div>
              <h1 className="font-fredoka font-bold text-xl">StoryVoyagers</h1>
              <p className="text-xs text-muted-foreground">Educational Adventures</p>
            </div>
          </Link>

          {/* Desktop Navigation - Only show if authenticated */}
          {user && (
            <nav className="hidden md:flex items-center space-x-1">
              {authenticatedNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-fredoka font-medium transition-colors hover:bg-primary/10",
                      location.pathname === item.href
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                <Badge variant="outline" className="border-accent/20 text-accent font-fredoka">
                  Premium Family
                </Badge>
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/profile">
                    <User className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/about">
                  <Button variant="outline" size="sm" className="font-fredoka">
                    About
                  </Button>
                </Link>
                <Link to="/signin">
                  <Button size="sm" className="font-fredoka">
                    <User className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t py-4">
            <nav className="flex flex-col space-y-2">
              {user ? (
                <>
                  {authenticatedNavigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={cn(
                          "flex items-center space-x-3 px-4 py-2 rounded-lg text-sm font-fredoka font-medium transition-colors",
                          location.pathname === item.href
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
                        )}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                  <Link
                    to="/profile"
                    className="flex items-center space-x-3 px-4 py-2 rounded-lg text-sm font-fredoka font-medium text-muted-foreground hover:text-foreground hover:bg-primary/5"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-3 px-4 py-2 rounded-lg text-sm font-fredoka font-medium text-muted-foreground hover:text-foreground hover:bg-primary/5 justify-start"
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </Button>
                </>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link to="/about" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full font-fredoka">
                      About
                    </Button>
                  </Link>
                  <Link to="/signin" onClick={() => setIsMenuOpen(false)}>
                    <Button size="sm" className="w-full font-fredoka">
                      <User className="h-4 w-4 mr-2" />
                      Sign In
                    </Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;