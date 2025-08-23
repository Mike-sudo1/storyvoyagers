import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { 
  BookOpen, 
  Sparkles, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  ArrowLeft,
  Users,
  Shield,
  Heart,
  User
} from "lucide-react";

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await signIn(email, password);
      
      if (error) {
        toast.error(error.message);
        return;
      }
      
      if (data?.user) {
        toast.success("Welcome back!");
        navigate("/");
      }
    } catch (error) {
      toast.error("An error occurred during sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await signUp(email, password, fullName);
      
      if (error) {
        toast.error(error.message);
        return;
      }
      
      if (data?.user) {
        toast.success("Account created successfully! Please check your email to verify your account.");
      }
    } catch (error) {
      toast.error("An error occurred during sign up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
      {/* Header */}
      <div className="container py-6">
        <Link to="/" className="inline-flex items-center space-x-2 text-foreground hover:text-primary transition-smooth">
          <ArrowLeft className="h-4 w-4" />
          <span className="font-medium">Back to Home</span>
        </Link>
      </div>

      <div className="container py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Left Side - Branding */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start space-x-3 mb-6">
                <div className="relative">
                  <BookOpen className="h-12 w-12 text-primary animate-float" />
                  <Sparkles className="h-6 w-6 text-accent absolute -top-1 -right-1 animate-sparkle" />
                </div>
                <div className="flex flex-col">
                  <h1 className="font-fredoka font-bold text-2xl text-primary">Kid Inside</h1>
                  <p className="text-sm text-muted-foreground font-medium -mt-1">The Story</p>
                </div>
              </div>
              
              <h2 className="text-3xl md:text-5xl font-fredoka font-bold mb-4">
                Welcome Back to Your
                <span className="bg-gradient-cosmic bg-clip-text text-transparent"> Learning Adventure</span>
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Sign in to continue creating magical educational stories with your children's personalized cartoon avatars.
              </p>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center space-y-3">
                <div className="p-3 bg-primary/10 rounded-xl w-fit mx-auto">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-fredoka font-semibold">Multiple Children</h3>
                  <p className="text-sm text-muted-foreground">Create profiles for all your kids</p>
                </div>
              </div>
              
              <div className="text-center space-y-3">
                <div className="p-3 bg-secondary/10 rounded-xl w-fit mx-auto">
                  <BookOpen className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-fredoka font-semibold">Progress Tracking</h3>
                  <p className="text-sm text-muted-foreground">Monitor learning achievements</p>
                </div>
              </div>
              
              <div className="text-center space-y-3">
                <div className="p-3 bg-success/10 rounded-xl w-fit mx-auto">
                  <Shield className="h-6 w-6 text-success" />
                </div>
                <div>
                  <h3 className="font-fredoka font-semibold">Safe & Secure</h3>
                  <p className="text-sm text-muted-foreground">COPPA compliant privacy</p>
                </div>
              </div>
            </div>

            {/* Testimonial */}
            <Card className="bg-gradient-card border-0 shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-cosmic rounded-full flex items-center justify-center">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">
                      "My kids absolutely love seeing themselves in the stories! Emma asks to read every night now."
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Sarah J. - Mother of 2
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Authentication Forms */}
          <div className="max-w-md mx-auto w-full">
            <Card className="bg-gradient-card border-0 shadow-card">
              <CardHeader className="text-center pb-4">
                <CardTitle className="font-fredoka text-2xl">Welcome</CardTitle>
                <p className="text-muted-foreground">Sign in or create your account</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs defaultValue="signin" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="signin" className="font-fredoka">Sign In</TabsTrigger>
                    <TabsTrigger value="signup" className="font-fredoka">Sign Up</TabsTrigger>
                  </TabsList>

                  <TabsContent value="signin" className="space-y-4">
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signin-email">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signin-email"
                            type="email"
                            placeholder="your.email@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signin-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signin-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 pr-10"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input type="checkbox" className="rounded border-border" />
                          <span className="text-muted-foreground">Remember me</span>
                        </label>
                        <Link to="/forgot-password" className="text-primary hover:underline">
                          Forgot password?
                        </Link>
                      </div>

                      <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
                        <Sparkles className="h-4 w-4 mr-2" />
                        {loading ? "Signing In..." : "Sign In to My Dashboard"}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="signup" className="space-y-4">
                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-name">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-name"
                            type="text"
                            placeholder="Enter your full name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="your.email@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a password (min. 6 characters)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 pr-10"
                            required
                            minLength={6}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        <label className="flex items-start space-x-2 cursor-pointer">
                          <input type="checkbox" className="rounded border-border mt-0.5" required />
                          <span>
                            I agree to the{" "}
                            <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
                            {" "}and{" "}
                            <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                          </span>
                        </label>
                      </div>

                      <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
                        <Sparkles className="h-4 w-4 mr-2" />
                        {loading ? "Creating Account..." : "Create My Account"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Trust Badges */}
            <div className="mt-6 text-center space-y-2">
              <p className="text-xs text-muted-foreground">Trusted by over 10,000 families</p>
              <div className="flex justify-center space-x-4 text-xs text-muted-foreground">
                <span className="flex items-center space-x-1">
                  <Shield className="h-3 w-3" />
                  <span>COPPA Compliant</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Lock className="h-3 w-3" />
                  <span>SSL Encrypted</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;