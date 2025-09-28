import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCreateChild, useUpdateChild, useChildren } from "@/hooks/useChildren";
import { useAvatarGeneration } from "@/hooks/useAvatarGeneration";
import AvatarBuilder, { type AvatarConfig } from "@/components/AvatarBuilder";
import { toast } from "sonner";
import { Palette, Loader2 } from "lucide-react";

interface ChildProfileFormProps {
  // For dialog-based usage (Profile page)
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  child?: any;
  isEditing?: boolean;
  // For inline usage (CreateStory page)
  onClose?: () => void;
  existingChildrenCount?: number;
}

const ChildProfileForm = ({ 
  open, 
  onOpenChange, 
  child, 
  isEditing = false, 
  onClose, 
  existingChildrenCount 
}: ChildProfileFormProps) => {
  const [name, setName] = useState(child?.name || "");
  const [age, setAge] = useState<number>(child?.age || 6);
  const [showAvatarBuilder, setShowAvatarBuilder] = useState(false);
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig | null>(child?.avatar_json || null);
  const [avatarPreview, setAvatarPreview] = useState<string>(child?.avatar_url || "");
  
  const { data: children = [] } = useChildren();
  const createChild = useCreateChild();
  const updateChild = useUpdateChild();
  const { generateAvatarImage, isGenerating } = useAvatarGeneration();

  // Determine if this is dialog mode or inline mode
  const isDialogMode = open !== undefined;
  const actualExistingCount = existingChildrenCount ?? children.length;

  const handleAvatarSave = async (config: AvatarConfig, previewUrl: string) => {
    setAvatarConfig(config);
    setAvatarPreview(previewUrl);
    setShowAvatarBuilder(false);
    toast.success("Avatar configuration saved!");
  };

  const removeAvatar = () => {
    setAvatarConfig(null);
    setAvatarPreview("");
  };

  useEffect(() => {
    if (child && isEditing) {
      setName(child.name || "");
      setAge(child.age || 6);
      setAvatarConfig(child.avatar_json || null);
      setAvatarPreview(child.avatar_url || "");
    }
  }, [child, isEditing]);

  const handleClose = () => {
    if (onClose) onClose();
    if (onOpenChange) onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEditing && actualExistingCount >= 5) {
      toast.error("You can only create up to 5 child profiles");
      return;
    }

    if (!name.trim()) {
      toast.error("Please enter a name");
      return;
    }

    try {
      if (isEditing && child) {
        // Update existing child
        await updateChild.mutateAsync({
          childId: child.id,
          name: name.trim(),
          age,
        });
        toast.success("Child profile updated successfully!");
        handleClose();
      } else {
        // Create new child
        if (!avatarConfig) {
          toast.error("Please create an avatar");
          return;
        }

        const childData = await createChild.mutateAsync({
          name: name.trim(),
          age,
          pronouns: "they",
          grade: `grade-${Math.max(1, age - 4)}`,
          reading_level: "beginner",
          interests: [],
          language_preference: "en"
        });

        if (childData.success && childData.child) {
          // Generate avatar image using DALL-E
          const imageUrl = await generateAvatarImage(avatarConfig, childData.child.id, name.trim());
          
          if (imageUrl) {
            toast.success("Child profile created and avatar generated!");
            handleClose();
          } else {
            toast.error("Profile created but avatar generation failed");
            handleClose();
          }
        }
      }
    } catch (error) {
      console.error("Error with child profile:", error);
      toast.error(isEditing ? "Failed to update child profile" : "Failed to create child profile");
    }
  };

  const isLoading = createChild.isPending || updateChild.isPending || isGenerating;

  const renderForm = () => {
    if (!isEditing && actualExistingCount >= 5) {
      return (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Profile Limit Reached</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              You can only create up to 5 child profiles per account.
            </p>
            <Button onClick={handleClose} variant="outline">
              Close
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">
            {isEditing ? "Edit Child Profile" : "Create Child Profile"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter child's name"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                min="3"
                max="12"
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value) || 6)}
                disabled={isLoading}
              />
            </div>

            {!isEditing && (
              <div>
                <Label>Avatar</Label>
                <div className="mt-2 space-y-3">
                  {avatarPreview ? (
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={avatarPreview}
                          alt="Avatar preview"
                          className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={removeAvatar}
                          className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 text-xs"
                          disabled={isLoading}
                        >
                          ✕
                        </button>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Avatar created!</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAvatarBuilder(true)}
                          disabled={isLoading}
                          className="mt-1"
                        >
                          <Palette className="w-3 h-3 mr-1" />
                          Edit Avatar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAvatarBuilder(true)}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-2 h-16 border-2 border-dashed"
                    >
                      <Palette className="w-6 h-6 text-primary" />
                      <span>Create Avatar</span>
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Design a custom cartoon avatar that will appear in all stories
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || (!isEditing && !avatarConfig)}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isGenerating ? "Creating Avatar..." : isEditing ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  isEditing ? "Update Profile" : "Create Profile"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  };

  if (isDialogMode) {
    return (
      <>
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Edit Child Profile" : "Create Child Profile"}
              </DialogTitle>
            </DialogHeader>
            {renderForm()}
          </DialogContent>
        </Dialog>
        
        <AvatarBuilder
          open={showAvatarBuilder}
          onOpenChange={setShowAvatarBuilder}
          childName={name || "Child"}
          onSave={handleAvatarSave}
          initialConfig={avatarConfig || undefined}
        />
      </>
    );
  }

  return (
    <>
      {renderForm()}
      <AvatarBuilder
        open={showAvatarBuilder}
        onOpenChange={setShowAvatarBuilder}
        childName={name || "Child"}
        onSave={handleAvatarSave}
        initialConfig={avatarConfig || undefined}
      />
    </>
  );
};

export default ChildProfileForm;