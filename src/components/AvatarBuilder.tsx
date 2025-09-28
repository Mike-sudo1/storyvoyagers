import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Shuffle, Download, Save, Palette } from "lucide-react";

export interface AvatarConfig {
  faceShape: 'round' | 'oval' | 'square' | 'heart';
  skinTone: 'light' | 'medium' | 'tan' | 'dark' | 'olive';
  eyeStyle: 'big' | 'small' | 'sleepy' | 'bright' | 'squinty';
  eyeColor: 'brown' | 'blue' | 'green' | 'hazel' | 'gray' | 'amber';
  hairStyle: 'short' | 'medium' | 'long' | 'curly' | 'braids' | 'ponytail' | 'bald';
  hairColor: 'black' | 'brown' | 'blonde' | 'red' | 'gray' | 'blue' | 'pink' | 'green';
  outfit: 'casual' | 'formal' | 'sporty' | 'pajamas' | 'superhero' | 'princess';
  accessories: string[]; // 'glasses', 'hat', 'bow', 'earrings', 'necklace'
}

interface AvatarBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  childName: string;
  onSave: (config: AvatarConfig, previewUrl: string) => Promise<void>;
  initialConfig?: AvatarConfig;
}

const defaultConfig: AvatarConfig = {
  faceShape: 'round',
  skinTone: 'light',
  eyeStyle: 'big',
  eyeColor: 'brown',
  hairStyle: 'medium',
  hairColor: 'brown',
  outfit: 'casual',
  accessories: []
};

const faceShapes = [
  { key: 'round' as const, label: '●', desc: 'Round' },
  { key: 'oval' as const, label: '◯', desc: 'Oval' },
  { key: 'square' as const, label: '◼', desc: 'Square' },
  { key: 'heart' as const, label: '♡', desc: 'Heart' }
];

const skinTones = [
  { key: 'light' as const, color: '#fdbcb4', label: 'Light' },
  { key: 'medium' as const, color: '#e1906f', label: 'Medium' },
  { key: 'tan' as const, color: '#c68642', label: 'Tan' },
  { key: 'dark' as const, color: '#8d5524', label: 'Dark' },
  { key: 'olive' as const, color: '#c9956a', label: 'Olive' }
];

const eyeStyles = [
  { key: 'big' as const, label: '●●', desc: 'Big' },
  { key: 'small' as const, label: '••', desc: 'Small' },
  { key: 'sleepy' as const, label: '~~', desc: 'Sleepy' },
  { key: 'bright' as const, label: '**', desc: 'Bright' },
  { key: 'squinty' as const, label: '--', desc: 'Squinty' }
];

const eyeColors = [
  { key: 'brown' as const, color: '#8B4513', label: 'Brown' },
  { key: 'blue' as const, color: '#4169E1', label: 'Blue' },
  { key: 'green' as const, color: '#228B22', label: 'Green' },
  { key: 'hazel' as const, color: '#DAA520', label: 'Hazel' },
  { key: 'gray' as const, color: '#708090', label: 'Gray' },
  { key: 'amber' as const, color: '#FFBF00', label: 'Amber' }
];

const hairStyles = [
  { key: 'short' as const, label: '✂️', desc: 'Short' },
  { key: 'medium' as const, label: '👤', desc: 'Medium' },
  { key: 'long' as const, label: '💇', desc: 'Long' },
  { key: 'curly' as const, label: '🌀', desc: 'Curly' },
  { key: 'braids' as const, label: '🎀', desc: 'Braids' },
  { key: 'ponytail' as const, label: '🎗️', desc: 'Ponytail' },
  { key: 'bald' as const, label: '⚪', desc: 'Bald' }
];

const hairColors = [
  { key: 'black' as const, color: '#000000', label: 'Black' },
  { key: 'brown' as const, color: '#8B4513', label: 'Brown' },
  { key: 'blonde' as const, color: '#FFD700', label: 'Blonde' },
  { key: 'red' as const, color: '#DC143C', label: 'Red' },
  { key: 'gray' as const, color: '#708090', label: 'Gray' },
  { key: 'blue' as const, color: '#4169E1', label: 'Blue' },
  { key: 'pink' as const, color: '#FF69B4', label: 'Pink' },
  { key: 'green' as const, color: '#32CD32', label: 'Green' }
];

const outfits = [
  { key: 'casual' as const, label: '👕', desc: 'Casual' },
  { key: 'formal' as const, label: '👔', desc: 'Formal' },
  { key: 'sporty' as const, label: '🏃', desc: 'Sporty' },
  { key: 'pajamas' as const, label: '😴', desc: 'Pajamas' },
  { key: 'superhero' as const, label: '🦸', desc: 'Superhero' },
  { key: 'princess' as const, label: '👑', desc: 'Princess' }
];

const accessoryOptions = [
  { key: 'glasses', label: '👓', desc: 'Glasses' },
  { key: 'hat', label: '🎩', desc: 'Hat' },
  { key: 'bow', label: '🎀', desc: 'Bow' },
  { key: 'earrings', label: '💎', desc: 'Earrings' },
  { key: 'necklace', label: '📿', desc: 'Necklace' }
];

const AvatarBuilder = ({ 
  open, 
  onOpenChange, 
  childName, 
  onSave, 
  initialConfig 
}: AvatarBuilderProps) => {
  const [config, setConfig] = useState<AvatarConfig>(initialConfig || defaultConfig);
  const [isSaving, setIsSaving] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const updateConfig = (key: keyof AvatarConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const toggleAccessory = (accessory: string) => {
    setConfig(prev => ({
      ...prev,
      accessories: prev.accessories.includes(accessory)
        ? prev.accessories.filter(a => a !== accessory)
        : [...prev.accessories, accessory]
    }));
  };

  const randomizeAvatar = () => {
    const randomConfig: AvatarConfig = {
      faceShape: faceShapes[Math.floor(Math.random() * faceShapes.length)].key,
      skinTone: skinTones[Math.floor(Math.random() * skinTones.length)].key,
      eyeStyle: eyeStyles[Math.floor(Math.random() * eyeStyles.length)].key,
      eyeColor: eyeColors[Math.floor(Math.random() * eyeColors.length)].key,
      hairStyle: hairStyles[Math.floor(Math.random() * hairStyles.length)].key,
      hairColor: hairColors[Math.floor(Math.random() * hairColors.length)].key,
      outfit: outfits[Math.floor(Math.random() * outfits.length)].key,
      accessories: Math.random() > 0.5 ? [accessoryOptions[Math.floor(Math.random() * accessoryOptions.length)].key] : []
    };
    setConfig(randomConfig);
  };

  // Generate avatar preview using canvas
  const generateAvatarPreview = (): string => {
    const canvas = canvasRef.current;
    if (!canvas) return '';

    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Set canvas size
    canvas.width = 200;
    canvas.height = 200;

    // Clear canvas
    ctx.fillStyle = '#f0f9ff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw face shape with skin tone
    const skinColor = skinTones.find(s => s.key === config.skinTone)?.color || '#fdbcb4';
    ctx.fillStyle = skinColor;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Draw face based on face shape
    switch (config.faceShape) {
      case 'round':
        ctx.beginPath();
        ctx.arc(centerX, centerY, 80, 0, 2 * Math.PI);
        ctx.fill();
        break;
      case 'oval':
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, 70, 90, 0, 0, 2 * Math.PI);
        ctx.fill();
        break;
      case 'square':
        ctx.fillRect(centerX - 75, centerY - 75, 150, 150);
        break;
      case 'heart':
        ctx.beginPath();
        ctx.moveTo(centerX, centerY + 60);
        ctx.bezierCurveTo(centerX - 80, centerY - 40, centerX - 40, centerY - 80, centerX, centerY - 60);
        ctx.bezierCurveTo(centerX + 40, centerY - 80, centerX + 80, centerY - 40, centerX, centerY + 60);
        ctx.fill();
        break;
    }

    // Draw hair if not bald
    if (config.hairStyle !== 'bald') {
      const hairColor = hairColors.find(h => h.key === config.hairColor)?.color || '#8B4513';
      ctx.fillStyle = hairColor;
      
      // Simple hair representation
      switch (config.hairStyle) {
        case 'short':
          ctx.fillRect(centerX - 85, centerY - 100, 170, 40);
          break;
        case 'medium':
          ctx.fillRect(centerX - 90, centerY - 110, 180, 60);
          break;
        case 'long':
          ctx.fillRect(centerX - 95, centerY - 120, 190, 180);
          break;
        case 'curly':
          // Draw curly hair with circles
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * 2 * Math.PI;
            const x = centerX + Math.cos(angle) * 85;
            const y = centerY - 80 + Math.sin(angle) * 20;
            ctx.beginPath();
            ctx.arc(x, y, 15, 0, 2 * Math.PI);
            ctx.fill();
          }
          break;
        case 'braids':
          // Draw two braids
          ctx.fillRect(centerX - 110, centerY - 80, 30, 120);
          ctx.fillRect(centerX + 80, centerY - 80, 30, 120);
          ctx.fillRect(centerX - 60, centerY - 100, 120, 30);
          break;
        case 'ponytail':
          ctx.fillRect(centerX - 80, centerY - 100, 160, 40);
          ctx.fillRect(centerX + 70, centerY - 60, 40, 100);
          break;
      }
    }

    // Draw eyes
    const eyeColor = eyeColors.find(e => e.key === config.eyeColor)?.color || '#8B4513';
    ctx.fillStyle = 'white';
    
    switch (config.eyeStyle) {
      case 'big':
        ctx.beginPath();
        ctx.arc(centerX - 25, centerY - 15, 15, 0, 2 * Math.PI);
        ctx.arc(centerX + 25, centerY - 15, 15, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = eyeColor;
        ctx.beginPath();
        ctx.arc(centerX - 25, centerY - 15, 8, 0, 2 * Math.PI);
        ctx.arc(centerX + 25, centerY - 15, 8, 0, 2 * Math.PI);
        ctx.fill();
        break;
      case 'small':
        ctx.beginPath();
        ctx.arc(centerX - 20, centerY - 10, 8, 0, 2 * Math.PI);
        ctx.arc(centerX + 20, centerY - 10, 8, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = eyeColor;
        ctx.beginPath();
        ctx.arc(centerX - 20, centerY - 10, 4, 0, 2 * Math.PI);
        ctx.arc(centerX + 20, centerY - 10, 4, 0, 2 * Math.PI);
        ctx.fill();
        break;
      case 'sleepy':
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX - 35, centerY - 10);
        ctx.lineTo(centerX - 15, centerY - 15);
        ctx.moveTo(centerX + 15, centerY - 15);
        ctx.lineTo(centerX + 35, centerY - 10);
        ctx.stroke();
        break;
      case 'bright':
        // Draw sparkly eyes
        ctx.fillStyle = eyeColor;
        ctx.beginPath();
        ctx.arc(centerX - 25, centerY - 15, 12, 0, 2 * Math.PI);
        ctx.arc(centerX + 25, centerY - 15, 12, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(centerX - 20, centerY - 18, 3, 0, 2 * Math.PI);
        ctx.arc(centerX + 30, centerY - 18, 3, 0, 2 * Math.PI);
        ctx.fill();
        break;
      case 'squinty':
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX - 30, centerY - 10);
        ctx.lineTo(centerX - 20, centerY - 10);
        ctx.moveTo(centerX + 20, centerY - 10);
        ctx.lineTo(centerX + 30, centerY - 10);
        ctx.stroke();
        break;
    }

    // Draw mouth
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY + 20, 15, 0, Math.PI);
    ctx.stroke();

    // Draw accessories
    config.accessories.forEach(accessory => {
      ctx.fillStyle = 'black';
      switch (accessory) {
        case 'glasses':
          ctx.strokeStyle = 'black';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(centerX - 25, centerY - 15, 18, 0, 2 * Math.PI);
          ctx.arc(centerX + 25, centerY - 15, 18, 0, 2 * Math.PI);
          ctx.moveTo(centerX - 7, centerY - 15);
          ctx.lineTo(centerX + 7, centerY - 15);
          ctx.stroke();
          break;
        case 'hat':
          ctx.fillStyle = 'black';
          ctx.fillRect(centerX - 60, centerY - 120, 120, 15);
          ctx.fillRect(centerX - 40, centerY - 140, 80, 20);
          break;
        case 'bow':
          ctx.fillStyle = 'red';
          ctx.beginPath();
          ctx.arc(centerX - 15, centerY - 90, 10, 0, 2 * Math.PI);
          ctx.arc(centerX + 15, centerY - 90, 10, 0, 2 * Math.PI);
          ctx.fill();
          ctx.fillRect(centerX - 5, centerY - 95, 10, 10);
          break;
        case 'earrings':
          ctx.fillStyle = 'gold';
          ctx.beginPath();
          ctx.arc(centerX - 50, centerY, 5, 0, 2 * Math.PI);
          ctx.arc(centerX + 50, centerY, 5, 0, 2 * Math.PI);
          ctx.fill();
          break;
        case 'necklace':
          ctx.strokeStyle = 'gold';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(centerX, centerY + 70, 40, -Math.PI, 0);
          ctx.stroke();
          break;
      }
    });

    return canvas.toDataURL('image/png');
  };

  // Update canvas whenever config changes  
  React.useEffect(() => {
    generateAvatarPreview();
  }, [config]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const previewUrl = generateAvatarPreview();
      await onSave(config, previewUrl);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save avatar:', error);
    }
    setIsSaving(false);
  };

  const OptionSelector = ({ 
    title, 
    options, 
    current, 
    onChange, 
    renderOption 
  }: {
    title: string;
    options: any[];
    current: any;
    onChange: (value: any) => void;
    renderOption: (option: any) => React.ReactNode;
  }) => (
    <div className="space-y-2">
      <h4 className="font-medium text-sm flex items-center gap-1">
        <Palette className="w-4 h-4" />
        {title}
      </h4>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.key || option}
            onClick={() => onChange(option.key || option)}
            className={`p-2 rounded-lg border transition-all ${
              current === (option.key || option)
                ? 'border-primary bg-primary/10 shadow-sm'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {renderOption(option)}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Create Avatar for {childName}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Avatar Preview */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Preview</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <div className="w-48 h-48 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                  <canvas
                    ref={canvasRef}
                    className="max-w-full max-h-full"
                    style={{ imageRendering: 'pixelated' }}
                  />
                  {/* Live preview would be rendered here */}
                  <div className="text-center text-gray-500">
                    <p className="text-sm">Avatar Preview</p>
                    <p className="text-xs">Gravity Falls Style</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={randomizeAvatar}
                    className="flex items-center gap-1"
                  >
                    <Shuffle className="w-4 h-4" />
                    Random
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const canvas = canvasRef.current;
                      if (canvas) {
                        const link = document.createElement('a');
                        link.download = `${childName.toLowerCase()}-avatar.png`;
                        link.href = canvas.toDataURL();
                        link.click();
                      }
                    }}
                    className="flex items-center gap-1"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customization Options */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Customize Appearance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Face Shape */}
                <OptionSelector
                  title="Face Shape"
                  options={faceShapes}
                  current={config.faceShape}
                  onChange={(value) => updateConfig('faceShape', value)}
                  renderOption={(option) => (
                    <div className="text-center">
                      <div className="text-lg">{option.label}</div>
                      <div className="text-xs text-gray-600">{option.desc}</div>
                    </div>
                  )}
                />

                {/* Skin Tone */}
                <OptionSelector
                  title="Skin Tone"
                  options={skinTones}
                  current={config.skinTone}
                  onChange={(value) => updateConfig('skinTone', value)}
                  renderOption={(option) => (
                    <div className="text-center">
                      <div
                        className="w-6 h-6 rounded-full border mx-auto mb-1"
                        style={{ backgroundColor: option.color }}
                      />
                      <div className="text-xs">{option.label}</div>
                    </div>
                  )}
                />

                {/* Eyes */}
                <OptionSelector
                  title="Eye Style"
                  options={eyeStyles}
                  current={config.eyeStyle}
                  onChange={(value) => updateConfig('eyeStyle', value)}
                  renderOption={(option) => (
                    <div className="text-center">
                      <div className="text-lg">{option.label}</div>
                      <div className="text-xs text-gray-600">{option.desc}</div>
                    </div>
                  )}
                />

                <OptionSelector
                  title="Eye Color"
                  options={eyeColors}
                  current={config.eyeColor}
                  onChange={(value) => updateConfig('eyeColor', value)}
                  renderOption={(option) => (
                    <div className="text-center">
                      <div
                        className="w-6 h-6 rounded-full border mx-auto mb-1"
                        style={{ backgroundColor: option.color }}
                      />
                      <div className="text-xs">{option.label}</div>
                    </div>
                  )}
                />

                {/* Hair */}
                <OptionSelector
                  title="Hair Style"
                  options={hairStyles}
                  current={config.hairStyle}
                  onChange={(value) => updateConfig('hairStyle', value)}
                  renderOption={(option) => (
                    <div className="text-center">
                      <div className="text-lg">{option.label}</div>
                      <div className="text-xs text-gray-600">{option.desc}</div>
                    </div>
                  )}
                />

                {config.hairStyle !== 'bald' && (
                  <OptionSelector
                    title="Hair Color"
                    options={hairColors}
                    current={config.hairColor}
                    onChange={(value) => updateConfig('hairColor', value)}
                    renderOption={(option) => (
                      <div className="text-center">
                        <div
                          className="w-6 h-6 rounded-full border mx-auto mb-1"
                          style={{ backgroundColor: option.color }}
                        />
                        <div className="text-xs">{option.label}</div>
                      </div>
                    )}
                  />
                )}

                {/* Outfit */}
                <OptionSelector
                  title="Outfit"
                  options={outfits}
                  current={config.outfit}
                  onChange={(value) => updateConfig('outfit', value)}
                  renderOption={(option) => (
                    <div className="text-center">
                      <div className="text-lg">{option.label}</div>
                      <div className="text-xs text-gray-600">{option.desc}</div>
                    </div>
                  )}
                />

                {/* Accessories */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm flex items-center gap-1">
                    <Palette className="w-4 h-4" />
                    Accessories
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {accessoryOptions.map((accessory) => (
                      <Badge
                        key={accessory.key}
                        variant={config.accessories.includes(accessory.key) ? "default" : "outline"}
                        className="cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => toggleAccessory(accessory.key)}
                      >
                        {accessory.label} {accessory.desc}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1"
              >
                {isSaving ? (
                  <>
                    <Save className="w-4 h-4 mr-2 animate-spin" />
                    Saving Avatar...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Avatar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AvatarBuilder;