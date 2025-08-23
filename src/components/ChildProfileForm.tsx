import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useCreateChild, useUpdateChild } from "@/hooks/useChildren";
import { X } from "lucide-react";

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

  const [newInterest, setNewInterest] = useState("");
  const createChildMutation = useCreateChild();
  const updateChildMutation = useUpdateChild();

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
    if (createChildMutation.isSuccess || updateChildMutation.isSuccess) {
      handleSuccess();
    }
  }, [createChildMutation.isSuccess, updateChildMutation.isSuccess]);


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
            {isEditing ? "Edit Child Profile" : "Add New Child"}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? "Update your child's information" : "Create a new child profile for personalized stories"}
          </DialogDescription>
        </DialogHeader>
        
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
      </DialogContent>
    </Dialog>
  );
};

export default ChildProfileForm;