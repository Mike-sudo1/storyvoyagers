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
    console.log('=== STEP 1: Request validation and setup ===');
    
    const {
      story_id,
      child_id,
      story_pages,
      child_avatar_url,
      character_prompt,
      style_prompt = "colorful cartoon illustration, Pixar-style, storybook art, child-friendly"
    } = await req.json();

    console.log('Request data:', {
      story_id,
      child_id,
      pages_count: story_pages?.length,
      has_avatar: !!child_avatar_url,
      character_prompt
    });

    // Validate required fields
    if (!story_id || !child_id || !story_pages || !Array.isArray(story_pages)) {
      console.error('Missing required fields:', { story_id, child_id, story_pages: !!story_pages });
      return new Response(JSON.stringify({
        error: 'Missing required fields: story_id, child_id, or story_pages'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      return new Response(JSON.stringify({
        error: 'OpenAI API key not configured'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`✅ Setup complete. Processing ${story_pages.length} pages for story ${story_id}`);

    // Check existing illustrations to avoid regeneration
    const { data: existing, error: dbError } = await supabase
      .from('story_illustrations')
      .select('page_number, image_url, generation_status')
      .eq('story_id', story_id)
      .eq('child_id', child_id);

    if (dbError) {
      console.error('Database error checking existing illustrations:', dbError);
      return new Response(JSON.stringify({
        error: 'Database error: ' + dbError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const existingPages = new Set(existing?.map(img => img.page_number) || []);
    const results: any[] = [];

    console.log(`Found ${existing?.length || 0} existing illustrations`);

    // Process each page
    for (let i = 0; i < story_pages.length; i++) {
      const page = story_pages[i];
      const page_number = page.page_number || i + 1;

      console.log(`\n=== PROCESSING PAGE ${page_number} ===`);

      // Skip if already generated successfully
      if (existingPages.has(page_number)) {
        const existingPage = existing?.find(p => p.page_number === page_number);
        if (existingPage?.generation_status === 'success') {
          console.log(`Page ${page_number}: Using cached image`);
          results.push({
            page_number,
            status: 'cached',
            image_url: existingPage.image_url
          });
          continue;
        }
      }

      try {
        console.log(`Page ${page_number}: Starting generation process`);
        
        // Update status to generating
        const { error: updateError } = await supabase
          .from('story_illustrations')
          .upsert({
            story_id,
            child_id,
            page_number,
            generation_status: 'generating',
            image_url: '',
            prompt_used: ''
          });

        if (updateError) {
          console.error(`Page ${page_number}: Database update error:`, updateError);
          throw new Error('Failed to update generation status: ' + updateError.message);
        }

        console.log(`Page ${page_number}: ✅ Updated status to 'generating'`);

        // Extract child info for prompt
        const childAge = character_prompt.match(/(\d+)-year-old/)?.[1] || '6';
        const childName = character_prompt.split(',')[0] || 'child';

        // Build DALL-E prompt
        const dallePrompt = `A cartoon illustration of ${childName}, a ${childAge}-year-old child, in a scene where: ${page.text}. ${style_prompt}. Consistent character appearance, vibrant colors, detailed background, professional children's book illustration.`;

        console.log(`Page ${page_number}: Generated prompt:`, dallePrompt);

        console.log(`Page ${page_number}: === STEP 2: Calling OpenAI DALL-E API ===`);

        // Generate image with OpenAI DALL-E
        const dalleResponse = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: dallePrompt,
            n: 1,
            size: '1024x1024',
            quality: 'standard',
            response_format: 'url'
          }),
        });

        console.log(`Page ${page_number}: OpenAI API response status:`, dalleResponse.status);

        if (!dalleResponse.ok) {
          const errorText = await dalleResponse.text();
          console.error(`Page ${page_number}: OpenAI API error response:`, errorText);
          throw new Error(`OpenAI API error (${dalleResponse.status}): ${errorText}`);
        }

        const dalleData = await dalleResponse.json();
        console.log(`Page ${page_number}: ✅ OpenAI response received:`, {
          has_data: !!dalleData,
          has_images: !!dalleData.data,
          image_count: dalleData.data?.length
        });

        if (!dalleData.data || !dalleData.data[0] || !dalleData.data[0].url) {
          console.error(`Page ${page_number}: Invalid OpenAI response:`, dalleData);
          throw new Error('No image URL in OpenAI response');
        }

        const generatedImageUrl = dalleData.data[0].url;
        console.log(`Page ${page_number}: Generated image URL:`, generatedImageUrl);

        console.log(`Page ${page_number}: === STEP 3: Downloading and uploading image ===`);

        // Download the generated image
        const imageResponse = await fetch(generatedImageUrl);
        
        if (!imageResponse.ok) {
          console.error(`Page ${page_number}: Failed to download image:`, imageResponse.status);
          throw new Error(`Failed to download generated image: ${imageResponse.status}`);
        }

        const imageBlob = await imageResponse.blob();
        console.log(`Page ${page_number}: ✅ Downloaded image (${imageBlob.size} bytes)`);

        // Upload to Supabase Storage
        const fileName = `illustrations/${child_id}/${story_id}/page_${page_number}.png`;
        const { error: uploadError } = await supabase.storage
          .from('StoryVoyagers')
          .upload(fileName, imageBlob, {
            contentType: 'image/png',
            upsert: true
          });

        if (uploadError) {
          console.error(`Page ${page_number}: Upload error:`, uploadError);
          throw new Error('Failed to upload image: ' + uploadError.message);
        }

        console.log(`Page ${page_number}: ✅ Uploaded to Supabase Storage: ${fileName}`);

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('StoryVoyagers')
          .getPublicUrl(fileName);

        const publicUrl = urlData.publicUrl;
        console.log(`Page ${page_number}: Public URL:`, publicUrl);

        console.log(`Page ${page_number}: === STEP 4: Updating database with success ===`);

        // Update with success
        const { error: finalUpdateError } = await supabase
          .from('story_illustrations')
          .upsert({
            story_id,
            child_id,
            page_number,
            generation_status: 'success',
            image_url: publicUrl,
            prompt_used: dallePrompt
          });

        if (finalUpdateError) {
          console.error(`Page ${page_number}: Final update error:`, finalUpdateError);
          throw new Error('Failed to update success status: ' + finalUpdateError.message);
        }

        results.push({
          page_number,
          status: 'generated',
          image_url: publicUrl
        });

        console.log(`Page ${page_number}: ✅ COMPLETED SUCCESSFULLY`);

      } catch (error) {
        console.error(`Page ${page_number}: ❌ ERROR:`, error);
        
        // Update with error status
        try {
          await supabase
            .from('story_illustrations')
            .upsert({
              story_id,
              child_id,
              page_number,
              generation_status: 'error',
              image_url: '',
              prompt_used: dallePrompt || page.text
            });
        } catch (dbError) {
          console.error(`Page ${page_number}: Failed to update error status:`, dbError);
        }

        results.push({
          page_number,
          status: 'error',
          error: (error as Error).message
        });
      }
    }

    const response = {
      success: true,
      results,
      total_pages: story_pages.length,
      generated_count: results.filter(r => r.status === 'generated').length,
      cached_count: results.filter(r => r.status === 'cached').length,
      error_count: results.filter(r => r.status === 'error').length
    };

    console.log('\n=== FINAL SUMMARY ===');
    console.log('Generation complete:', response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ CRITICAL ERROR in generate-illustrated-story:', error);
    return new Response(JSON.stringify({
      error: (error as Error).message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});