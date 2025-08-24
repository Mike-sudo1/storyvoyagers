import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Mail, ArrowLeft, BookOpen, Sparkles } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        toast.error(error.message);
        return;
      }
      
      setEmailSent(true);
      toast.success("Password reset email sent! Check your inbox.");
    } catch (error) {
      toast.error("An error occurred while sending the reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
      {/* Header */}
      <div className="container py-6">
        <Link to="/signin" className="inline-flex items-center space-x-2 text-foreground hover:text-primary transition-smooth">
          <ArrowLeft className="h-4 w-4" />
          <span className="font-medium">Back to Sign In</span>
        </Link>
      </div>

      <div className="container py-12">
        <div className="max-w-md mx-auto">
          {/* Branding */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="relative">
                <BookOpen className="h-12 w-12 text-primary animate-float" />
                <Sparkles className="h-6 w-6 text-accent absolute -top-1 -right-1 animate-sparkle" />
              </div>
              <div className="flex flex-col">
                <h1 className="font-fredoka font-bold text-2xl text-primary">Kid Inside</h1>
                <p className="text-sm text-muted-foreground font-medium -mt-1">The Story</p>
              </div>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-fredoka font-bold mb-2">
              {emailSent ? "Check Your Email" : "Reset Your Password"}
            </h2>
            <p className="text-muted-foreground">
              {emailSent 
                ? "We've sent you a password reset link. Check your email and follow the instructions to reset your password."
                : "Enter your email address and we'll send you a link to reset your password."
              }
            </p>
          </div>

          {!emailSent ? (
            <Card className="bg-gradient-card border-0 shadow-card">
              <CardHeader className="text-center pb-4">
                <CardTitle className="font-fredoka text-xl">Reset Password</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
                    <Mail className="h-4 w-4 mr-2" />
                    {loading ? "Sending..." : "Send Reset Link"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gradient-card border-0 shadow-card">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-success" />
                </div>
                <h3 className="font-fredoka text-lg font-semibold mb-2">Email Sent!</h3>
                <p className="text-muted-foreground mb-6">
                  We've sent a password reset link to <strong>{email}</strong>. 
                  Click the link in the email to reset your password.
                </p>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEmailSent(false);
                      setEmail("");
                    }}
                    className="w-full"
                  >
                    Send to Different Email
                  </Button>
                  <Link to="/signin">
                    <Button variant="hero" className="w-full">
                      Back to Sign In
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Remember your password?{" "}
              <Link to="/signin" className="text-primary hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;