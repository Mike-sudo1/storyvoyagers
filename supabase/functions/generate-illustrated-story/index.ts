import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const storyTemplates = {
  "moon-landing": {
    title: "The Great Moon Adventure",
    pages: [
      "Once upon a time, there was a brave young astronaut who dreamed of visiting the moon.",
      "They put on their special space suit with a shiny helmet and colorful patches.",
      "The rocket ship stood tall on the launch pad, ready for the amazing journey ahead.",
      "With a loud roar and bright flames, the rocket blasted off into the sky!",
      "Up, up, up they flew, leaving Earth behind and soaring through the clouds."
    ]
  },
  "ancient-egypt": {
    title: "Adventure in Ancient Egypt",
    pages: [
      "Kid opens a dusty book and—whoosh!—a warm breeze smells like river plants and sunshine. \"Welcome to Kemet, the land of the Black Soil,\" says Hori, a cheerful young scribe. \"I'm Hori! Come explore Ancient Egypt with me!\"",
      "They stand by the long Nile River, the life of Egypt. \"The river gives water, food, and travel,\" Hori says. \"It flows from south to north!\" Kid cups water in their hands and smiles.",
      "They ride a small boat. Fishermen cast nets, an ibis stalks the shore, and a crocodile sunbathes far away. \"People eat bread and fish,\" Hori whispers. \"The river feeds us.\"",
      "\"I'm learning to be a scribe,\" Hori says proudly. He shows a reed pen and a smooth sheet of papyrus. \"We write with pictures called hieroglyphs.\"",
      "Hori paints symbols that sound like \"Kid.\" Kid tries too, tongue sticking out in concentration. \"You wrote your name the Egyptian way!\""
    ]
  },
  "discovery-america": {
    title: "The Discovery of America", 
    pages: [
      "In 1492, a brave explorer had a big dream to reach new lands by sailing west.",
      "They prepared three ships and gathered a courageous crew for the journey.",
      "After many days at sea, they spotted land on the horizon.",
      "They met native people who showed them amazing new foods and customs.",
      "This historic voyage opened up a whole new world for exploration."
    ]
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 === STORY GENERATION START ===');
    
    const { template_id, child_id, story_id } = await req.json();
    console.log('📝 Request data:', { template_id, child_id, story_id });

    // Validate required fields
    if (!child_id || (!template_id && !story_id)) {
      console.error('❌ Missing required fields:', { template_id, child_id, story_id });
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing child_id and either template_id or story_id' 
        }), 
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 400 
        }
      );
    }

    let template: any = null;

    if (story_id) {
      console.log('🔍 Using existing story by ID...');
      const { data: storyRec, error: storyFetchError } = await supabase
        .from('stories')
        .select('*')
        .eq('id', story_id)
        .single();

      if (storyFetchError || !storyRec) {
        console.error('❌ Story not found:', storyFetchError);
        return new Response(
          JSON.stringify({ success: false, error: 'Story not found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        );
      }

      template = storyRec;
      console.log('✅ Using story:', template.title, template.id);
    } else {
      console.log('🔍 Looking for template in database...');
      
      // Try to find template in database first
      const { data: dbTemplate, error: dbError } = await supabase
        .from('stories')
        .select('*')
        .eq('id', template_id)
        .eq('is_template', true)
        .single();

      if (dbTemplate) {
        console.log('✅ Found template in database:', dbTemplate.title);
        template = dbTemplate;
      } else {
        console.log('🔍 Template not found in DB, checking hardcoded templates...');
        
        // Fallback to hardcoded templates
        const hardcodedTemplate = storyTemplates[template_id];
        if (hardcodedTemplate) {
          console.log('✅ Found hardcoded template:', hardcodedTemplate.title);
          
          // Create story record from hardcoded template
          const { data: newStory, error: storyError } = await supabase
            .from('stories')
            .insert({
              title: hardcodedTemplate.title,
              subject: 'adventure',
              description: `An exciting adventure story featuring the child as the main character.`,
              content: hardcodedTemplate.pages.join('\n\n'),
              is_template: false,
              age_min: 5,
              age_max: 10
            })
            .select()
            .single();

          if (storyError) {
            console.error('❌ Failed to create story:', storyError);
            throw storyError;
          }

          template = newStory;
        } else {
          console.error('❌ Template not found:', template_id);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: `Template ${template_id} not found` 
            }), 
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
              status: 404 
            }
          );
        }
      }
    }

    console.log('👦 Fetching child data...');
    
    // Get child data
    const { data: child, error: childError } = await supabase
      .from('children')
      .select('*')
      .eq('id', child_id)
      .single();

    if (childError || !child) {
      console.error('❌ Child not found:', childError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Child not found' 
        }), 
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 404 
        }
      );
    }

    console.log('✅ Child found:', child.name);

    // Generate story pages from template
    let storyContent = '';
    let illustrations = [];

    if (template.template_content && typeof template.template_content === 'object') {
      // Use structured template data
      storyContent = template.template_content.content || template.content || '';
      illustrations = template.template_content.illustrations || [];
    } else {
      // Use content and create basic illustrations
      storyContent = template.content || '';
      // Create 5 basic illustration prompts
      illustrations = [
        { page: 1, description: `${child.name} begins an exciting adventure`, placeholder_avatar: true },
        { page: 2, description: `${child.name} discovers something amazing`, placeholder_avatar: true },
        { page: 3, description: `${child.name} faces a challenge`, placeholder_avatar: true },
        { page: 4, description: `${child.name} overcomes the obstacle`, placeholder_avatar: true },
        { page: 5, description: `${child.name} completes their journey successfully`, placeholder_avatar: true }
      ];
    }

    // Personalize content by replacing placeholders
    const personalizedContent = storyContent
      .replace(/\[CHILD_NAME\]/g, child.name)
      .replace(/\[CHILD_AGE\]/g, child.age?.toString() || '7')
      .replace(/Kid/g, child.name)
      .replace(/they/g, child.name)
      .replace(/They/g, child.name);

    console.log('📚 Creating story pages...');

    // Split content into pages (by paragraphs or use fixed chunks)
    const contentParagraphs = personalizedContent.split('\n\n').filter(p => p.trim());
    const pagesPerParagraph = Math.max(1, Math.ceil(contentParagraphs.length / 5));
    
    let storyPages: any[] = [];
    for (let i = 0; i < Math.min(5, contentParagraphs.length); i++) {
      const pageText = contentParagraphs.slice(i * pagesPerParagraph, (i + 1) * pagesPerParagraph).join('\n\n');
      
      if (pageText.trim()) {
        storyPages.push({
          page_number: i + 1,
          text_content: pageText.trim(),
          story_id: template.id
        });
      }
    }

    // If no pages from content splitting, use hardcoded template pages
    if (storyPages.length === 0 && storyTemplates[template_id]) {
      const hardcodedTemplate = storyTemplates[template_id];
      for (let i = 0; i < hardcodedTemplate.pages.length; i++) {
        const pageText = hardcodedTemplate.pages[i]
          .replace(/Kid/g, child.name)
          .replace(/they/g, child.name)
          .replace(/They/g, child.name);
        
        storyPages.push({
          page_number: i + 1,
          text_content: pageText,
          story_id: template.id
        });
      }
    }

    // If this is an existing story, prefer reusing pages if present
    if (typeof story_id === 'string' && story_id) {
      const { data: existingPages, error: existingErr } = await supabase
        .from('story_pages')
        .select('*')
        .eq('story_id', template.id)
        .order('page_number', { ascending: true });

      if (existingErr) {
        console.error('⚠️ Failed to check existing pages:', existingErr);
      } else if (existingPages && existingPages.length > 0) {
        console.log(`ℹ️ Found ${existingPages.length} existing pages, skipping insertion`);
        storyPages = existingPages;
      }
    }

    // Insert story pages into database (only if none existed)
    if (storyPages.length === 0 || !(typeof story_id === 'string' && story_id)) {
      const { data: insertedPages, error: pagesError } = await supabase
        .from('story_pages')
        .insert(storyPages)
        .select();

      if (pagesError) {
        console.error('❌ Failed to insert story pages:', pagesError);
        throw pagesError;
      }

      console.log(`✅ Created ${insertedPages?.length || storyPages.length} story pages`);
    } else {
      console.log('✅ Using existing story pages');
    }

    // Generate illustrations for each page
    console.log('🎨 Starting image generation...');
    
    for (let i = 0; i < Math.min(illustrations.length, storyPages.length); i++) {
      const illustration = illustrations[i];
      const page = storyPages[i];
      
      try {
        console.log(`🎨 Generating image for page ${page.page_number}...`);
        
        // Create illustration prompt
        let prompt = illustration.description
          .replace(/\[CHILD_NAME\]/g, child.name)
          .replace(/\[CHILD_AGE\]/g, child.age?.toString() || '7');
        
        // Add style and quality descriptors
        prompt = `${prompt}, children's book illustration style, colorful, friendly, cartoon style, high quality digital art`;

        console.log(`📝 Prompt for page ${page.page_number}: ${prompt}`);

        // Generate image with OpenAI
        const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: prompt,
            n: 1,
            size: '1024x1024',
            quality: 'standard'
          }),
        });

        if (!imageResponse.ok) {
          const errorText = await imageResponse.text();
          console.error(`❌ OpenAI API error for page ${page.page_number}:`, errorText);
          continue;
        }

        const imageData = await imageResponse.json();
        const imageUrl = imageData.data[0].url;

        console.log(`✅ Generated image for page ${page.page_number}: ${imageUrl}`);

        // Update story page with image URL
        const { error: updateError } = await supabase
          .from('story_pages')
          .update({ 
            image_url: imageUrl,
            generation_status: 'completed'
          })
          .eq('story_id', template.id)
          .eq('page_number', page.page_number);

        if (updateError) {
          console.error(`❌ Failed to update page ${page.page_number}:`, updateError);
        } else {
          console.log(`✅ Updated page ${page.page_number} with image URL`);
        }

      } catch (error) {
        console.error(`❌ Error generating image for page ${page.page_number}:`, error);
      }
    }

    console.log('🎉 Story generation completed successfully!');

    return new Response(
      JSON.stringify({ 
        success: true, 
        story_id: template.id,
        pages_generated: storyPages.length
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 200 
      }
    );

  } catch (error) {
    console.error('💥 Fatal error in story generation:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error occurred' 
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
});