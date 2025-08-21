import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChildProfileCard from "@/components/ChildProfileCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Settings, 
  Users, 
  Crown, 
  Shield, 
  Globe, 
  Volume2,
  Eye,
  CreditCard,
  Camera,
  Plus,
  Edit,
  Trash2
} from "lucide-react";

const sampleChildren = [
  { name: "Emma", age: 7, avatarUrl: undefined, storiesCompleted: 12, badges: 8 },
  { name: "Alex", age: 5, avatarUrl: undefined, storiesCompleted: 6, badges: 4 }
];

const Profile = () => {
  const [activeTab, setActiveTab] = useState("children");

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-accent/5 to-secondary/5">
        <div className="container">
          <div className="text-center space-y-6 mb-12">
            <Badge variant="outline" className="border-accent/20 text-accent font-fredoka">
              <User className="h-3 w-3 mr-1" />
              Family Profile
            </Badge>
            <h1 className="text-4xl md:text-6xl font-fredoka font-bold">
              Manage Your
              <span className="bg-gradient-cosmic bg-clip-text text-transparent"> Family</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Set up child profiles, customize learning preferences, and manage your subscription. Everything you need for the perfect learning experience.
            </p>
          </div>

          {/* Account Overview */}
          <Card className="max-w-4xl mx-auto bg-gradient-card border-0 shadow-card">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center space-y-2">
                  <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-fredoka font-semibold text-lg">Sarah Johnson</h3>
                  <p className="text-sm text-muted-foreground">sarah.johnson@email.com</p>
                  <Badge className="bg-gradient-adventure text-white border-0 font-fredoka">
                    <Crown className="h-3 w-3 mr-1" />
                    Premium Family
                  </Badge>
                </div>

                <div className="text-center space-y-4">
                  <h4 className="font-fredoka font-semibold text-lg">Family Stats</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="font-fredoka font-bold text-2xl text-primary">2</div>
                      <div className="text-xs text-muted-foreground">Children</div>
                    </div>
                    <div>
                      <div className="font-fredoka font-bold text-2xl text-secondary">18</div>
                      <div className="text-xs text-muted-foreground">Stories Read</div>
                    </div>
                  </div>
                </div>

                <div className="text-center space-y-4">
                  <h4 className="font-fredoka font-semibold text-lg">Subscription</h4>
                  <div className="space-y-2">
                    <p className="font-medium">Premium Family Plan</p>
                    <p className="text-sm text-muted-foreground">Renews Dec 15, 2024</p>
                    <Button variant="outline" size="sm">
                      <CreditCard className="h-3 w-3 mr-1" />
                      Manage Billing
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container max-w-6xl">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="children" className="font-fredoka">
                <Users className="h-4 w-4 mr-2" />
                Children
              </TabsTrigger>
              <TabsTrigger value="settings" className="font-fredoka">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="privacy" className="font-fredoka">
                <Shield className="h-4 w-4 mr-2" />
                Privacy
              </TabsTrigger>
              <TabsTrigger value="billing" className="font-fredoka">
                <CreditCard className="h-4 w-4 mr-2" />
                Billing
              </TabsTrigger>
            </TabsList>

            <TabsContent value="children" className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-fredoka font-bold">Child Profiles</h2>
                <Button variant="hero">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Child Profile
                </Button>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {sampleChildren.map((child, index) => (
                  <div key={index} className="relative group">
                    <ChildProfileCard {...child} />
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-smooth">
                      <div className="flex space-x-2">
                        <Button size="icon" variant="secondary" className="h-8 w-8">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="icon" variant="destructive" className="h-8 w-8">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                <ChildProfileCard isNew={true} />
              </div>

              <Card className="bg-gradient-card border-0 shadow-soft">
                <CardHeader>
                  <CardTitle className="font-fredoka flex items-center">
                    <Camera className="h-5 w-5 mr-2" />
                    Avatar Creation Guidelines
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-medium text-success">✅ Good Photo Tips:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Clear, well-lit face photo</li>
                        <li>• Child looking at camera</li>
                        <li>• Minimal background distractions</li>
                        <li>• Close-up of face and shoulders</li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-medium text-destructive">❌ Avoid These:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Blurry or dark images</li>
                        <li>• Side profile or looking away</li>
                        <li>• Sunglasses or face coverings</li>
                        <li>• Multiple people in photo</li>
                      </ul>
                    </div>
                  </div>
                  <div className="bg-primary/5 p-4 rounded-lg">
                    <p className="text-sm font-medium text-primary">
                      🔒 Privacy Note: Original photos are processed locally and never stored. Only the cartoon avatar is saved to your child's profile.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-8">
              <h2 className="text-2xl font-fredoka font-bold">App Settings</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="bg-gradient-card border-0 shadow-soft">
                  <CardHeader>
                    <CardTitle className="font-fredoka flex items-center">
                      <Globe className="h-5 w-5 mr-2" />
                      Language & Accessibility
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Default Language</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Button variant="hero" size="sm">English</Button>
                        <Button variant="outline" size="sm">Spanish</Button>
                        <Button variant="outline" size="sm">Bilingual</Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Font Preference</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="hero" size="sm">Regular Font</Button>
                        <Button variant="outline" size="sm">Dyslexia-Friendly</Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>High Contrast Mode</Label>
                      <Button variant="outline" size="sm" className="w-full justify-between">
                        <span>Off</span>
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-card border-0 shadow-soft">
                  <CardHeader>
                    <CardTitle className="font-fredoka flex items-center">
                      <Volume2 className="h-5 w-5 mr-2" />
                      Audio & Reading
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Default Narration Speed</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Button variant="outline" size="sm">Slow</Button>
                        <Button variant="hero" size="sm">Normal</Button>
                        <Button variant="outline" size="sm">Fast</Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Auto-play Stories</Label>
                      <Button variant="hero" size="sm" className="w-full justify-between">
                        <span>Enabled</span>
                        <Volume2 className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label>Reading Reminders</Label>
                      <Button variant="outline" size="sm" className="w-full justify-between">
                        <span>Daily at 7:00 PM</span>
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-card border-0 shadow-soft">
                  <CardHeader>
                    <CardTitle className="font-fredoka">Account Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <Input value="sarah.johnson@email.com" />
                    </div>
                    <div className="space-y-2">
                      <Label>Display Name</Label>
                      <Input value="Sarah Johnson" />
                    </div>
                    <Button variant="adventure" size="sm">
                      Update Profile
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-card border-0 shadow-soft">
                  <CardHeader>
                    <CardTitle className="font-fredoka">Download Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Auto-download Stories</Label>
                      <Button variant="hero" size="sm" className="w-full justify-between">
                        <span>WiFi Only</span>
                        <Settings className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Storage Used</Label>
                      <div className="text-sm text-muted-foreground">
                        <p>245 MB of 1 GB available</p>
                        <div className="w-full bg-muted rounded-full h-2 mt-2">
                          <div className="bg-gradient-cosmic h-2 rounded-full" style={{ width: '25%' }}></div>
                        </div>
                      </div>
                    </div>

                    <Button variant="outline" size="sm">
                      Manage Downloads
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-8">
              <h2 className="text-2xl font-fredoka font-bold">Privacy & Safety</h2>
              
              <Card className="bg-gradient-card border-0 shadow-soft">
                <CardHeader>
                  <CardTitle className="font-fredoka flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Data Protection
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">What We Collect:</h4>
                      <ul className="text-sm text-muted-foreground space-y-2">
                        <li>• Child's name and age (for personalization)</li>
                        <li>• Cartoon avatar images (photos are not stored)</li>
                        <li>• Reading progress and quiz scores</li>
                        <li>• Learning preferences and settings</li>
                      </ul>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-medium">What We Don't Share:</h4>
                      <ul className="text-sm text-muted-foreground space-y-2">
                        <li>• Personal information with third parties</li>
                        <li>• Original photos (only cartoon avatars)</li>
                        <li>• Location or device information</li>
                        <li>• Any data for advertising purposes</li>
                      </ul>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-4">
                    <h4 className="font-medium">Your Rights:</h4>
                    <div className="flex flex-wrap gap-3">
                      <Button variant="outline" size="sm">
                        Download My Data
                      </Button>
                      <Button variant="outline" size="sm">
                        Delete Account
                      </Button>
                      <Button variant="outline" size="sm">
                        Privacy Policy
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-primary/5 border border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Shield className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-fredoka font-semibold text-primary mb-2">COPPA Compliance</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        We are fully compliant with the Children's Online Privacy Protection Act (COPPA). We do not collect personal information from children under 13 without verifiable parental consent. All data is encrypted and stored securely.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing" className="space-y-8">
              <h2 className="text-2xl font-fredoka font-bold">Subscription & Billing</h2>
              
              <Card className="bg-gradient-adventure border-0 shadow-card">
                <CardContent className="p-8 text-white">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <Crown className="h-8 w-8" />
                      <div>
                        <h3 className="font-fredoka font-bold text-2xl">Premium Family Plan</h3>
                        <p className="opacity-90">Unlimited stories for up to 5 children</p>
                      </div>
                    </div>
                    <Badge className="bg-white/20 text-white border-0 font-fredoka">
                      Active
                    </Badge>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="font-fredoka font-bold text-3xl">$9.99</div>
                      <div className="opacity-90 text-sm">per month</div>
                    </div>
                    <div className="text-center">
                      <div className="font-fredoka font-bold text-lg">Dec 15, 2024</div>
                      <div className="opacity-90 text-sm">Next billing date</div>
                    </div>
                    <div className="text-center">
                      <div className="font-fredoka font-bold text-lg">2 of 5</div>
                      <div className="opacity-90 text-sm">Children added</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-gradient-card border-0 shadow-soft">
                  <CardHeader>
                    <CardTitle className="font-fredoka">Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CreditCard className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">•••• •••• •••• 4242</p>
                          <p className="text-sm text-muted-foreground">Expires 12/26</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Update
                      </Button>
                    </div>
                    
                    <Button variant="outline" className="w-full">
                      Add Payment Method
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-card border-0 shadow-soft">
                  <CardHeader>
                    <CardTitle className="font-fredoka">Billing History</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { date: "Nov 15, 2024", amount: "$9.99", status: "Paid" },
                      { date: "Oct 15, 2024", amount: "$9.99", status: "Paid" },
                      { date: "Sep 15, 2024", amount: "$9.99", status: "Paid" }
                    ].map((payment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{payment.amount}</p>
                          <p className="text-sm text-muted-foreground">{payment.date}</p>
                        </div>
                        <Badge variant="outline" className="text-success border-success/20">
                          {payment.status}
                        </Badge>
                      </div>
                    ))}
                    
                    <Button variant="outline" size="sm" className="w-full">
                      View All Invoices
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-muted/50 border-0">
                <CardContent className="p-6">
                  <h4 className="font-fredoka font-semibold mb-4">Subscription Actions</h4>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline">
                      Pause Subscription
                    </Button>
                    <Button variant="outline">
                      Change Plan
                    </Button>
                    <Button variant="destructive">
                      Cancel Subscription
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Profile;