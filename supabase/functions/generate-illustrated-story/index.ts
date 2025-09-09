import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Function started successfully');
    
    const requestBody = await req.json();
    const { story_id, child_id, story_pages } = requestBody;
    
    console.log('Received request for story:', story_id, 'child:', child_id);
    
    if (!story_pages || story_pages.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No pages to process',
        results: [],
        total_pages: 0,
        generated_count: 0,
        cached_count: 0,
        error_count: 0
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIKey) {
      console.error('OpenAI API key not found');
      return new Response(JSON.stringify({
        error: 'OpenAI API key not configured'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log('OpenAI key found, testing API...');
    
    // Test OpenAI API with simple request
    const testResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-2',
        prompt: 'a simple cartoon cat',
        n: 1,
        size: '256x256'
      }),
    });
    
    console.log('OpenAI API response status:', testResponse.status);
    
    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      console.error('OpenAI API error:', errorText);
      return new Response(JSON.stringify({
        error: `OpenAI API test failed: ${testResponse.status}`
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // If we get here, OpenAI API is working
    return new Response(JSON.stringify({
      success: true,
      message: 'OpenAI API test successful',
      results: [],
      total_pages: story_pages.length,
      generated_count: 0,
      cached_count: 0,
      error_count: 0
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in function:', error);
    return new Response(JSON.stringify({
      error: `Function error: ${error.message}`
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});