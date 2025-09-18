import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCreateChild, useUpdateChild, useCartoonifyAvatar, useChildren } from "@/hooks/useChildren";
import { toast } from "sonner";
import { Upload, Loader2, X } from "lucide-react";

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
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  
  const { data: children = [] } = useChildren();
  const createChild = useCreateChild();
  const updateChild = useUpdateChild();
  const cartoonifyAvatar = useCartoonifyAvatar();

  // Determine if this is dialog mode or inline mode
  const isDialogMode = open !== undefined;
  const actualExistingCount = existingChildrenCount ?? children.length;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    setImagePreview("");
  };

  useEffect(() => {
    if (child && isEditing) {
      setName(child.name || "");
      setAge(child.age || 6);
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
        if (!profileImage) {
          toast.error("Please upload a profile photo");
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
          // Then cartoonify the avatar
          await cartoonifyAvatar.mutateAsync({
            childId: childData.child.id,
            imageFile: profileImage
          });

          toast.success("Child profile created and avatar generated!");
          handleClose();
        }
      }
    } catch (error) {
      console.error("Error with child profile:", error);
      toast.error(isEditing ? "Failed to update child profile" : "Failed to create child profile");
    }
  };

  const isLoading = createChild.isPending || updateChild.isPending || cartoonifyAvatar.isPending;

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
                <Label>Profile Photo</Label>
                <div className="mt-2">
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Profile preview"
                        className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        disabled={isLoading}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-full cursor-pointer hover:border-gray-400">
                      <Upload className="w-6 h-6 text-gray-400" />
                      <span className="text-xs text-gray-500 mt-1">Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        disabled={isLoading}
                      />
                    </label>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  This photo will be converted into a cartoon avatar for stories
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
                disabled={isLoading || (!isEditing && !profileImage)}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {cartoonifyAvatar.isPending ? "Creating Avatar..." : isEditing ? "Updating..." : "Creating..."}
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
    );
  }

  return renderForm();
};

export default ChildProfileForm;