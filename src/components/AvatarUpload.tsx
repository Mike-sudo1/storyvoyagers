import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useCartoonifyAvatar } from "@/hooks/useChildren";
import { Camera, Upload, Sparkles, Loader2 } from "lucide-react";

interface AvatarUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  childId: string;
  childName: string;
}

const AvatarUpload = ({ open, onOpenChange, childId, childName }: AvatarUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const cartoonifyMutation = useCartoonifyAvatar();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleCartoonify = () => {
    if (selectedFile && childId) {
      cartoonifyMutation.mutate({ childId, imageFile: selectedFile });
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    onOpenChange(false);
  };

  React.useEffect(() => {
    if (cartoonifyMutation.isSuccess) {
      handleClose();
    }
  }, [cartoonifyMutation.isSuccess]);

  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-fredoka flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Create Avatar for {childName}
          </DialogTitle>
          <DialogDescription>
            Upload a photo of your child and we'll transform it into a cartoon avatar for their stories!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Avatar Guidelines */}
          <Card className="bg-gradient-card border-0 shadow-soft">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-medium text-success">✅ Good Photo Tips:</h4>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Clear, well-lit face photo</li>
                    <li>• Child looking at camera</li>
                    <li>• Close-up of face and shoulders</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-destructive">❌ Avoid These:</h4>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Blurry or dark images</li>
                    <li>• Side profile or looking away</li>
                    <li>• Sunglasses or face coverings</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-primary/5 p-3 rounded-lg mt-4">
                <p className="text-xs font-medium text-primary">
                  🔒 Privacy Note: Original photos are processed and never stored. Only the cartoon avatar is saved.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* File Upload Area */}
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {!previewUrl ? (
              <Card 
                className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <CardContent className="p-8 text-center">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-fredoka font-semibold mb-2">Upload Photo</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Click to select a photo of {childName}
                  </p>
                  <Button variant="outline">
                    <Camera className="h-4 w-4 mr-2" />
                    Choose Photo
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1"
                  >
                    Choose Different Photo
                  </Button>
                  <Button 
                    onClick={handleCartoonify}
                    disabled={cartoonifyMutation.isPending}
                    className="flex-1 bg-gradient-cosmic hover:opacity-90"
                  >
                    {cartoonifyMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating Avatar...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Ready to Cartoonify!
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AvatarUpload;