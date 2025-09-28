import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { AvatarConfig } from '@/components/AvatarBuilder';

export const useAvatarGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAvatarImage = async (
    config: AvatarConfig, 
    childId: string, 
    childName: string
  ): Promise<string | null> => {
    setIsGenerating(true);
    setError(null);

    try {
      // Create a more detailed prompt for DALL-E based on the avatar config
      const prompt = buildAvatarPrompt(config, childName);
      
      const { data, error: functionError } = await supabase.functions.invoke('generate-avatar-image', {
        body: {
          prompt,
          child_id: childId,
          avatar_config: config
        }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (!data?.imageUrl) {
        throw new Error('No image URL received');
      }

      return data.imageUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate avatar image';
      setError(errorMessage);
      console.error('Avatar generation error:', err);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const buildAvatarPrompt = (config: AvatarConfig, childName: string): string => {
    const faceDesc = getFaceDescription(config.faceShape);
    const skinDesc = getSkinDescription(config.skinTone);
    const eyeDesc = getEyeDescription(config.eyeStyle, config.eyeColor);
    const hairDesc = getHairDescription(config.hairStyle, config.hairColor);
    const outfitDesc = getOutfitDescription(config.outfit);
    const accessoryDesc = getAccessoryDescription(config.accessories);

    return `
Professional cartoon avatar portrait in the style of Gravity Falls animation. 
Character: ${childName}, a child with ${faceDesc} face, ${skinDesc} skin tone, ${eyeDesc} eyes, ${hairDesc} hair, wearing ${outfitDesc}${accessoryDesc ? ` and ${accessoryDesc}` : ''}.
Art style: Gravity Falls cartoon style, clean vector art, bright colors, child-friendly, expressive face, smiling expression.
Quality: High resolution, professional children's book illustration style, consistent character design.
Background: Simple solid color or subtle gradient background.
`.trim();
  };

  const getFaceDescription = (shape: string): string => {
    const descriptions = {
      round: 'a round, cheerful',
      oval: 'an oval, friendly', 
      square: 'a strong, determined',
      heart: 'a heart-shaped, sweet'
    };
    return descriptions[shape as keyof typeof descriptions] || 'a friendly';
  };

  const getSkinDescription = (tone: string): string => {
    const descriptions = {
      light: 'light',
      medium: 'medium',
      tan: 'tan',
      dark: 'dark',
      olive: 'olive'
    };
    return descriptions[tone as keyof typeof descriptions] || 'medium';
  };

  const getEyeDescription = (style: string, color: string): string => {
    const styleDescs = {
      big: 'large, expressive',
      small: 'small, cute',
      sleepy: 'sleepy, relaxed',
      bright: 'bright, sparkly',
      squinty: 'squinty, mischievous'
    };
    const colorDescs = {
      brown: 'brown',
      blue: 'blue',
      green: 'green',
      hazel: 'hazel',
      gray: 'gray',
      amber: 'amber'
    };
    
    const styleDesc = styleDescs[style as keyof typeof styleDescs] || 'friendly';
    const colorDesc = colorDescs[color as keyof typeof colorDescs] || 'brown';
    
    return `${styleDesc} ${colorDesc}`;
  };

  const getHairDescription = (style: string, color: string): string => {
    if (style === 'bald') return 'no hair (bald)';
    
    const styleDescs = {
      short: 'short',
      medium: 'medium-length',
      long: 'long',
      curly: 'curly',
      braids: 'braided',
      ponytail: 'in a ponytail'
    };
    const colorDescs = {
      black: 'black',
      brown: 'brown',
      blonde: 'blonde',
      red: 'red',
      gray: 'gray',
      blue: 'blue',
      pink: 'pink',
      green: 'green'
    };
    
    const styleDesc = styleDescs[style as keyof typeof styleDescs] || 'medium-length';
    const colorDesc = colorDescs[color as keyof typeof colorDescs] || 'brown';
    
    return `${styleDesc} ${colorDesc}`;
  };

  const getOutfitDescription = (outfit: string): string => {
    const descriptions = {
      casual: 'casual clothes (t-shirt and jeans)',
      formal: 'formal attire (dress shirt or nice dress)',
      sporty: 'sporty outfit (athletic wear)',
      pajamas: 'colorful pajamas',
      superhero: 'a superhero costume with cape',
      princess: 'a beautiful princess dress'
    };
    return descriptions[outfit as keyof typeof descriptions] || 'casual clothes';
  };

  const getAccessoryDescription = (accessories: string[]): string => {
    if (!accessories.length) return '';
    
    const descriptions = {
      glasses: 'glasses',
      hat: 'a fun hat',
      bow: 'a cute bow',
      earrings: 'small earrings',
      necklace: 'a simple necklace'
    };
    
    const accessoryDescs = accessories.map(acc => 
      descriptions[acc as keyof typeof descriptions] || acc
    );
    
    return accessoryDescs.join(', ');
  };

  return {
    generateAvatarImage,
    buildAvatarPrompt,
    isGenerating,
    error
  };
};