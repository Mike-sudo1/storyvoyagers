import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Heart
} from "lucide-react";

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

          {/* Right Side - Sign In Form */}
          <div className="max-w-md mx-auto w-full">
            <Card className="bg-gradient-card border-0 shadow-card">
              <CardHeader className="text-center pb-4">
                <CardTitle className="font-fredoka text-2xl">Sign In</CardTitle>
                <p className="text-muted-foreground">Access your family's learning dashboard</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs defaultValue="email" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="email" className="font-fredoka">Email</TabsTrigger>
                    <TabsTrigger value="social" className="font-fredoka">Social Login</TabsTrigger>
                  </TabsList>

                  <TabsContent value="email" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="your.email@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10"
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

                    <Button variant="hero" size="lg" className="w-full">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Sign In to My Dashboard
                    </Button>
                  </TabsContent>

                  <TabsContent value="social" className="space-y-4">
                    <Button variant="outline" size="lg" className="w-full">
                      <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continue with Google
                    </Button>
                    
                    <Button variant="outline" size="lg" className="w-full">
                      <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      Continue with Facebook
                    </Button>

                    <Button variant="outline" size="lg" className="w-full">
                      <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.719-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.745.099.12.112.225.085.347l-.402 1.394c-.051.215-.174.259-.402.155C2.414 17.393 1.299 14.18 1.299 11.952 0 5.708 4.321.295 12.395.295c5.244 0 9.317 3.736 9.317 8.732 0 5.209-3.287 9.403-7.863 9.403-1.535 0-2.983-.8-3.477-1.748l-.946 3.614c-.34 1.297-1.257 2.923-1.878 3.914C9.108 23.596 10.548 24 12.017 24c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001.017 0z"/>
                      </svg>
                      Continue with Apple
                    </Button>
                  </TabsContent>
                </Tabs>

                <div className="text-center text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link to="/signup" className="text-primary hover:underline font-medium">
                    Create a free account
                  </Link>
                </div>
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