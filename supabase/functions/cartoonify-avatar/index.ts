// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Replicate from "https://esm.sh/replicate@0.25.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const CARTOON_PROMPT = `Transform this photo into a vibrant cartoon character portrait. 
Create a Pixar-style 2D illustration with:
- Clean, smooth cartoon features
- Bright, cheerful colors
- Simplified facial features while maintaining recognizable characteristics
- Consistent cartoon styling
- Child-friendly appearance
- Symmetrical face positioning
- Clear, well-defined outlines
- Professional animation quality
The result should look like a character from a modern animated movie, suitable for children's storybooks.`;

function pngBlobFromB64(b64: string): Blob {
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return new Blob([bytes], { type: "image/png" });
}

// safe base64 encoder in chunks (prevents call stack overflow on large files)
function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000; // 32KB
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Auth
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    const user = userData?.user;

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Inputs
    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    const childId = (formData.get("childId") as string | null)?.trim();

    if (!file || !childId) {
      return new Response(JSON.stringify({ error: "Image file and childId are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const replicateApiToken = Deno.env.get("REPLICATE_API_TOKEN") ?? "";
    if (!replicateApiToken) {
      return new Response(JSON.stringify({ error: "Missing REPLICATE_API_TOKEN" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const replicate = new Replicate({ auth: replicateApiToken });

    // Convert uploaded file to base64 (safe for large files)
    const arrayBuffer = await file.arrayBuffer();
    const base64Image = bytesToBase64(new Uint8Array(arrayBuffer));

    console.log('Processing image for child:', childId);
    console.log('Calling Replicate API for image transformation...');

    // Use Replicate's cartoon transformation model
    const output = await replicate.run(
      "tencentarc/photomaker:ddfc2b08d209f9fa8c1eca692712918bd449f695dabb4a958da31802a9570fe4",
      {
        input: {
          image: `data:image/jpeg;base64,${base64Image}`,
          prompt: CARTOON_PROMPT,
          negative_prompt: "blurry, low quality, distorted, ugly, bad anatomy, extra limbs, watermark, signature",
          num_steps: 25,
          style_strength_ratio: 20,
          guidance_scale: 5,
          seed: Math.floor(Math.random() * 1000000),
        }
      }
    );

    if (!output || !output[0]) {
      throw new Error('No image returned from Replicate');
    }

    // Download the generated image
    const cartoonImageUrl = output[0];
    const imageResponse = await fetch(cartoonImageUrl);
    
    if (!imageResponse.ok) {
      throw new Error('Failed to download generated image');
    }

    const imageBlob = await imageResponse.blob();

    // Upload to Supabase
    const fileName = `${user.id}/${childId}_avatar_${Date.now()}.png`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, imageBlob, { contentType: "image/png", upsert: true });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = await supabase.storage.from("avatars").getPublicUrl(fileName);
    const avatarUrl = publicUrlData.publicUrl;

    // Update child profile
    const { error: updateError } = await supabase
      .from("children")
      .update({ avatar_url: avatarUrl })
      .eq("id", childId)
      .eq("user_id", user.id);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({
        success: true,
        avatarUrl,
        message: "Photo cartoonified successfully!",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error?.message || "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});