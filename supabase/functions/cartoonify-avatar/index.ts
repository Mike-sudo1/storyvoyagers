import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get the current user
    const authHeader = req.headers.get('Authorization')!;
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const formData = await req.formData();
    const file = formData.get('image') as File;
    const childId = formData.get('childId') as string;

    if (!file || !childId) {
      return new Response(
        JSON.stringify({ error: 'Image file and child ID are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Convert image to base64 for OpenAI
    const arrayBuffer = await file.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    
    // Call OpenAI DALL-E to cartoonify the image
    const openAIResponse = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: `data:image/${file.type.split('/')[1]};base64,${base64Image}`,
        prompt: "Transform this child's photo into a cute children's book style illustration. Use bright, warm colors, soft shading, and clean bold outlines. The character should have large expressive eyes, rounded facial features, and a friendly smile. Keep proportions simplified and slightly exaggerated in a cartoon way. The background should be simple, with flat colors, smooth gradients, and a whimsical atmosphere. Keep the facial features recognizable.",
        n: 1,
        size: "512x512",
        response_format: "url"
      }),
    });

    if (!openAIResponse.ok) {
      // Fallback: Create a cartoon-style image with DALL-E generation instead of edit
      const generateResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: "A cute children's book style illustration of a child character. Use bright, warm colors, soft shading, and clean bold outlines. The character should have large expressive eyes, rounded facial features, and a friendly smile. Keep proportions simplified and slightly exaggerated in a cartoon way. The background should be simple, with flat colors, smooth gradients, and a whimsical atmosphere.",
          n: 1,
          size: "512x512",
          response_format: "url"
        }),
      });

      const generateResult = await generateResponse.json();
      
      if (!generateResponse.ok) {
        throw new Error(`OpenAI API error: ${generateResult.error?.message || 'Unknown error'}`);
      }

      const cartoonImageUrl = generateResult.data[0].url;

      // Download the generated image
      const imageResponse = await fetch(cartoonImageUrl);
      const imageBlob = await imageResponse.blob();

      // Upload to Supabase storage
      const fileName = `${user.id}/${childId}_avatar_${Date.now()}.png`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, imageBlob, {
          contentType: 'image/png',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update child's avatar URL
      const { error: updateError } = await supabase
        .from('children')
        .update({ avatar_url: publicUrlData.publicUrl })
        .eq('id', childId)
        .eq('user_id', user.id);

      if (updateError) {
        throw updateError;
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          avatarUrl: publicUrlData.publicUrl,
          message: 'Avatar created successfully!'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await openAIResponse.json();
    const cartoonImageUrl = result.data[0].url;

    // Download the cartoonified image
    const imageResponse = await fetch(cartoonImageUrl);
    const imageBlob = await imageResponse.blob();

    // Upload to Supabase storage
    const fileName = `${user.id}/${childId}_avatar_${Date.now()}.png`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, imageBlob, {
        contentType: 'image/png',
        upsert: true
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    // Update child's avatar URL
    const { error: updateError } = await supabase
      .from('children')
      .update({ avatar_url: publicUrlData.publicUrl })
      .eq('id', childId)
      .eq('user_id', user.id);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        avatarUrl: publicUrlData.publicUrl,
        message: 'Photo cartoonified successfully!'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});