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
      story_id,
      child_id,
      story_pages,
      child_avatar_url,
      character_prompt,
      style_prompt = "colorful watercolor cartoon, clean outlines, semi-stylized background"
    } = await req.json();

    console.log('Generating illustrations for story:', { story_id, child_id, pages: story_pages.length });

    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Check existing illustrations to avoid regeneration
    const { data: existing } = await supabase
      .from('story_illustrations')
      .select('page_number, image_url, generation_status')
      .eq('story_id', story_id)
      .eq('child_id', child_id);

    const existingPages = new Set(existing?.map(img => img.page_number) || []);
    const results: any[] = [];

    // Process each page
    for (let i = 0; i < story_pages.length; i++) {
      const page = story_pages[i];
      const page_number = page.page_number || i + 1;

      // Skip if already generated successfully
      if (existingPages.has(page_number)) {
        const existingPage = existing?.find(p => p.page_number === page_number);
        if (existingPage?.generation_status === 'success') {
          results.push({
            page_number,
            status: 'cached',
            image_url: existingPage.image_url
          });
          continue;
        }
      }

      try {
        // Update status to generating
        await supabase
          .from('story_illustrations')
          .upsert({
            story_id,
            child_id,
            page_number,
            generation_status: 'generating',
            image_url: '',
            prompt_used: ''
          });

        // Build contextual prompt
        const continuityContext = i > 0 ? `This continues from previous scene. ` : '';
        const fullPrompt = `${continuityContext}${page.text}

Featuring the main character: ${character_prompt}.
Style: ${style_prompt}.
The character should maintain consistent appearance throughout the story - same clothes, hairstyle, and facial features.
${i > 0 ? 'Ensure visual continuity with the previous scenes.' : ''}`;

        console.log(`Generating page ${page_number} with prompt:`, fullPrompt);

        console.log(`Generating image for page ${page_number} with DALL-E...`);
        
        // Generate image with DALL-E 2 (more stable)
        const dalleResponse = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'dall-e-2',
            prompt: fullPrompt.substring(0, 1000), // DALL-E 2 has 1000 char limit
            n: 1,
            size: '1024x1024',
            response_format: 'url'
          }),
        });

        if (!dalleResponse.ok) {
          const errorText = await dalleResponse.text();
          console.error(`DALL-E API error: ${dalleResponse.status} ${errorText}`);
          throw new Error(`DALL-E API error: ${dalleResponse.status} ${errorText}`);
        }

        const dalleResult = await dalleResponse.json();
        if (!dalleResult.data || dalleResult.data.length === 0) {
          console.error('No images returned from DALL-E');
          throw new Error('No images returned from DALL-E');
        }

        // DALL-E returns URL, fetch and convert to blob for upload
        const imageUrl = dalleResult.data[0].url;
        console.log(`Fetching generated image from: ${imageUrl.substring(0, 50)}...`);
        
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch generated image: ${imageResponse.status}`);
        }
        const imageBlob = await imageResponse.blob();

        // Upload to Supabase Storage
        const fileName = `rendered/${child_id}/${story_id}/page_${page_number}.png`;
        const { error: uploadError } = await supabase.storage
          .from('StoryVoyagers')
          .upload(fileName, imageBlob, {
            contentType: 'image/png',
            upsert: true
          });

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL
        const publicUrl = supabase.storage
          .from('StoryVoyagers')
          .getPublicUrl(fileName).data.publicUrl;

        // Update with success
        await supabase
          .from('story_illustrations')
          .upsert({
            story_id,
            child_id,
            page_number,
            generation_status: 'success',
            image_url: publicUrl,
            prompt_used: fullPrompt
          });

        results.push({
          page_number,
          status: 'generated',
          image_url: publicUrl
        });

        console.log(`Successfully generated page ${page_number}`);

      } catch (error) {
        console.error(`Error generating page ${page_number}:`, error);
        
        // Update with error status
        await supabase
          .from('story_illustrations')
          .upsert({
            story_id,
            child_id,
            page_number,
            generation_status: 'error',
            image_url: '',
            prompt_used: fullPrompt || ''
          });

        results.push({
          page_number,
          status: 'error',
          error: error.message
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      results,
      total_pages: story_pages.length,
      generated_count: results.filter(r => r.status === 'generated').length,
      cached_count: results.filter(r => r.status === 'cached').length,
      error_count: results.filter(r => r.status === 'error').length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-illustrated-story:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});