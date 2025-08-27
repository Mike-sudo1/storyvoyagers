// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// --- CORS ---
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// --- Locked Cartoon Style ---
const STYLE_PROMPT = `
Transform this photo into a cozy children's-book illustration with the following style:
- Clean, bold outlines (consistent line weight), smooth vector-like shapes
- Bright but gentle colors with soft gradients (no harsh shadows)
- Childlike proportions: slightly oversized head, rounded features
- Face: big round eyes, small curved nose, soft smile, subtle cheek blush; preserve likeness
- Clothing simplified and readable; avoid tiny details
- Background simple and whimsical (flat shapes, soft clouds, tiny stars when night), uncluttered
- Overall vibe: warm "bedtime story" look similar to modern PBS Kids storybooks
Hard rules: no photorealism, no sketchy pencil lines, no anime/manga look, no halftone/comic dots.
`;

// Optional: night palette (uncomment to bias moon/telescope pages)
/*
const PALETTE_HINT = `
Palette: deep teals and midnight blues for backgrounds; warm moon-yellow accents; gentle cyan highlights.
Lighting: soft moonlight rim light on the face; avoid harsh contrast.
`;
*/

function pngBlobFromB64(b64: string): Blob {
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return new Blob([bytes], { type: "image/png" });
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

    // Supabase client (service role for storage + row updates)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Auth: read bearer and resolve user
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

    // Inputs: multipart form with `image` and `childId`
    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    const childId = (formData.get("childId") as string | null)?.trim();

    if (!file || !childId) {
      return new Response(JSON.stringify({ error: "Image file and childId are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Prepare OpenAI call
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") ?? "";
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing OPENAI_API_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Try EDIT first (turn the photo into the style)
    const editForm = new FormData();
    editForm.append("model", "gpt-image-1");
    editForm.append("prompt", STYLE_PROMPT /* + PALETTE_HINT */);
    editForm.append("n", "1");
    editForm.append("size", "1024x1024");
    // @ts-ignore: Deno FormData supports Blob
    editForm.append("image", new Blob([await file.arrayBuffer()], { type: file.type }), "source.jpg");

    const editResp = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: editForm,
    });

    let imageBlob: Blob | null = null;

    if (editResp.ok) {
      const editJson = await editResp.json();
      const b64 = editJson?.data?.[0]?.b64_json;
      if (!b64) {
        throw new Error("OpenAI edit: missing image data");
      }
      imageBlob = pngBlobFromB64(b64);
    } else {
      // Fallback: GENERATION (still same style; won’t use the input photo directly)
      const genForm = new FormData();
      genForm.append("model", "gpt-image-1");
      genForm.append("prompt", `Portrait, front-and-center composition. ${STYLE_PROMPT}` /* + PALETTE_HINT */);
      genForm.append("n", "1");
      genForm.append("size", "1024x1024");

      const genResp = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
        body: genForm,
      });

      const genJson = await genResp.json();
      if (!genResp.ok) {
        const msg = genJson?.error?.message || "Unknown error";
        throw new Error(`OpenAI API error: ${msg}`);
      }
      const b64 = genJson?.data?.[0]?.b64_json;
      if (!b64) {
        throw new Error("OpenAI generation: missing image data");
      }
      imageBlob = pngBlobFromB64(b64);
    }

    // Upload to Supabase Storage
    const fileName = `${user.id}/${childId}_avatar_${Date.now()}.png`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, imageBlob!, { contentType: "image/png", upsert: true });

    if (uploadError) {
      throw uploadError;
    }

    // Public URL
    const { data: publicUrlData } = await supabase.storage.from("avatars").getPublicUrl(fileName);
    const avatarUrl = publicUrlData.publicUrl;

    // Update child profile
    const { error: updateError } = await supabase
      .from("children")
      .update({ avatar_url: avatarUrl })
      .eq("id", childId)
      .eq("user_id", user.id);

    if (updateError) {
      throw updateError;
    }

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
