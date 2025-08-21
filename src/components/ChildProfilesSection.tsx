import ChildProfileCard from "@/components/ChildProfileCard";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

const sampleProfiles = [
  {
    name: "Emma",
    age: 7,
    avatarUrl: undefined, // Will show placeholder
    storiesCompleted: 12,
    badges: 8
  },
  {
    name: "Alex",
    age: 5,
    avatarUrl: undefined, // Will show placeholder
    storiesCompleted: 6,
    badges: 4
  }
];

const ChildProfilesSection = () => {
  return (
    <section className="py-20 lg:py-28">
      <div className="container">
        <div className="text-center space-y-4 mb-16">
          <Badge variant="outline" className="border-accent/20 text-accent font-fredoka">
            <Sparkles className="h-3 w-3 mr-1" />
            Family Profiles
          </Badge>
          <h2 className="text-3xl md:text-5xl font-fredoka font-bold">
            Every Child Gets Their
            <span className="bg-gradient-cosmic bg-clip-text text-transparent"> Own Avatar</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Upload a photo and watch the magic happen! Our AI transforms your child's face into a friendly cartoon character that becomes the hero of every educational adventure.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {sampleProfiles.map((profile, index) => (
            <ChildProfileCard key={index} {...profile} />
          ))}
          <ChildProfileCard isNew={true} />
        </div>

        <div className="mt-12 text-center space-y-4">
          <div className="bg-gradient-card p-6 rounded-2xl shadow-card max-w-2xl mx-auto border border-primary/10">
            <h3 className="font-fredoka font-semibold text-lg mb-2">How Avatar Creation Works</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="space-y-2">
                <div className="w-8 h-8 bg-gradient-cosmic rounded-full flex items-center justify-center text-white font-bold mx-auto">1</div>
                <p className="font-medium">Upload Photo</p>
                <p className="text-muted-foreground text-xs">Take or upload a clear face photo</p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-gradient-adventure rounded-full flex items-center justify-center text-white font-bold mx-auto">2</div>
                <p className="font-medium">AI Transformation</p>
                <p className="text-muted-foreground text-xs">Our AI creates a cartoon version</p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-gradient-success rounded-full flex items-center justify-center text-white font-bold mx-auto">3</div>
                <p className="font-medium">Story Integration</p>
                <p className="text-muted-foreground text-xs">Avatar appears in all story illustrations</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            <strong>Privacy Protected:</strong> Original photos are never stored. Only the cartoon avatar is saved to your profile.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ChildProfilesSection;