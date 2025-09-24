// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import OpenAI from "npm:openai@4"; // Deno supports npm specifiers
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const STYLE_HEADER = `Cartoon style reference: Gravity Falls. Consistent visual tone, clean lines, subtle textures, rich colors.`;

// Build the final prompt per page
function buildPrompt(storyText: string, avatarUrl: string) {
  return [
    STYLE_HEADER,
    `Illustrate the following story scene in the cartoon style of the TV show "Gravity Falls":`,
    `"${storyText}"`,
    `Include a cartoon version of the main character based on this uploaded reference image: ${avatarUrl}.`,
    `The character should appear as a child (around 6–9 years old) and be expressive, integrated naturally into the scene.`,
    `Match the art style, color palette, line thickness, and shading to the Gravity Falls cartoon style.`,
    `Keep proportions consistent and use a soft background with storytelling elements.`,
    `Use the same visual style as in previous illustrations in the story to maintain consistency.`,
  ].join("\n\n");
}

async function uploadImageToStorage(storyId: string, profileId: string, pageNum: number, b64: string) {
  const imageBytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const path = `${storyId}/${profileId}/page-${pageNum}.png`;
  const { error } = await supabaseAdmin.storage.from("story-images").upload(path, imageBytes, {
    contentType: "image/png",
    upsert: true,
  });
  if (error) throw error;
  const { data: pub } = supabaseAdmin.storage.from("story-images").getPublicUrl(path);
  return pub.publicUrl;
}

serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") return new Response("ok", { headers: cors(req) });

    const url = new URL(req.url);
    const pathname = url.pathname;

    if (req.method === "POST" && pathname.endsWith("/generate-story-images")) {
      const { story_id, profile_id } = await req.json();
      if (!story_id || !profile_id) {
        return json({ error: "Missing story_id or profile_id" }, 400);
      }

      // 1) Fetch avatar URL for profile
      const { data: profile, error: pErr } = await supabaseAdmin
        .from("profiles")
        .select("id, avatar_url, user_id")
        .eq("id", profile_id)
        .single();
      if (pErr || !profile?.avatar_url) return json({ error: "Profile or avatar not found" }, 404);

      // 2) Fetch story & pages
      const { data: story, error: sErr } = await supabaseAdmin
        .from("stories")
        .select("id, title, style_prompt")
        .eq("id", story_id)
        .single();
      if (sErr || !story) return json({ error: "Story not found" }, 404);

      const { data: pages, error: pgErr } = await supabaseAdmin
        .from("story_pages")
        .select("id, page_number, text_content")
        .eq("story_id", story_id)
        .order("page_number", { ascending: true });
      if (pgErr || !pages?.length) return json({ error: "No pages found" }, 404);

      // 3) Ensure image rows exist for each page (idempotent)
      for (const p of pages) {
        await supabaseAdmin
          .from("story_page_images")
          .upsert({
            story_id,
            story_page_id: p.id,
            profile_id,
            generation_status: "pending",
          }, { onConflict: "story_id,profile_id,story_page_id" });
      }

      // 4) If story.style_prompt empty, store it once (so you reuse same style per story)
      if (!story.style_prompt) {
        const stylePrompt = STYLE_HEADER;
        await supabaseAdmin.from("stories").update({ style_prompt: stylePrompt }).eq("id", story_id);
      }

      // 5) Generate images sequentially (simpler; you can parallelize later)
      for (const p of pages) {
        // mark in_progress
        await supabaseAdmin
          .from("story_page_images")
          .update({ generation_status: "in_progress", error_message: null })
          .eq("story_id", story_id).eq("profile_id", profile_id).eq("story_page_id", p.id);

        const prompt = buildPrompt(p.text_content, profile.avatar_url);

        try {
          // OpenAI Images API (DALL·E 3)
          const img = await openai.images.generate({
            model: "dall-e-3",
            prompt,
            size: "1024x1024",
            // return as base64 to upload to Supabase storage
            response_format: "b64_json",
          });

          const b64 = img.data[0].b64_json!;
          const publicUrl = await uploadImageToStorage(story_id, profile_id, p.page_number, b64);

          await supabaseAdmin
            .from("story_page_images")
            .update({
              image_url: publicUrl,
              image_prompt: prompt,
              generation_status: "complete",
            })
            .eq("story_id", story_id).eq("profile_id", profile_id).eq("story_page_id", p.id);
        } catch (e: any) {
          await supabaseAdmin
            .from("story_page_images")
            .update({
              generation_status: "error",
              error_message: String(e?.message ?? e),
            })
            .eq("story_id", story_id).eq("profile_id", profile_id).eq("story_page_id", p.id);
          // Continue remaining pages
        }
      }

      // Return summary
      const { data: summary } = await supabaseAdmin
        .from("story_page_images")
        .select("generation_status")
        .eq("story_id", story_id).eq("profile_id", profile_id);

      const done = (summary ?? []).every(r => r.generation_status === "complete");
      return json({ ok: true, story_id, profile_id, done });
    }

    // Simple status endpoint for polling
    if (req.method === "GET" && pathname.endsWith("/status")) {
      const story_id = url.searchParams.get("story_id");
      const profile_id = url.searchParams.get("profile_id");
      if (!story_id || !profile_id) return json({ error: "Missing params" }, 400);
      const { data } = await supabaseAdmin
        .from("story_page_images")
        .select("generation_status")
        .eq("story_id", story_id).eq("profile_id", profile_id);
      const total = data?.length ?? 0;
      const complete = data?.filter(d => d.generation_status === "complete").length ?? 0;
      return json({ total, complete, done: total > 0 && complete === total });
    }

    return json({ error: "Not found" }, 404);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors(), "content-type": "application/json" } });
}
function cors(req?: Request) {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  };
}
