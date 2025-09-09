import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      illustrationUrl, 
      avatarUrl, 
      storyId, 
      childId, 
      pageIndex,
      emotion = 'happy',
      storyText = ''
    } = await req.json();

    console.log('Processing DALL-E face injection:', { storyId, childId, pageIndex, emotion });

    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Download the illustration image
    const illustrationResponse = await fetch(illustrationUrl);
    if (!illustrationResponse.ok) {
      throw new Error('Failed to download illustration');
    }
    const illustrationBlob = await illustrationResponse.blob();

    // Download the avatar image
    const avatarResponse = await fetch(avatarUrl);
    if (!avatarResponse.ok) {
      throw new Error('Failed to download avatar');
    }
    const avatarBlob = await avatarResponse.blob();

    // Create a circular mask for the placeholder area
    const maskBlob = await createCircularMask();

    // Prepare the prompt based on emotion and story context
    const emotionPrompts = {
      'happy': 'smiling cheerfully with bright eyes',
      'curious': 'looking curious and interested with raised eyebrows', 
      'surprised': 'looking surprised with wide eyes and open mouth',
      'excited': 'looking excited and energetic with a big smile',
      'thoughtful': 'looking thoughtful and contemplative',
      'confident': 'looking confident and determined'
    };

    const emotionDesc = emotionPrompts[emotion as keyof typeof emotionPrompts] || emotionPrompts.happy;
    
    const prompt = `Replace the white circular placeholder with "INSERT FACE" text with a cartoon child's face that is ${emotionDesc}. The face should match the illustration's art style - colorful, friendly cartoon style with clean lines. The child should have a warm, expressive face that blends naturally into the scene. Remove all placeholder text and white circle completely. The face should look like it belongs in this cartoon illustration.`;

    console.log('Using prompt:', prompt);

    // Create FormData for the DALL-E API request
    const formData = new FormData();
    formData.append('image', illustrationBlob, 'illustration.png');
    formData.append('mask', maskBlob, 'mask.png');
    formData.append('prompt', prompt);
    formData.append('n', '1');
    formData.append('size', '1024x1024');

    // Call OpenAI DALL-E inpainting API
    const dalleResponse = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
      },
      body: formData,
    });

    if (!dalleResponse.ok) {
      const errorText = await dalleResponse.text();
      console.error('DALL-E API error:', errorText);
      throw new Error(`DALL-E API error: ${dalleResponse.status} ${errorText}`);
    }

    const dalleResult = await dalleResponse.json();
    console.log('DALL-E result:', dalleResult);

    if (!dalleResult.data || dalleResult.data.length === 0) {
      throw new Error('No images returned from DALL-E');
    }

    // Download the generated image
    const generatedImageUrl = dalleResult.data[0].url;
    const generatedResponse = await fetch(generatedImageUrl);
    const generatedBlob = await generatedResponse.blob();

    // Upload to Supabase storage
    const fileName = `personalized/${storyId}/${childId}/page-${pageIndex}-dalle.png`;
    const { error: uploadError } = await supabase.storage
      .from('StoryVoyagers')
      .upload(fileName, generatedBlob, { 
        contentType: 'image/png', 
        upsert: true 
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get the public URL
    const publicUrl = supabase.storage
      .from('StoryVoyagers')
      .getPublicUrl(fileName).data.publicUrl;

    // Cache the result in the database
    const cacheKey = `dalle_${storyId}_${childId}_${pageIndex}`;
    await supabase
      .from('personalized_images')
      .upsert({
        cache_key: cacheKey,
        story_id: storyId,
        child_id: childId,
        page_index: pageIndex,
        image_url: publicUrl,
        emotion: emotion,
      }, { onConflict: 'cache_key' });

    console.log('Successfully generated and saved DALL-E personalized image:', publicUrl);

    return new Response(JSON.stringify({ 
      success: true, 
      imageUrl: publicUrl,
      cacheKey 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in DALL-E face injection:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Create a circular mask for the placeholder area
async function createCircularMask(): Promise<Blob> {
  // Create a simple circular mask - white circle on black background
  const canvas = new OffscreenCanvas(1024, 1024);
  const ctx = canvas.getContext('2d')!;
  
  // Fill with black (areas to keep)
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, 1024, 1024);
  
  // Draw white circle in center (area to replace)
  const centerX = 512;
  const centerY = 400; // Slightly higher than center for face placement
  const radius = 120;
  
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();
  
  const blob = await canvas.convertToBlob({ type: 'image/png' });
  return blob;
}
