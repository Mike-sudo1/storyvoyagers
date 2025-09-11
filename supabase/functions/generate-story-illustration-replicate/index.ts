import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Replicate from "https://esm.sh/replicate@0.25.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerationRequest {
  prompt: string;
  negative_prompt?: string;
  width?: number;
  height?: number;
  style?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, negative_prompt, width = 1024, height = 1024, style = 'cartoon' }: GenerationRequest = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const replicateApiToken = Deno.env.get('REPLICATE_API_TOKEN');
    if (!replicateApiToken) {
      throw new Error('Replicate API token not configured');
    }

    console.log('Generating illustration with Replicate...');
    console.log('Prompt:', prompt);

    const replicate = new Replicate({ auth: replicateApiToken });

    // Use SDXL model for high-quality story illustrations
    const output = await replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      {
        input: {
          prompt: prompt,
          negative_prompt: negative_prompt || "blurry, low quality, distorted, ugly, bad anatomy, extra limbs, watermark, signature, text, letters",
          width: width,
          height: height,
          num_outputs: 1,
          scheduler: "DPMSolverMultistep",
          num_inference_steps: 25,
          guidance_scale: 7.5,
          seed: Math.floor(Math.random() * 1000000),
        }
      }
    );

    if (!output || !output[0]) {
      throw new Error('No images returned from Replicate');
    }

    const imageUrl = output[0];
    console.log('Successfully generated illustration:', imageUrl);

    return new Response(JSON.stringify({ 
      success: true, 
      imageUrl: imageUrl 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-story-illustration-replicate:', error);
    return new Response(JSON.stringify({
      error: (error as Error).message || 'Failed to generate illustration'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});