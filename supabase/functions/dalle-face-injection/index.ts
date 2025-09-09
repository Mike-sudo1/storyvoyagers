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
      faceAnchor,
      emotion = 'happy',
      storyText = ''
    } = await req.json();

    console.log('Processing DALL-E face injection:', { storyId, childId, pageIndex, emotion });

    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Cache lookup
    const cacheKey = `dalle_${storyId}_${childId}_${pageIndex}`;
    const { data: cached } = await supabase
      .from('personalized_images')
      .select('image_url')
      .eq('cache_key', cacheKey)
      .single();
    if (cached?.image_url) {
      console.log('Returning cached personalized image');
      return new Response(JSON.stringify({
        success: true,
        imageUrl: cached.image_url,
        cacheKey,
        cached: true
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
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

    // Load mask from public storage URL
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const maskUrl = `${supabaseUrl}/storage/v1/object/public/Meroe/masks/circle_512.png`;
    console.log('Downloading mask from', maskUrl);
    const maskResp = await fetch(maskUrl);
    if (!maskResp.ok) {
      throw new Error('Failed to download mask image');
    }
    const rawMaskBlob = await maskResp.blob();

    // Align mask with face anchor if provided
    let maskBlob: Blob = rawMaskBlob;
    if (faceAnchor) {
      try {
        const maskCanvas = new OffscreenCanvas(512, 512);
        const mCtx = maskCanvas.getContext('2d')!;
        mCtx.fillStyle = 'white';
        mCtx.fillRect(0, 0, 512, 512);
        const maskImg = await createImageBitmap(rawMaskBlob);
        const r = faceAnchor.r || 256;
        const x = faceAnchor.x || 256;
        const y = faceAnchor.y || 256;
        mCtx.globalCompositeOperation = 'destination-out';
        mCtx.drawImage(maskImg, x - r, y - r, r * 2, r * 2);
        maskBlob = await maskCanvas.convertToBlob();
        console.log('Mask aligned using faceAnchor');
      } catch (e) {
        console.error('Failed to align mask with faceAnchor, using raw mask', e);
      }
    }
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

    let generatedBlob: Blob;
    try {
      console.log('Calling DALL-E inpainting API');
      const formData = new FormData();
      formData.append('image', illustrationBlob, 'illustration.png');
      formData.append('image', avatarBlob, 'avatar.png');
      formData.append('mask', maskBlob, 'mask.png');
      formData.append('prompt', prompt);
      formData.append('n', '1');
      formData.append('size', '512x512');

      const dalleResponse = await fetch('https://api.openai.com/v1/images/edits', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIKey}`,
        },
        body: formData,
      });

      if (!dalleResponse.ok) {
        const errorText = await dalleResponse.text();
        throw new Error(`DALL-E API error: ${dalleResponse.status} ${errorText}`);
      }

      const dalleResult = await dalleResponse.json();
      if (!dalleResult.data || dalleResult.data.length === 0) {
        throw new Error('No images returned from DALL-E');
      }
      const generatedImageUrl = dalleResult.data[0].url;
      const generatedResponse = await fetch(generatedImageUrl);
      generatedBlob = await generatedResponse.blob();
      console.log('DALL-E face injection succeeded');
    } catch (dalleErr) {
      console.error('DALL-E injection failed, falling back to canvas method:', dalleErr);
      generatedBlob = await fallbackCanvas(illustrationBlob, avatarBlob, faceAnchor);
    }

    // Upload to Supabase storage
    const fileName = `rendered/${storyId}/${childId}/page-${pageIndex}.png`;
    const { error: uploadError } = await supabase.storage
      .from('Meroe')
      .upload(fileName, generatedBlob, {
        contentType: 'image/png',
        upsert: true
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get the public URL
    const publicUrl = supabase.storage
      .from('Meroe')
      .getPublicUrl(fileName).data.publicUrl;

    // Cache the result in the database
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

    console.log('Successfully generated and saved personalized image:', publicUrl);

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

async function fallbackCanvas(
  illustrationBlob: Blob,
  avatarBlob: Blob,
  faceAnchor: { x: number; y: number; r: number } | undefined
): Promise<Blob> {
  console.log('Running canvas fallback method');

  const [illustrationArray, avatarArray] = await Promise.all([
    illustrationBlob.arrayBuffer(),
    avatarBlob.arrayBuffer(),
  ]);

  const illustrationBase64 = btoa(String.fromCharCode(...new Uint8Array(illustrationArray)));
  const avatarBase64 = btoa(String.fromCharCode(...new Uint8Array(avatarArray)));

  const baseImg = new Image();
  baseImg.src = `data:image/png;base64,${illustrationBase64}`;
  await new Promise((res) => (baseImg.onload = res));

  const avatarImg = new Image();
  avatarImg.src = `data:image/png;base64,${avatarBase64}`;
  await new Promise((res) => (avatarImg.onload = res));

  const canvas = new OffscreenCanvas(baseImg.width, baseImg.height);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(baseImg, 0, 0);

  const anchor = faceAnchor || { x: baseImg.width / 2, y: baseImg.height / 2, r: 128 };
  ctx.save();
  ctx.beginPath();
  ctx.arc(anchor.x, anchor.y, anchor.r, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatarImg, anchor.x - anchor.r, anchor.y - anchor.r, anchor.r * 2, anchor.r * 2);
  ctx.restore();

  const blob = await canvas.convertToBlob({ type: 'image/png' });
  console.log('Canvas fallback complete');
  return blob;
}

