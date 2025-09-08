import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PersonalizeImageRequest {
  storyImageUrl: string;
  childAvatarUrl: string;
  childId: string;
  storyId: string;
  pageIndex: number;
  emotion?: 'happy' | 'curious' | 'surprised' | 'excited' | 'thoughtful' | 'confident';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { storyImageUrl, childAvatarUrl, childId, storyId, pageIndex, emotion = 'happy' }: PersonalizeImageRequest = await req.json();

    if (!storyImageUrl || !childAvatarUrl || !childId || !storyId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('Processing image personalization:', { storyId, childId, pageIndex, emotion });

    // Check if we already have a cached personalized image
    const cacheKey = `${storyId}_${childId}_${pageIndex}`;
    const { data: existingImage } = await supabase
      .from('personalized_images')
      .select('image_url')
      .eq('cache_key', cacheKey)
      .single();

    if (existingImage) {
      console.log('Returning cached personalized image');
      return new Response(
        JSON.stringify({ imageUrl: existingImage.image_url }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch both images
    const [storyImageResponse, avatarImageResponse] = await Promise.all([
      fetch(storyImageUrl),
      fetch(childAvatarUrl)
    ]);

    if (!storyImageResponse.ok || !avatarImageResponse.ok) {
      throw new Error('Failed to fetch source images');
    }

    const storyImageBuffer = await storyImageResponse.arrayBuffer();
    const avatarImageBuffer = await avatarImageResponse.arrayBuffer();

    // Create composite image using Canvas API
    const personalizedImage = await createPersonalizedImage(
      storyImageBuffer, 
      avatarImageBuffer, 
      emotion
    );

    // Upload the personalized image to Supabase Storage
    const fileName = `personalized/${cacheKey}_${Date.now()}.png`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('StoryVoyagers')
      .upload(fileName, personalizedImage, {
        contentType: 'image/png',
        cacheControl: '3600'
      });

    if (uploadError) {
      throw new Error(`Failed to upload personalized image: ${uploadError.message}`);
    }

    const personalizedImageUrl = `${supabaseUrl}/storage/v1/object/public/StoryVoyagers/${fileName}`;

    // Cache the result
    await supabase
      .from('personalized_images')
      .insert({
        cache_key: cacheKey,
        story_id: storyId,
        child_id: childId,
        page_index: pageIndex,
        image_url: personalizedImageUrl,
        emotion: emotion
      });

    console.log('Created and cached personalized image:', personalizedImageUrl);

    return new Response(
      JSON.stringify({ imageUrl: personalizedImageUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in personalize-story-image function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function createPersonalizedImage(
  storyImageBuffer: ArrayBuffer,
  avatarImageBuffer: ArrayBuffer,
  emotion: string
): Promise<Uint8Array> {
  // Convert ArrayBuffers to base64 for processing
  const storyImageBase64 = btoa(String.fromCharCode(...new Uint8Array(storyImageBuffer)));
  const avatarImageBase64 = btoa(String.fromCharCode(...new Uint8Array(avatarImageBuffer)));

  // Create canvas elements for image processing
  const canvas = new OffscreenCanvas(1024, 768);
  const ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;

  // Load story image
  const storyImg = new Image();
  storyImg.src = `data:image/png;base64,${storyImageBase64}`;
  await new Promise((resolve) => { storyImg.onload = resolve; });

  // Load avatar image
  const avatarImg = new Image();
  avatarImg.src = `data:image/png;base64,${avatarImageBase64}`;
  await new Promise((resolve) => { avatarImg.onload = resolve; });

  // Set canvas size to match story image
  canvas.width = storyImg.width;
  canvas.height = storyImg.height;

  // Draw the story image as base
  ctx.drawImage(storyImg, 0, 0);

  // Detect blank face area (simplified - looks for circular blank areas)
  const facePosition = await detectBlankFace(ctx, canvas.width, canvas.height);
  
  if (facePosition) {
    // Apply emotion filter to avatar before compositing
    const emotionalAvatar = await applyEmotion(avatarImg, emotion);
    
    // Composite the avatar onto the detected face area
    await compositeFace(ctx, emotionalAvatar, facePosition);
  }

  // Convert canvas to blob then to Uint8Array
  const blob = await canvas.convertToBlob({ type: 'image/png' });
  return new Uint8Array(await blob.arrayBuffer());
}

async function detectBlankFace(
  ctx: OffscreenCanvasRenderingContext2D, 
  width: number, 
  height: number
): Promise<{ x: number, y: number, radius: number } | null> {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  // Simple algorithm to detect circular blank areas
  // This looks for areas with consistent light colors (blank face placeholder)
  const centerX = Math.floor(width * 0.4); // Approximate character position
  const centerY = Math.floor(height * 0.3); // Head area
  const searchRadius = Math.floor(Math.min(width, height) * 0.15);
  
  // Check if there's a circular blank area around the expected face position
  let blankPixels = 0;
  let totalPixels = 0;
  
  for (let y = centerY - searchRadius; y < centerY + searchRadius; y++) {
    for (let x = centerX - searchRadius; x < centerX + searchRadius; x++) {
      if (x >= 0 && x < width && y >= 0 && y < height) {
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        if (distance <= searchRadius) {
          const pixelIndex = (y * width + x) * 4;
          const r = data[pixelIndex];
          const g = data[pixelIndex + 1];
          const b = data[pixelIndex + 2];
          
          // Check if pixel is light/blank (skin-tone or white)
          if (r > 200 && g > 180 && b > 160) {
            blankPixels++;
          }
          totalPixels++;
        }
      }
    }
  }
  
  // If more than 70% of the area is blank, consider it a face placeholder
  if (totalPixels > 0 && (blankPixels / totalPixels) > 0.7) {
    return { x: centerX, y: centerY, radius: searchRadius };
  }
  
  return null;
}

async function applyEmotion(avatarImg: HTMLImageElement, emotion: string): Promise<HTMLImageElement> {
  // Create a canvas to apply emotion effects
  const emotionCanvas = new OffscreenCanvas(avatarImg.width, avatarImg.height);
  const emotionCtx = emotionCanvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
  
  // Draw the original avatar
  emotionCtx.drawImage(avatarImg, 0, 0);
  
  // Apply emotion-specific effects (simplified)
  switch (emotion) {
    case 'happy':
      // Slightly brighten the image
      emotionCtx.globalAlpha = 0.2;
      emotionCtx.fillStyle = '#ffeb3b';
      emotionCtx.fillRect(0, 0, avatarImg.width, avatarImg.height);
      break;
    case 'curious':
      // Add a slight blue tint
      emotionCtx.globalAlpha = 0.1;
      emotionCtx.fillStyle = '#2196f3';
      emotionCtx.fillRect(0, 0, avatarImg.width, avatarImg.height);
      break;
    case 'surprised':
      // Add a bright highlight
      emotionCtx.globalAlpha = 0.3;
      emotionCtx.fillStyle = '#fff';
      emotionCtx.fillRect(0, 0, avatarImg.width, avatarImg.height);
      break;
    case 'excited':
      // Add an orange/red tint
      emotionCtx.globalAlpha = 0.15;
      emotionCtx.fillStyle = '#ff9800';
      emotionCtx.fillRect(0, 0, avatarImg.width, avatarImg.height);
      break;
    default:
      break;
  }
  
  // Convert back to image
  const blob = await emotionCanvas.convertToBlob();
  const emotionalAvatar = new Image();
  emotionalAvatar.src = URL.createObjectURL(blob);
  await new Promise((resolve) => { emotionalAvatar.onload = resolve; });
  
  return emotionalAvatar;
}

async function compositeFace(
  ctx: OffscreenCanvasRenderingContext2D,
  avatarImg: HTMLImageElement,
  facePosition: { x: number, y: number, radius: number }
): Promise<void> {
  const { x, y, radius } = facePosition;
  
  // Create circular clipping path for the face area
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.clip();
  
  // Calculate avatar sizing to fit the face area
  const avatarSize = radius * 2;
  const avatarX = x - radius;
  const avatarY = y - radius;
  
  // Draw the avatar image within the clipped area
  ctx.drawImage(avatarImg, avatarX, avatarY, avatarSize, avatarSize);
  
  // Apply blending to match the scene lighting
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = '#e8d5b7'; // Warm skin tone adjustment
  ctx.fill();
  
  ctx.restore();
}