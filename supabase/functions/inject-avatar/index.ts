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
      template_image_url, 
      avatar_url, 
      face_anchor,
      emotion = 'happy',
      angle = 'front',
      story_id,
      child_id,
      page_index
    } = await req.json();

    console.log('Processing avatar injection:', { story_id, child_id, page_index, emotion, angle });

    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Check if injected image already exists
    const injectedPath = `story_injected/${story_id}/page_${page_index}.png`;
    const { data: existingFile } = await supabase.storage
      .from('Meroe')
      .list(`story_injected/${story_id}/`, { search: `page_${page_index}.png` });

    if (existingFile && existingFile.length > 0) {
      console.log('Using existing injected image');
      const publicUrl = supabase.storage
        .from('Meroe')
        .getPublicUrl(injectedPath).data.publicUrl;
      
      return new Response(JSON.stringify({ 
        success: true, 
        imageUrl: publicUrl,
        cached: true 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Download the template image
    const templateResponse = await fetch(template_image_url);
    if (!templateResponse.ok) {
      throw new Error('Failed to download template image');
    }
    const templateBlob = await templateResponse.blob();

    // Load the circular mask from Supabase Storage
    let maskBlob: Blob;
    try {
      const { data: maskFile, error: maskErr } = await supabase.storage
        .from('Meroe')
        .download('masks/circle_512.png');
      if (maskErr || !maskFile) {
        throw maskErr || new Error('Mask file not found');
      }
      maskBlob = maskFile as Blob;
    } catch (e) {
      console.error('Failed to download mask from storage:', e);
      // Fallback: try public URL
      const maskUrl = supabase.storage
        .from('Meroe')
        .getPublicUrl('masks/circle_512.png').data.publicUrl;
      const maskResp = await fetch(maskUrl);
      if (!maskResp.ok) {
        throw new Error('Failed to fetch mask via public URL');
      }
      maskBlob = await maskResp.blob();
    }

    // Create emotion-aware prompt
    const emotionPrompts = {
      'happy': 'smiling cheerfully with bright, joyful eyes',
      'curious': 'looking curious and interested with raised eyebrows and wondering expression', 
      'surprised': 'looking surprised with wide eyes and amazed expression',
      'excited': 'looking excited and energetic with a big enthusiastic smile',
      'thoughtful': 'looking thoughtful and contemplative with a focused expression',
      'confident': 'looking confident and determined with a strong, assured expression',
      'sad': 'looking sad with downturned mouth and concerned eyes',
      'scared': 'looking scared or worried with wide, nervous eyes'
    };

    const anglePrompts = {
      'front': 'facing directly forward',
      'left': 'facing slightly to the left',
      'right': 'facing slightly to the right',
      'profile': 'in profile view'
    };

    const emotionDesc = emotionPrompts[emotion as keyof typeof emotionPrompts] || emotionPrompts.happy;
    const angleDesc = anglePrompts[angle as keyof typeof anglePrompts] || anglePrompts.front;
    
    const prompt = `A cartoon child's face that is ${emotionDesc}, ${angleDesc}. The face should match the illustration's colorful, friendly cartoon art style with clean lines and vibrant colors. The child should look natural and blend seamlessly into the scene. Remove any placeholder elements completely.`;

    console.log('Using DALL-E prompt:', prompt);

    // Create FormData for the DALL-E API request
    const formData = new FormData();
    formData.append('image', templateBlob, 'template.png');
    formData.append('mask', maskBlob, 'mask.png');
    formData.append('prompt', prompt);
    formData.append('n', '1');
    formData.append('size', '512x512');

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
    console.log('DALL-E result received');

    if (!dalleResult.data || dalleResult.data.length === 0) {
      throw new Error('No images returned from DALL-E');
    }

    // Download the generated image
    const generatedImageUrl = dalleResult.data[0].url;
    const generatedResponse = await fetch(generatedImageUrl);
    const generatedBlob = await generatedResponse.blob();

    // Upload to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from('Meroe')
      .upload(injectedPath, generatedBlob, { 
        contentType: 'image/png', 
        upsert: true 
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get the public URL
    const publicUrl = supabase.storage
      .from('Meroe')
      .getPublicUrl(injectedPath).data.publicUrl;

    console.log('Successfully generated and saved injected image:', publicUrl);

    return new Response(JSON.stringify({ 
      success: true, 
      imageUrl: publicUrl
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in inject-avatar function:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});