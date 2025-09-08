import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface InjectParams {
  baseImageUrl: string;
  avatarUrl: string;
  storyId: string;
  childId: string;
  pageIndex: number;
  emotion?: 'happy' | 'curious' | 'surprised' | 'excited' | 'thoughtful' | 'confident';
}

export const useFaceInjection = () => {
  const [isInjecting, setIsInjecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrCache = async (cacheKey: string): Promise<string | null> => {
    const { data } = await supabase
      .from('personalized_images')
      .select('image_url')
      .eq('cache_key', cacheKey)
      .maybeSingle();
    return data?.image_url || null;
  };

  const uploadAndRecord = async (cacheKey: string, storyId: string, childId: string, pageIndex: number, blob: Blob) => {
    const path = `personalized/${storyId}/${childId}/page-${pageIndex}.png`;
    const { error: uploadErr } = await supabase.storage
      .from('StoryVoyagers')
      .upload(path, blob, { contentType: 'image/png', upsert: true });
    if (uploadErr) throw uploadErr;

    const publicUrl = `${supabase.storage.from('StoryVoyagers').getPublicUrl(path).data.publicUrl}`;

    await supabase
      .from('personalized_images')
      .upsert({
        cache_key: cacheKey,
        story_id: storyId,
        child_id: childId,
        page_index: pageIndex,
        image_url: publicUrl,
      }, { onConflict: 'cache_key' });

    return publicUrl;
  };

  const injectAvatarIntoImage = async (params: InjectParams): Promise<string | null> => {
    setIsInjecting(true);
    setError(null);

    try {
      const cacheKey = `${params.storyId}_${params.childId}_${params.pageIndex}`;

      // 1) Check cache first
      const cached = await fetchOrCache(cacheKey);
      if (cached) return cached;

      // 2) Load base image and avatar
      const baseImg = await loadImage(params.baseImageUrl);
      const avatarImg = await loadImage(params.avatarUrl);

      // 3) Create canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      canvas.width = baseImg.naturalWidth;
      canvas.height = baseImg.naturalHeight;
      ctx.drawImage(baseImg, 0, 0);

      // 4) Detect blank face circle
      const circle = detectBlankFaceCircle(ctx, canvas.width, canvas.height);
      if (!circle) {
        throw new Error('Could not detect face placeholder circle');
      }

      // 5) Apply basic tone/expression adjustments
      const adjustedAvatar = await applyEmotionTint(avatarImg, params.emotion || 'happy');

      // 6) Composite avatar into circle (cover fit)
      ctx.save();
      ctx.beginPath();
      ctx.arc(circle.x, circle.y, circle.r, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      const size = circle.r * 2;
      ctx.drawImage(adjustedAvatar, circle.x - circle.r, circle.y - circle.r, size, size);

      // 7) Edge blending using soft radial gradient mask
      const gradient = ctx.createRadialGradient(circle.x, circle.y, circle.r * 0.6, circle.x, circle.y, circle.r);
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(1, 'rgba(0,0,0,0.12)');
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = gradient;
      ctx.fillRect(circle.x - circle.r, circle.y - circle.r, size, size);
      ctx.restore();

      // 8) Slight overall color match (warm tone)
      ctx.globalCompositeOperation = 'soft-light';
      ctx.fillStyle = 'rgba(232, 213, 183, 0.12)';
      ctx.fillRect(circle.x - circle.r, circle.y - circle.r, size, size);
      ctx.globalCompositeOperation = 'source-over';

      // 9) Export
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('Failed to export personalized image');

      // 10) Upload and record
      const url = await uploadAndRecord(cacheKey, params.storyId, params.childId, params.pageIndex, blob);
      return url;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Face injection failed';
      console.error('Face injection error:', e);
      setError(msg);
      return null;
    } finally {
      setIsInjecting(false);
    }
  };

  return { injectAvatarIntoImage, isInjecting, error };
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function detectBlankFaceCircle(ctx: CanvasRenderingContext2D, width: number, height: number): { x: number; y: number; r: number } | null {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // Look specifically for pure white (#ffffff) or near-white circular areas
  const scanX0 = Math.floor(width * 0.15);
  const scanX1 = Math.floor(width * 0.85);
  const scanY0 = Math.floor(height * 0.05);
  const scanY1 = Math.floor(height * 0.70);

  let minX = width, maxX = 0, minY = height, maxY = 0;
  let samples = 0;
  const step = Math.max(1, Math.floor(Math.min(width, height) / 512));

  console.log(`Scanning for white circle in bounds: ${scanX0}-${scanX1} x ${scanY0}-${scanY1}`);

  for (let y = scanY0; y < scanY1; y += step) {
    for (let x = scanX0; x < scanX1; x += step) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      // Look for pure white or very close to white (allowing for slight compression artifacts)
      const isPureWhite = r >= 250 && g >= 250 && b >= 250 && a > 200;
      const isNearWhite = r >= 240 && g >= 240 && b >= 240 && 
                         Math.abs(r - g) <= 15 && Math.abs(g - b) <= 15 && Math.abs(r - b) <= 15;
      
      if (isPureWhite || isNearWhite) {
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
        samples++;
      }
    }
  }

  console.log(`Found ${samples} white pixels in potential circle area`);

  if (samples < 100) return null; // not enough white pixels detected

  const cx = Math.round((minX + maxX) / 2);
  const cy = Math.round((minY + maxY) / 2);
  const rx = (maxX - minX) / 2;
  const ry = (maxY - minY) / 2;
  const r = Math.round((rx + ry) / 2);

  // Additional circular validation - check if the detected area is roughly circular
  const aspectRatio = rx > 0 ? ry / rx : 1;
  if (aspectRatio < 0.6 || aspectRatio > 1.7) {
    console.log(`Area not circular enough, aspect ratio: ${aspectRatio}`);
    return null;
  }

  if (r < 20) {
    console.log(`Circle too small: radius ${r}`);
    return null;
  }

  console.log(`Detected white circle at (${cx}, ${cy}) with radius ${r}`);
  return { x: cx, y: cy, r };
}

async function applyEmotionTint(avatar: HTMLImageElement, emotion: InjectParams['emotion'] = 'happy'): Promise<HTMLImageElement> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return avatar;

  canvas.width = avatar.naturalWidth;
  canvas.height = avatar.naturalHeight;
  ctx.drawImage(avatar, 0, 0);

  switch (emotion) {
    case 'happy':
      ctx.fillStyle = 'rgba(255, 235, 59, 0.10)';
      break;
    case 'curious':
      ctx.fillStyle = 'rgba(33, 150, 243, 0.08)';
      break;
    case 'surprised':
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      break;
    case 'excited':
      ctx.fillStyle = 'rgba(255, 152, 0, 0.10)';
      break;
    case 'thoughtful':
      ctx.fillStyle = 'rgba(96, 125, 139, 0.10)';
      break;
    case 'confident':
      ctx.fillStyle = 'rgba(139, 195, 74, 0.10)';
      break;
    default:
      ctx.fillStyle = 'rgba(0,0,0,0)';
  }

  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) return avatar;

  const adjusted = await loadImage(URL.createObjectURL(blob));
  return adjusted;
}
