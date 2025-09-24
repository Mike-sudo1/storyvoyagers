import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerationRequest {
  prompt: string;
  childFeatures: {
    name: string;
    age: number;
    skinTone: string;
    hairColor: string;
    hairStyle: string;
    eyeColor: string;
    faceShape: string;
  };
  avatarUrl?: string;
  style?: string;
  size?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const { prompt, childFeatures, avatarUrl, style = 'cartoon', size = '1024x768' }: GenerationRequest = await req.json();

    if (!prompt || !childFeatures) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: prompt and childFeatures' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create personalized prompt with child's features and avatar reference
    const childDescription = `${childFeatures.name} (age ${childFeatures.age}) with ${childFeatures.skinTone} skin, ${childFeatures.hairColor} ${childFeatures.hairStyle} hair, ${childFeatures.eyeColor} eyes, and ${childFeatures.faceShape} face shape`;
    
    const personalizedPrompt = `${prompt.trim()}

The character of the child in this image should be fully illustrated based on the child's appearance: ${childDescription}. ${avatarUrl ? `Use the child's facial features from this reference image as the basis for the main character in the scene: ${avatarUrl}. ` : ''}The child should be naturally integrated into the scene's character art using ${style} storybook illustration style. Do not use a floating avatar or placeholder circle - create a complete, unified illustration with the child embedded as the main character. High quality, child-friendly artwork.`.trim();

    console.log('Generating illustration with prompt:', personalizedPrompt);

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: personalizedPrompt,
        n: 1,
        size: size,
        quality: 'high',
        output_format: 'png'
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${response.status} ${error}`);
    }

    const data = await response.json();
    
    if (!data.data || !data.data[0]) {
      throw new Error('No image data received from OpenAI');
    }

    // Since gpt-image-1 returns base64, we get the image data directly
    const imageData = data.data[0];

    return new Response(JSON.stringify({ 
      imageUrl: imageData.b64_json ? `data:image/png;base64,${imageData.b64_json}` : imageData.url,
      prompt: personalizedPrompt 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-story-illustration function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});