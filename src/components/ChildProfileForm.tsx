import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useCreateChild, useUpdateChild, useCartoonifyAvatar } from "@/hooks/useChildren";
import { X, Upload, Camera } from "lucide-react";

interface ChildProfileFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  child?: any;
  isEditing?: boolean;
}

const ChildProfileForm = ({ open, onOpenChange, child, isEditing = false }: ChildProfileFormProps) => {
  const [formData, setFormData] = useState({
    name: child?.name || "",
    age: child?.age || "",
    grade: child?.grade || "",
    reading_level: child?.reading_level || "",
    language_preference: child?.language_preference || "en",
    interests: child?.interests || []
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [step, setStep] = useState<'form' | 'photo'>('form');
  const [createdChildId, setCreatedChildId] = useState<string>("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createChildMutation = useCreateChild();
  const updateChildMutation = useUpdateChild();
  const cartoonifyMutation = useCartoonifyAvatar();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      age: parseInt(formData.age)
    };

    if (isEditing && child) {
      updateChildMutation.mutate({
        childId: child.id,
        ...submitData
      });
    } else {
      createChildMutation.mutate(submitData);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleCartoonify = () => {
    if (selectedImage && createdChildId) {
      cartoonifyMutation.mutate({
        childId: createdChildId,
        imageFile: selectedImage
      });
    }
  };

  const handleSkipPhoto = () => {
    handleSuccess();
  };

  const handleSuccess = () => {
    onOpenChange(false);
    setFormData({
      name: "",
      age: "",
      grade: "",
      reading_level: "",
      language_preference: "en",
      interests: []
    });
    setSelectedImage(null);
    setPreviewUrl("");
    setStep('form');
    setCreatedChildId("");
  };

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (open && child && isEditing) {
      setFormData({
        name: child.name || "",
        age: child.age?.toString() || "",
        grade: child.grade || "",
        reading_level: child.reading_level || "",
        language_preference: child.language_preference || "en",
        interests: child.interests || []
      });
    }
  }, [open, child, isEditing]);

  React.useEffect(() => {
    if (createChildMutation.isSuccess && !isEditing) {
      // Move to photo step after successful child creation
      const childData = createChildMutation.data?.child;
      if (childData?.id) {
        setCreatedChildId(childData.id);
        setStep('photo');
      }
    } else if (updateChildMutation.isSuccess || (createChildMutation.isSuccess && isEditing)) {
      handleSuccess();
    }
  }, [createChildMutation.isSuccess, updateChildMutation.isSuccess, isEditing]);

  React.useEffect(() => {
    if (cartoonifyMutation.isSuccess) {
      handleSuccess();
    }
  }, [cartoonifyMutation.isSuccess]);


  const removeInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-fredoka">
            {step === 'photo' ? "Add Profile Picture" : (isEditing ? "Edit Child Profile" : "Add New Child")}
          </DialogTitle>
          <DialogDescription>
            {step === 'photo' 
              ? "Upload a photo to create a cartoon avatar for your child"
              : (isEditing ? "Update your child's information" : "Create a new child profile for personalized stories")
            }
          </DialogDescription>
        </DialogHeader>
        
        {step === 'form' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Child's name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Age *</Label>
            <Input
              id="age"
              type="number"
              min="3"
              max="12"
              value={formData.age}
              onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
              placeholder="5"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Grade</Label>
              <Select value={formData.grade} onValueChange={(value) => setFormData(prev => ({ ...prev, grade: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pre-k">Pre-K</SelectItem>
                  <SelectItem value="kindergarten">Kindergarten</SelectItem>
                  <SelectItem value="1st">1st Grade</SelectItem>
                  <SelectItem value="2nd">2nd Grade</SelectItem>
                  <SelectItem value="3rd">3rd Grade</SelectItem>
                  <SelectItem value="4th">4th Grade</SelectItem>
                  <SelectItem value="5th">5th Grade</SelectItem>
                  <SelectItem value="6th">6th Grade</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Reading Level</Label>
              <Select value={formData.reading_level} onValueChange={(value) => setFormData(prev => ({ ...prev, reading_level: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A - Beginning</SelectItem>
                  <SelectItem value="B">B - Early</SelectItem>
                  <SelectItem value="C">C - Developing</SelectItem>
                  <SelectItem value="D">D - Fluent</SelectItem>
                  <SelectItem value="E">E - Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Language Preference</Label>
            <Select value={formData.language_preference} onValueChange={(value) => setFormData(prev => ({ ...prev, language_preference: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="bilingual">Bilingual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Interests</Label>
            <Select onValueChange={(value) => {
              if (!formData.interests.includes(value)) {
                setFormData(prev => ({
                  ...prev,
                  interests: [...prev.interests, value]
                }));
              }
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Add interests" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="space">Space & Astronomy</SelectItem>
                <SelectItem value="dinosaurs">Dinosaurs</SelectItem>
                <SelectItem value="animals">Animals</SelectItem>
                <SelectItem value="science">Science Experiments</SelectItem>
                <SelectItem value="history">History</SelectItem>
                <SelectItem value="math">Mathematics</SelectItem>
                <SelectItem value="art">Art & Creativity</SelectItem>
                <SelectItem value="sports">Sports</SelectItem>
                <SelectItem value="music">Music</SelectItem>
                <SelectItem value="cooking">Cooking</SelectItem>
                <SelectItem value="nature">Nature</SelectItem>
                <SelectItem value="adventure">Adventure Stories</SelectItem>
              </SelectContent>
            </Select>
            {formData.interests.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.interests.map((interest, index) => (
                  <Badge key={index} variant="outline" className="cursor-pointer" onClick={() => removeInterest(interest)}>
                    {interest}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
            )}
          </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={createChildMutation.isPending || updateChildMutation.isPending}
              >
                {createChildMutation.isPending || updateChildMutation.isPending ? 
                  "Saving..." : 
                  isEditing ? "Update Profile" : "Create Profile"
                }
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                {previewUrl ? (
                  <div className="space-y-4">
                    <img 
                      src={previewUrl} 
                      alt="Selected photo" 
                      className="mx-auto max-w-full max-h-48 rounded-lg object-cover"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Choose Different Photo
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                    <div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Upload Photo
                      </Button>
                      <p className="text-sm text-muted-foreground mt-2">
                        Choose a clear, well-lit photo for best results
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleSkipPhoto} 
                className="flex-1"
              >
                Skip Photo
              </Button>
              <Button 
                onClick={handleCartoonify}
                disabled={!selectedImage || cartoonifyMutation.isPending}
                className="flex-1"
              >
                {cartoonifyMutation.isPending ? "Creating Avatar..." : "Create Avatar"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ChildProfileForm;