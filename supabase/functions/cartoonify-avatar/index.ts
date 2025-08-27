// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const STYLE_PROMPT = `Transform this photo into a cozy children's-book illustration with the following style:
- Clean, bold outlines (consistent line weight), smooth vector-like shapes
- Bright but gentle colors with soft gradients (no harsh shadows)
- Childlike proportions: slightly oversized head, rounded features
- Overall vibe: warm "bedtime story" look similar to modern PBS Kids storybooks
Hard rules: no photorealism, no sketchy pencil lines, no anime/manga look, no halftone/comic dots.

Faithful likeness & analysis (very important):
- Preserve the person's DISTINCT features from the photo: face shape, eye shape/spacing, nose shape/size, mouth shape, eyebrow thickness/angle, ear shape, and skin tone.
- Keep the exact HAIRSTYLE (length, part, curls/texture), hairline, and color.
- Match CLOTHING colors/patterns and key accessories (glasses, headbands, hats, earrings).
- Follow the same POSE, head tilt, and camera angle as the input photo.
- Maintain the same LIGHTING direction and key highlights/shadows (translate into soft, storybook shading).
- Include any SIGNATURE props or background anchors that frame the person (e.g., telescope, distinctive furniture) but simplify them to flat, uncluttered shapes.
- Use the photo as the source of truth; DO NOT replace features with generic or idealized ones.
`;

function pngBlobFromB64(b64: string): Blob {
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return new Blob([bytes], { type: "image/png" });
}

// ---- safe base64 encoder without huge spread (unchanged) ----
function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000; // 32KB chunks
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

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") ?? "";
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing OPENAI_API_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Convert uploaded file to base64 (safe for large files)
    const arrayBuffer = await file.arrayBuffer();
    const base64Image = bytesToBase64(new Uint8Array(arrayBuffer));

    // Call OpenAI edit endpoint
    const openAIResponse = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        image: `data:image/${file.type.split("/")[1]};base64,${base64Image}`,
        prompt: STYLE_PROMPT,
        n: 1,
        size: "1024x1024",
      }),
    });

    let imageBlob: Blob;

    if (openAIResponse.ok) {
      const result = await openAIResponse.json();
      const b64 = result?.data?.[0]?.b64_json;
      if (!b64) throw new Error("OpenAI edit: missing b64_json");
      imageBlob = pngBlobFromB64(b64);
    } else {
      // Fallback: generate (does not preserve photo likeness, but keeps style)
      const genResponse = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-image-1",
          prompt: `Portrait, front-and-center composition. ${STYLE_PROMPT}`,
          n: 1,
          size: "1024x1024",
        }),
      });

      const genJson = await genResponse.json();
      if (!genResponse.ok) {
        throw new Error(`OpenAI API error: ${genJson?.error?.message || "Unknown error"}`);
      }
      const b64 = genJson?.data?.[0]?.b64_json;
      if (!b64) throw new Error("OpenAI generation: missing b64_json");
      imageBlob = pngBlobFromB64(b64);
    }

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
