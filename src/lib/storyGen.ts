import { createClient } from "@supabase/supabase-js";
const supabase = createClient(import.meta.env.VITE_SUPABASE_URL!, import.meta.env.VITE_SUPABASE_ANON_KEY!);

export async function ensureImagesGenerated(storyId: string, profileId: string) {
  // Check existing rows
  const { data: rows, error } = await supabase
    .from("story_page_images")
    .select("generation_status")
    .eq("story_id", storyId)
    .eq("profile_id", profileId);
  if (error) throw error;

  const total = rows?.length ?? 0;
  const complete = rows?.filter(r => r.generation_status === "complete").length ?? 0;

  if (total > 0 && complete === total) {
    return { total, complete, done: true };
  }

  // Trigger generation (idempotent; function upserts)
  await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-story-images`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ story_id: storyId, profile_id: profileId }),
  });

  return pollStatus(storyId, profileId);
}

async function pollStatus(storyId: string, profileId: string, timeoutMs = 180000, intervalMs = 2500) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const r = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/status?story_id=${storyId}&profile_id=${profileId}`);
    const s = await r.json();
    if (s?.done) return s;
    await new Promise(res => setTimeout(res, intervalMs));
  }
  return { done: false };
}
