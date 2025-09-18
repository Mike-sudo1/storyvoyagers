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
      "Up, up, up they flew, leaving Earth behind and soaring through the clouds.",
      "Soon they were floating in space, surrounded by twinkling stars and planets.",
      "The moon grew bigger and bigger as they approached its gray, rocky surface.",
      "They carefully landed their spacecraft on the moon with a gentle thump.",
      "Stepping outside, they felt so light they could bounce like a kangaroo!",
      "The Earth looked like a beautiful blue marble floating in the dark sky.",
      "They planted a colorful flag and collected some moon rocks as souvenirs.",
      "Walking on the moon felt like being in a magical, silent world.",
      "They discovered strange craters and mountains all around them.",
      "Taking pictures to show their friends back home was so exciting!",
      "They met a friendly moon creature who showed them around.",
      "Together they explored mysterious caves filled with sparkling crystals.",
      "The moon creature taught them how to do amazing space somersaults.",
      "They shared space snacks and became the best of friends.",
      "As night fell, the stars seemed even brighter from the moon.",
      "They watched meteors streak across the sky like fireworks.",
      "The moon creature gave them a special moon crystal as a gift.",
      "It was time to say goodbye and return to their rocket ship.",
      "They waved farewell to their new friend and promised to return.",
      "The journey back to Earth was filled with happy memories.",
      "They splashed down safely in the ocean, right on target!",
      "Scientists and friends welcomed them back with cheers and applause.",
      "They showed everyone the amazing moon rocks they had collected.",
      "The moon crystal glowed softly, reminding them of their adventure.",
      "They gave a special presentation about life on the moon.",
      "Everyone was amazed by the photos and stories they shared.",
      "They realized that dreams really can come true with determination.",
      "The brave astronaut became famous for their incredible moon mission.",
      "Children everywhere were inspired to become astronauts too.",
      "And whenever they looked up at the moon, they smiled and waved.",
      "The end of one adventure was just the beginning of many more to come!"
    ]
  },
  "ancient-egypt": {
    title: "Secrets of Ancient Egypt", 
    pages: [
      "Long ago, in the land of ancient Egypt, lived a curious young explorer.",
      "They discovered a magical golden compass that could travel through time.",
      "With a bright flash of light, they were transported to ancient Egypt!",
      "The mighty Nile River flowed through the desert like a ribbon of life.",
      "Tall palm trees swayed in the warm breeze along the riverbank.",
      "In the distance, the great pyramids reached up toward the sky.",
      "Egyptian children played with toys and games by the river's edge.",
      "They wore simple tunics and had beautiful jewelry made of gold.",
      "The young explorer learned to write their name in hieroglyphs.",
      "Each picture symbol told a story or represented a sound.",
      "They met a kind Egyptian scribe who taught them about papyrus.",
      "Made from river reeds, papyrus was like the paper of ancient times.",
      "The pharaoh's palace was filled with colorful paintings and treasures.",
      "Guards with spears and shields protected the royal family.",
      "They learned about mummification and how Egyptians honored their dead.",
      "The process helped preserve people for their journey to the afterlife.",
      "Inside the pyramids were secret chambers and hidden passages.",
      "Beautiful paintings covered the walls, telling stories of the pharaohs.",
      "They discovered that thousands of workers built these amazing monuments.",
      "Ramps and sledges helped move the heavy stone blocks into place.",
      "Egyptian farmers grew wheat and barley in the fertile Nile valley.",
      "When the river flooded each year, it brought rich soil to the fields.",
      "They watched craftsmen make pottery, jewelry, and beautiful furniture.",
      "Egyptian doctors knew how to heal people with herbs and medicine.",
      "The explorer learned about Egyptian gods like Ra, the sun god.",
      "Temples were built to honor the gods and conduct religious ceremonies.",
      "Egyptian cats were considered sacred and were treated like royalty.",
      "They saw how Egyptians used the stars to navigate and tell time.",
      "Markets bustled with traders selling spices, gold, and precious stones.",
      "The explorer helped solve a mystery about a missing pharaoh's treasure.",
      "Using their knowledge of hieroglyphs, they decoded an ancient map.",
      "The treasure was hidden in a secret room beneath the sphinx.",
      "They returned the treasure to the museum where it belonged.",
      "As the sun set over the pyramids, it was time to return home.",
      "With another flash of light, they were back in their own time, with memories of ancient Egypt forever in their heart."
    ]
  },
  "discovery-america": {
    title: "The Discovery of America",
    pages: [
      "In 1492, a brave explorer named Christopher Columbus had a big dream.",
      "He believed he could reach Asia by sailing west across the Atlantic Ocean.",
      "A young adventurer joined his crew, excited for the journey ahead.",
      "They prepared three ships: the Niña, the Pinta, and the Santa María.",
      "The ships were loaded with food, water, and supplies for the long voyage.",
      "Sailors from Spain volunteered to join this dangerous but exciting mission.",
      "On August 3rd, they set sail from Spain into the vast, unknown ocean.",
      "The first few days were filled with excitement and high hopes.",
      "Day after day, they saw nothing but endless blue water in every direction.",
      "Some sailors began to worry - they had never been so far from land.",
      "Columbus used a compass and the stars to guide their way west.",
      "Dolphins swam alongside the ships, bringing joy to the worried crew.",
      "They saw flying fish leap from wave to wave like ocean birds.",
      "Storms tested their courage as giant waves rocked the ships.",
      "The young adventurer helped tie down the sails during rough weather.",
      "After many weeks, some sailors wanted to turn back to Spain.",
      "Columbus convinced them to continue just a few more days.",
      "On October 12th, a sailor shouted 'Land! Land ahead!'",
      "Everyone rushed to see a beautiful island with white sandy beaches.",
      "Palm trees swayed in the tropical breeze as they approached.",
      "They had reached what we now know as the Bahamas in America!",
      "Native Taíno people lived on the island and welcomed the visitors.",
      "The Taíno taught them about new foods like corn, potatoes, and chocolate.",
      "They showed the explorers how to make hammocks for comfortable sleeping.",
      "The island had colorful birds, tropical fruits, and crystal-clear water.",
      "Columbus thought he had reached the Indies, so he called them 'Indians.'",
      "They explored several more islands, each more beautiful than the last.",
      "The young adventurer collected shells, feathers, and tropical seeds.",
      "They met more native people who shared their knowledge and culture.",
      "After months of exploration, it was time to return to Spain.",
      "The journey home was faster with favorable winds filling their sails.",
      "Back in Spain, everyone was amazed by the stories and treasures.",
      "This voyage opened up a whole new world for exploration and discovery.",
      "The young adventurer became a famous explorer in their own right.",
      "And this historic journey changed the course of world history forever."
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
    
    const { template_id, child_id } = await req.json();

    console.log('📝 Request data:', { template_id, child_id });

    if (!template_id || !child_id) {
      console.error('❌ Missing required fields:', { template_id, child_id });
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: template_id and child_id are required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if OpenAI API key is configured
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.error('❌ OpenAI API key not configured');
      return new Response(JSON.stringify({
        success: false,
        error: 'OpenAI API key not configured'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get story template
    const template = storyTemplates[template_id as keyof typeof storyTemplates];
    if (!template) {
      console.error('❌ Story template not found:', template_id);
      return new Response(JSON.stringify({
        success: false,
        error: `Story template '${template_id}' not found`
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Template found:', template.title, `(${template.pages.length} pages)`);

    // Get child details including avatar
    const { data: child, error: childError } = await supabase
      .from('children')
      .select('*')
      .eq('id', child_id)
      .single();

    if (childError || !child) {
      console.error('❌ Child not found:', childError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Child not found'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!child.avatar_url) {
      console.error('❌ Child avatar not found for:', child.name);
      return new Response(JSON.stringify({
        success: false,
        error: 'Child avatar not found. Please upload and cartoonify a profile photo first.'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Child found:', child.name, 'Avatar:', child.avatar_url);

    // Create a new story record
    const { data: newStory, error: storyError } = await supabase
      .from('stories')
      .insert({
        title: `${template.title} with ${child.name}`,
        subject: 'adventure',
        description: `A personalized adventure story featuring ${child.name}`,
        age_min: 5,
        age_max: 10,
        content: template.pages.join(' ')
      })
      .select()
      .single();

    if (storyError || !newStory) {
      console.error('❌ Failed to create story record:', storyError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to create story record'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const story_id = newStory.id;
    console.log('✅ Created story:', story_id, '-', newStory.title);

    // Check if story pages already exist
    const { data: existingPages } = await supabase
      .from('story_pages')
      .select('*')
      .eq('story_id', story_id)
      .order('page_number');

    if (existingPages && existingPages.length > 0) {
      console.log('✅ Story already has', existingPages.length, 'pages generated');
      return new Response(JSON.stringify({
        success: true,
        message: 'Story already generated',
        story_id,
        total_pages: existingPages.length,
        success_count: existingPages.filter(p => p.generation_status === 'success').length
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('🎨 Generating', template.pages.length, 'pages for story...');

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    // Generate illustrations for each page
    for (let i = 0; i < template.pages.length; i++) {
      const pageNumber = i + 1;
      const pageText = template.pages[i];
      
      console.log(`📄 Processing page ${pageNumber}/${template.pages.length}:`, pageText.substring(0, 100) + '...');

      try {
        // Insert page record with generating status
        await supabase
          .from('story_pages')
          .insert({
            story_id,
            page_number: pageNumber,
            text_content: pageText,
            generation_status: 'generating'
          });

        // Create DALL-E prompt combining story text with child avatar description
        const stylePrompt = `Children's book illustration, Pixar-style cartoon featuring ${child.name}, a ${child.age || 6}-year-old child as the main character. Scene: ${pageText} The character should have a consistent appearance throughout the story - same hair, clothes, and facial features as a cartoon avatar. Bright, colorful, whimsical children's book art style with soft shadows and friendly atmosphere. High quality digital illustration, full page scene.`;

        console.log(`🎨 Generating image for page ${pageNumber} with DALL-E...`);

        // Call OpenAI DALL-E API
        const dalleResponse = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: stylePrompt,
            n: 1,
            size: '1024x1024',
            quality: 'standard',
            response_format: 'url'
          }),
        });

        if (!dalleResponse.ok) {
          const errorText = await dalleResponse.text();
          console.error(`❌ DALL-E API error for page ${pageNumber}:`, dalleResponse.status, errorText);
          throw new Error(`DALL-E API error: ${dalleResponse.status}`);
        }

        const dalleResult = await dalleResponse.json();
        const imageUrl = dalleResult.data?.[0]?.url;

        if (!imageUrl) {
          throw new Error('No image URL received from DALL-E');
        }

        console.log(`📸 Image generated for page ${pageNumber}, downloading...`);

        // Download the generated image
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
          throw new Error('Failed to download generated image');
        }

        const imageBlob = await imageResponse.blob();

        // Upload to Supabase Storage
        const fileName = `stories/${story_id}/page_${pageNumber}.png`;
        const { error: uploadError } = await supabase.storage
          .from('StoryVoyagers')
          .upload(fileName, imageBlob, {
            contentType: 'image/png',
            upsert: true
          });

        if (uploadError) {
          console.error(`❌ Upload error for page ${pageNumber}:`, uploadError);
          throw uploadError;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('StoryVoyagers')
          .getPublicUrl(fileName);

        console.log(`✅ Page ${pageNumber} uploaded successfully:`, publicUrl);

        // Update page with success
        await supabase
          .from('story_pages')
          .update({
            image_url: publicUrl,
            generation_status: 'success'
          })
          .eq('story_id', story_id)
          .eq('page_number', pageNumber);

        results.push({
          page_number: pageNumber,
          image_url: publicUrl,
          generation_status: 'success'
        });

        successCount++;

      } catch (pageError) {
        console.error(`❌ Error generating page ${pageNumber}:`, pageError);
        errorCount++;
        
        // Update page with error status
        await supabase
          .from('story_pages')
          .update({
            generation_status: 'error'
          })
          .eq('story_id', story_id)
          .eq('page_number', pageNumber);

        results.push({
          page_number: pageNumber,
          generation_status: 'error',
          error: (pageError as Error).message
        });
      }
    }

    console.log(`📊 Story generation completed: ${successCount} successful, ${errorCount} errors`);

    return new Response(JSON.stringify({
      success: true,
      story_id,
      message: `Story generation completed: ${successCount}/${template.pages.length} pages generated successfully`,
      results,
      total_pages: template.pages.length,
      success_count: successCount,
      error_count: errorCount
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('💥 Error in generate-illustrated-story:', error);
    return new Response(JSON.stringify({
      success: false,
      error: (error as Error).message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});