import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 🔒 Style-locked prompt used for both edit + generation
const STYLE_PROMPT = `
Transform this photo into a cozy children's-book illustration with the following style:
- Clean, bold outlines (consistent line weight), smooth vector-like shapes
- Bright but gentle colors with soft gradients (no harsh shadows), slight paper-like texture
- Childlike proportions: slightly oversized head, rounded features
- Face: big round eyes, small curved nose, soft smile, subtle cheek blush; preserve likeness
- Clothing simplified; readable shapes and folds; avoid tiny details
- Background simple and whimsical (flat shapes, soft clouds, tiny stars when night), uncluttered
- Overall vibe: warm "bedtime story" look similar to modern PBS Kids storybooks
Hard rules: no photorealism, no sketchy pencil lines, no anime/manga look, no halftone/comic dots.
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Auth
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

    // Inputs
    const formData = await req.formData();
    const file = formData.get('image') as File;
    const childId = formData.get('childId') as string;
    if (!file || !childId) {
      return new Response(
        JSON.stringify({ error: 'Image file and child ID are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Convert image to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    // --- MAIN: Edit the provided photo into the locked style
    const openAIResponse = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        image: `data:image/${file.type.split('/')[1]};base64,${base64Image}`,
        prompt: STYLE_PROMPT,
        n: 1,
        size: "1024x1024",
        response_format: "url"
      }),
    });

    // Fallback: pure generation (keeps same style)
    if (!openAIResponse.ok) {
      const generateResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "gpt-image-1",
          prompt: `Portrait, front-and-center composition. ${STYLE_PROMPT}`,
          n: 1,
          size: "1024x1024",
          response_format: "url"
        }),
      });

      const generateResult = await generateResponse.json();
      if (!generateResponse.ok) {
        throw new Error(`OpenAI API error: ${generateResult.error?.message || 'Unknown error'}`);
      }

      const cartoonImageUrl = generateResult.data[0].url;
      const imageResponse = await fetch(cartoonImageUrl);
      const imageBlob = await imageResponse.blob();

      const fileName = `${user.id}/${childId}_avatar_${Date.now()}.png`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, imageBlob, { contentType: 'image/png', upsert: true });
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('children')
        .update({ avatar_url: publicUrlData.publicUrl })
        .eq('id', childId)
        .eq('user_id', user.id);
      if (updateError) throw updateError;

      return new Response(
        JSON.stringify({ success: true, avatarUrl: publicUrlData.publicUrl, message: 'Avatar created (fallback)!' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Success path for edit call
    const result = await openAIResponse.json();
    const cartoonImageUrl = result.data[0].url;

    const imageResponse = await fetch(cartoonImageUrl);
    const imageBlob = await imageResponse.blob();

    const fileName = `${user.id}/${childId}_avatar_${Date.now()}.png`;
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, imageBlob, { contentType: 'image/png', upsert: true });
    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(fileName);

    const { error: updateError } = await supabase
      .from('children')
      .update({ avatar_url: publicUrlData.publicUrl })
      .eq('id', childId)
      .eq('user_id', user.id);
    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ success: true, avatarUrl: publicUrlData.publicUrl, message: 'Photo cartoonified successfully!' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
