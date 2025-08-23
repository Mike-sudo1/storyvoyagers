import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useCreateChild, useUpdateChild } from "@/hooks/useChildren";
import { X, Plus } from "lucide-react";

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
    pronouns: child?.pronouns || "they",
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
      pronouns: "they",
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
        pronouns: child.pronouns || "they",
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

  const addInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest("");
    }
  };

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

          <div className="grid grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <Label>Pronouns</Label>
              <Select value={formData.pronouns} onValueChange={(value) => setFormData(prev => ({ ...prev, pronouns: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="he">He/Him</SelectItem>
                  <SelectItem value="she">She/Her</SelectItem>
                  <SelectItem value="they">They/Them</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Grade</Label>
              <Input
                value={formData.grade}
                onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
                placeholder="1st Grade"
              />
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
            <div className="flex gap-2">
              <Input
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                placeholder="Add an interest (space, dinosaurs, etc.)"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
              />
              <Button type="button" onClick={addInterest} size="icon" variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
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