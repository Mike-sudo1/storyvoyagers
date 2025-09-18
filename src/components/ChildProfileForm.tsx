import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateChild, useCartoonifyAvatar } from "@/hooks/useChildren";
import { toast } from "sonner";
import { Upload, Loader2, X } from "lucide-react";

interface ChildProfileFormProps {
  onClose: () => void;
  existingChildrenCount: number;
}

const ChildProfileForm = ({ onClose, existingChildrenCount }: ChildProfileFormProps) => {
  const [name, setName] = useState("");
  const [age, setAge] = useState<number>(6);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  
  const createChild = useCreateChild();
  const cartoonifyAvatar = useCartoonifyAvatar();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (existingChildrenCount >= 5) {
      toast.error("You can only create up to 5 child profiles");
      return;
    }

    if (!name.trim()) {
      toast.error("Please enter a name");
      return;
    }

    if (!profileImage) {
      toast.error("Please upload a profile photo");
      return;
    }

    try {
      // First create the child profile
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
        onClose();
      }
    } catch (error) {
      console.error("Error creating child profile:", error);
      toast.error("Failed to create child profile");
    }
  };

  const isLoading = createChild.isPending || cartoonifyAvatar.isPending;

  if (existingChildrenCount >= 5) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Profile Limit Reached</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            You can only create up to 5 child profiles per account.
          </p>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Create Child Profile</CardTitle>
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

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {cartoonifyAvatar.isPending ? "Creating Avatar..." : "Creating..."}
                </>
              ) : (
                "Create Profile"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChildProfileForm;