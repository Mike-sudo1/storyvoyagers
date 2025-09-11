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
      style_prompt = "Pixar-style children's book illustration, colorful, vibrant"
    } = await req.json();

    console.log('Generating illustrations for story:', { story_id, child_id, pages: story_pages.length });

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
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

    // Get child info for character description
    const { data: childData } = await supabase
      .from('children')
      .select('name, age')
      .eq('id', child_id)
      .single();

    const childName = childData?.name || 'the child';
    const childAge = childData?.age || 6;

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

        // Build prompt for OpenAI DALL-E
        const fullPrompt = `A cartoon illustration of ${childName}, a ${childAge}-year-old child, in a scene where: ${page.text}. ${character_prompt}. ${style_prompt}, detailed background, consistent cartoon style throughout the story, high quality children's book illustration.`;

        console.log(`Generating page ${page_number} with OpenAI DALL-E prompt:`, fullPrompt);

        // Generate image with OpenAI DALL-E
        const openaiResponse = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: fullPrompt,
            n: 1,
            size: '1024x1024',
            response_format: 'url',
          }),
        });

        if (!openaiResponse.ok) {
          const errorText = await openaiResponse.text();
          console.error('OpenAI API error:', errorText);
          
          // Handle quota exceeded errors gracefully
          if (openaiResponse.status === 429) {
            throw new Error('OpenAI API quota exceeded. Please try again later.');
          }
          
          throw new Error(`OpenAI API error: ${openaiResponse.status} - ${errorText}`);
        }

        const openaiResult = await openaiResponse.json();
        const generatedImageUrl = openaiResult.data?.[0]?.url;

        if (!generatedImageUrl) {
          throw new Error('No images returned from OpenAI');
        }

        // Download the generated image
        const imageResponse = await fetch(generatedImageUrl);
        
        if (!imageResponse.ok) {
          throw new Error('Failed to download generated image');
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
            prompt_used: fullPrompt || page.text
          });

        results.push({
          page_number,
          status: 'error',
          error: (error as Error).message
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
    console.error('Error in generate-story-illustration-replicate:', error);
    return new Response(JSON.stringify({
      error: (error as Error).message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});