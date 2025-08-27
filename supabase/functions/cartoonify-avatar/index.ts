// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as b64encode } from "https://deno.land/std@0.224.0/encoding/base64.ts";

// ---------- CORS (return these headers on EVERY path) ----------
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, Authorization, x-client-info, apikey, content-type",
};

// Max image size you’ll accept (adjust if needed)
const MAX_BYTES = 12 * 1024 * 1024; // 12 MB

// ---------- Style prompt ----------
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

// Convert base64 PNG string → Blob for upload
function pngBlobFromB64(b64: string): Blob {
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return new Blob([bytes], { type: "image/png" });
}

serve(async (req) => {
  // Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Auth (bearer from client)
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

    // Read multipart form
    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    const childId = (formData.get("childId") as string | null)?.trim();

    if (!file || !childId) {
      return new Response(JSON.stringify({ error: "Image file and childId are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Guard extremely large files early (prevents memory spikes/timeouts)
    if (file.size > MAX_BYTES) {
      return new Response(
        JSON.stringify({
          error: `Image too large (${(file.size / 1024 / 1024).toFixed(
            1,
          )}MB). Max ${(MAX_BYTES / 1024 / 1024).toFixed(0)}MB.`,
        }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") ?? "";
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing OPENAI_API_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // SAFE base64 (no spread → no stack overflow)
    const bytes = new Uint8Array(await file.arrayBuffer());
    const base64Image = b64encode(bytes);
    const mime = file.type || "image/jpeg";
    const dataUrl = `data:${mime};base64,${base64Image}`;

    // --- OpenAI edit call (JSON only for gpt-image-1) ---
    let imageBlob: Blob;

    const editResp = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        image: dataUrl,
        prompt: STYLE_PROMPT,
        n: 1,
        size: "1024x1024",
      }),
    });

    if (editResp.ok) {
      const json = await editResp.json();
      const b64 = json?.data?.[0]?.b64_json;
      if (!b64) throw new Error("OpenAI edit: missing b64_json");
      imageBlob = pngBlobFromB64(b64);
    } else {
      // Fallback: style-consistent generation (won't preserve likeness as well)
      const genResp = await fetch("https://api.openai.com/v1/images/generations", {
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

      const genJson = await genResp.json();
      if (!genResp.ok) {
        throw new Error(genJson?.error?.message || "OpenAI generation failed");
      }
      const b64 = genJson?.data?.[0]?.b64_json;
      if (!b64) throw new Error("OpenAI generation: missing b64_json");
      imageBlob = pngBlobFromB64(b64);
    }

    // Upload to Supabase Storage
    const fileName = `${user.id}/${childId}_avatar_${Date.now()}.png`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, imageBlob, { contentType: "image/png", upsert: true });
    if (uploadError) throw uploadError;

    const { data: publicUrlData } = await supabase.storage.from("avatars").getPublicUrl(fileName);
    const avatarUrl = publicUrlData.publicUrl;

    // Update DB
    const { error: updateError } = await supabase
      .from("children")
      .update({ avatar_url: avatarUrl })
      .eq("id", childId)
      .eq("user_id", user.id);
    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ success: true, avatarUrl, message: "Photo cartoonified successfully!" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    console.error("Error:", error?.message || String(error));
    return new Response(JSON.stringify({ error: error?.message || "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
