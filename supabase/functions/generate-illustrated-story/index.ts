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
    console.log('=== STORY ILLUSTRATION GENERATION START ===');
    
    const { story_id, child_id } = await req.json();

    console.log('Request data:', { story_id, child_id });

    // Validate required fields
    if (!story_id || !child_id) {
      console.error('Missing required fields:', { story_id, child_id });
      return new Response(JSON.stringify({
        error: 'Missing required fields: story_id or child_id'
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

    console.log('=== STEP 1: Fetch child and story data ===');

    // Get child data (including avatar)
    const { data: childData, error: childError } = await supabase
      .from('children')
      .select('name, age, avatar_url')
      .eq('id', child_id)
      .single();

    if (childError || !childData) {
      console.error('Failed to fetch child data:', childError);
      return new Response(JSON.stringify({
        error: 'Child not found or error fetching child data'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Child data:', childData);

    // Validate avatar exists
    if (!childData.avatar_url) {
      console.error('Child avatar not found');
      return new Response(JSON.stringify({
        error: 'Child avatar not found. Please upload and cartoonify an avatar first.'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get story data
    const { data: storyData, error: storyError } = await supabase
      .from('stories')
      .select('title, content')
      .eq('id', story_id)
      .single();

    if (storyError || !storyData) {
      console.error('Failed to fetch story data:', storyError);
      return new Response(JSON.stringify({
        error: 'Story not found or error fetching story data'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Story data:', { title: storyData.title, content_length: storyData.content?.length });

    // Parse story content into ~35 pages
    const storyContent = storyData.content || '';
    const sentences = storyContent.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const pagesPerSentence = Math.ceil(sentences.length / 35);
    const storyPages: Array<{ page_number: number; text_content: string }> = [];
    
    for (let i = 0; i < Math.min(35, sentences.length); i += pagesPerSentence) {
      const pageText = sentences.slice(i, i + pagesPerSentence).join('. ').trim();
      if (pageText) {
        storyPages.push({
          page_number: storyPages.length + 1,
          text_content: pageText
        });
      }
    }

    // Ensure we have exactly 35 pages (pad if necessary)
    while (storyPages.length < 35 && storyPages.length > 0) {
      const lastPage = storyPages[storyPages.length - 1];
      storyPages.push({
        page_number: storyPages.length + 1,
        text_content: `${lastPage.text_content} The adventure continues...`
      });
    }

    console.log(`Generated ${storyPages.length} story pages`);

    // Check existing pages to avoid regeneration
    const { data: existingPages, error: existingError } = await supabase
      .from('story_pages')
      .select('page_number, image_url, generation_status')
      .eq('story_id', story_id);

    if (existingError) {
      console.error('Database error checking existing pages:', existingError);
      return new Response(JSON.stringify({
        error: 'Database error: ' + existingError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const existingPageNumbers = new Set(existingPages?.map(p => p.page_number) || []);
    const results: any[] = [];

    console.log(`Found ${existingPages?.length || 0} existing pages`);

    // Process each page
    for (const page of storyPages) {
      console.log(`\n=== PROCESSING PAGE ${page.page_number} ===`);

      // Skip if already generated successfully
      if (existingPageNumbers.has(page.page_number)) {
        const existingPage = existingPages?.find(p => p.page_number === page.page_number);
        if (existingPage?.generation_status === 'success' && existingPage.image_url) {
          console.log(`Page ${page.page_number}: Using cached image`);
          results.push({
            page_number: page.page_number,
            status: 'cached',
            image_url: existingPage.image_url
          });
          continue;
        }
      }

      try {
        console.log(`Page ${page.page_number}: Starting generation process`);
        
        // Insert or update story page record
        const { error: upsertError } = await supabase
          .from('story_pages')
          .upsert({
            story_id,
            page_number: page.page_number,
            text_content: page.text_content,
            generation_status: 'generating',
            image_url: null
          });

        if (upsertError) {
          console.error(`Page ${page.page_number}: Database upsert error:`, upsertError);
          throw new Error('Failed to update page status: ' + upsertError.message);
        }

        console.log(`Page ${page.page_number}: ✅ Updated status to 'generating'`);

        // Build DALL-E prompt with avatar character consistency
        const childName = childData.name || 'child';
        const childAge = childData.age || 6;
        const dallePrompt = `A whimsical cartoon-style children's book illustration of ${childName}, a ${childAge}-year-old child, in a scene where: ${page.text_content}. 

Character appearance: The child should look exactly like the cartoon avatar character, with consistent facial features, hair, and clothing style throughout all pages.

Style: Bright, colorful, Pixar-style 2D illustration with professional storybook quality. Vibrant colors, detailed background, friendly and engaging for children. The same artistic style and character design must be maintained across all pages.`;

        console.log(`Page ${page.page_number}: Generated prompt (${dallePrompt.length} chars)`);

        console.log(`Page ${page.page_number}: === STEP 2: Calling OpenAI DALL-E API ===`);

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

        console.log(`Page ${page.page_number}: OpenAI API response status:`, dalleResponse.status);

        if (!dalleResponse.ok) {
          const errorText = await dalleResponse.text();
          console.error(`Page ${page.page_number}: OpenAI API error response:`, errorText);
          
          // Handle quota exceeded errors gracefully
          if (dalleResponse.status === 429 || errorText.includes('billing_hard_limit_reached')) {
            throw new Error('OpenAI API quota exceeded. Please check your billing and try again later.');
          }
          
          throw new Error(`OpenAI API error (${dalleResponse.status}): ${errorText}`);
        }

        const dalleData = await dalleResponse.json();
        console.log(`Page ${page.page_number}: ✅ OpenAI response received`);

        if (!dalleData.data || !dalleData.data[0] || !dalleData.data[0].url) {
          console.error(`Page ${page.page_number}: Invalid OpenAI response:`, dalleData);
          throw new Error('No image URL in OpenAI response');
        }

        const generatedImageUrl = dalleData.data[0].url;
        console.log(`Page ${page.page_number}: Generated image URL received`);

        console.log(`Page ${page.page_number}: === STEP 3: Downloading and uploading image ===`);

        // Download the generated image
        const imageResponse = await fetch(generatedImageUrl);
        
        if (!imageResponse.ok) {
          console.error(`Page ${page.page_number}: Failed to download image:`, imageResponse.status);
          throw new Error(`Failed to download generated image: ${imageResponse.status}`);
        }

        const imageBlob = await imageResponse.blob();
        console.log(`Page ${page.page_number}: ✅ Downloaded image (${imageBlob.size} bytes)`);

        // Upload to Supabase Storage
        const fileName = `story-pages/${child_id}/${story_id}/page_${page.page_number}.png`;
        const { error: uploadError } = await supabase.storage
          .from('StoryVoyagers')
          .upload(fileName, imageBlob, {
            contentType: 'image/png',
            upsert: true
          });

        if (uploadError) {
          console.error(`Page ${page.page_number}: Upload error:`, uploadError);
          throw new Error('Failed to upload image: ' + uploadError.message);
        }

        console.log(`Page ${page.page_number}: ✅ Uploaded to Supabase Storage: ${fileName}`);

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('StoryVoyagers')
          .getPublicUrl(fileName);

        const publicUrl = urlData.publicUrl;
        console.log(`Page ${page.page_number}: Public URL generated`);

        console.log(`Page ${page.page_number}: === STEP 4: Updating database with success ===`);

        // Update with success
        const { error: finalUpdateError } = await supabase
          .from('story_pages')
          .update({
            generation_status: 'success',
            image_url: publicUrl
          })
          .eq('story_id', story_id)
          .eq('page_number', page.page_number);

        if (finalUpdateError) {
          console.error(`Page ${page.page_number}: Final update error:`, finalUpdateError);
          throw new Error('Failed to update success status: ' + finalUpdateError.message);
        }

        results.push({
          page_number: page.page_number,
          status: 'generated',
          image_url: publicUrl
        });

        console.log(`Page ${page.page_number}: ✅ COMPLETED SUCCESSFULLY`);

      } catch (error) {
        console.error(`Page ${page.page_number}: ❌ ERROR:`, error);
        
        // Update with error status
        try {
          await supabase
            .from('story_pages')
            .update({
              generation_status: 'error',
              image_url: null
            })
            .eq('story_id', story_id)
            .eq('page_number', page.page_number);
        } catch (dbError) {
          console.error(`Page ${page.page_number}: Failed to update error status:`, dbError);
        }

        results.push({
          page_number: page.page_number,
          status: 'error',
          error: (error as Error).message
        });
      }
    }

    const response = {
      success: true,
      results,
      total_pages: storyPages.length,
      generated_count: results.filter(r => r.status === 'generated').length,
      cached_count: results.filter(r => r.status === 'cached').length,
      error_count: results.filter(r => r.status === 'error').length,
      child_name: childData.name,
      story_title: storyData.title
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