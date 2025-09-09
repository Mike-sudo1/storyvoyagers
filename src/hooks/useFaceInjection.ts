import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface FaceAnchor {
  type: 'circle';
  x: number;
  y: number;
  r: number;
  units: 'ratio';
}

export interface InjectParams {
  baseImageUrl: string;
  avatarUrl: string;
  storyId: string;
  childId: string;
  pageIndex: number;
  emotion?: 'happy' | 'curious' | 'surprised' | 'excited' | 'thoughtful' | 'confident';
  faceAnchor?: FaceAnchor;
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

      // 4) Get face position - use anchor if provided, otherwise detect
      let circle;
      if (params.faceAnchor) {
        // Convert ratio coordinates to pixel coordinates
        circle = {
          x: params.faceAnchor.x * canvas.width,
          y: params.faceAnchor.y * canvas.height,
          r: params.faceAnchor.r * Math.min(canvas.width, canvas.height)
        };
        console.log('Using face anchor coordinates:', circle);
      } else {
        // Fallback to circle detection
        circle = detectBlankFaceCircle(ctx, canvas.width, canvas.height);
        if (!circle) {
          throw new Error('Could not detect face placeholder circle');
        }
        console.log('Detected face circle:', circle);
      }

      // 5) Clear the placeholder area completely (remove any text)
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(circle.x, circle.y, circle.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 6) Extract face region from avatar and apply emotion adjustments
      const faceRegion = extractFaceRegion(avatarImg);
      
      // Wait for face region to load before applying emotion tint
      await new Promise((resolve) => {
        if (faceRegion.complete) {
          resolve(true);
        } else {
          faceRegion.onload = () => resolve(true);
        }
      });
      
      const adjustedFace = await applyEmotionTint(faceRegion, params.emotion || 'happy');

      // 7) Composite face into circle with natural blending
      ctx.save();
      
      // Create circular clipping mask
      ctx.beginPath();
      ctx.arc(circle.x, circle.y, circle.r, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      // Scale face to fit circle optimally
      const faceSize = circle.r * 1.8; // Slightly smaller than full circle for natural look
      const faceScale = Math.min(
        faceSize / adjustedFace.naturalWidth,
        faceSize / adjustedFace.naturalHeight
      );
      const scaledWidth = adjustedFace.naturalWidth * faceScale;
      const scaledHeight = adjustedFace.naturalHeight * faceScale;
      
      // Center the face in the circle
      const faceX = circle.x - scaledWidth / 2;
      const faceY = circle.y - scaledHeight / 2;
      
      // Draw the face with soft edges
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(adjustedFace, faceX, faceY, scaledWidth, scaledHeight);

      // 8) Apply natural blending and integration effects
      ctx.restore();
      ctx.save();
      
      // Soft edge feathering
      const featherGradient = ctx.createRadialGradient(
        circle.x, circle.y, circle.r * 0.6, 
        circle.x, circle.y, circle.r
      );
      featherGradient.addColorStop(0, 'rgba(0,0,0,0)');
      featherGradient.addColorStop(0.8, 'rgba(0,0,0,0)');
      featherGradient.addColorStop(1, 'rgba(0,0,0,0.15)');
      
      ctx.globalCompositeOperation = 'multiply';
      ctx.beginPath();
      ctx.arc(circle.x, circle.y, circle.r, 0, Math.PI * 2);
      ctx.fillStyle = featherGradient;
      ctx.fill();
      
      // Color harmony adjustment for art style integration
      ctx.globalCompositeOperation = 'soft-light';
      ctx.fillStyle = 'rgba(240, 220, 180, 0.12)';
      ctx.beginPath();
      ctx.arc(circle.x, circle.y, circle.r, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();

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

  console.log(`Starting white circle detection on ${width}x${height} image`);

  // Expanded scan area for better coverage
  const scanX0 = Math.floor(width * 0.1);
  const scanX1 = Math.floor(width * 0.9);
  const scanY0 = Math.floor(height * 0.1);
  const scanY1 = Math.floor(height * 0.9);

  let whitePixels: Array<{ x: number; y: number }> = [];
  const step = Math.max(1, Math.floor(Math.min(width, height) / 800));

  console.log(`Scanning area: ${scanX0}-${scanX1} x ${scanY0}-${scanY1}, step: ${step}`);

  // First pass: find all pure white pixels
  for (let y = scanY0; y < scanY1; y += step) {
    for (let x = scanX0; x < scanX1; x += step) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      // Strict white detection for placeholder circles
      const isPureWhite = r >= 253 && g >= 253 && b >= 253 && a > 240;
      
      if (isPureWhite) {
        whitePixels.push({ x, y });
      }
    }
  }

  console.log(`Found ${whitePixels.length} pure white pixels`);

  if (whitePixels.length < 50) {
    console.log('Not enough pure white pixels found');
    return null;
  }

  // Calculate bounding box of white pixels
  const minX = Math.min(...whitePixels.map(p => p.x));
  const maxX = Math.max(...whitePixels.map(p => p.x));
  const minY = Math.min(...whitePixels.map(p => p.y));
  const maxY = Math.max(...whitePixels.map(p => p.y));

  const cx = Math.round((minX + maxX) / 2);
  const cy = Math.round((minY + maxY) / 2);
  const rx = (maxX - minX) / 2;
  const ry = (maxY - minY) / 2;
  const r = Math.round(Math.max(rx, ry)); // Use the larger radius for safety

  // Validate circularity
  const aspectRatio = rx > 0 ? ry / rx : 1;
  if (aspectRatio < 0.4 || aspectRatio > 2.5) {
    console.log(`Area not circular enough, aspect ratio: ${aspectRatio}`);
    return null;
  }

  if (r < 15) {
    console.log(`Circle too small: radius ${r}`);
    return null;
  }

  // Validate that we have a substantial circular white area
  let circularWhiteCount = 0;
  const checkRadius = r * 0.8; // Check inner 80% of detected circle
  
  for (let dy = -checkRadius; dy <= checkRadius; dy += step) {
    for (let dx = -checkRadius; dx <= checkRadius; dx += step) {
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance <= checkRadius) {
        const checkX = cx + dx;
        const checkY = cy + dy;
        
        if (checkX >= 0 && checkX < width && checkY >= 0 && checkY < height) {
          const i = (Math.round(checkY) * width + Math.round(checkX)) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          
          if (r >= 250 && g >= 250 && b >= 250 && a > 240) {
            circularWhiteCount++;
          }
        }
      }
    }
  }

  const expectedCircularPixels = Math.PI * checkRadius * checkRadius / (step * step);
  const whiteRatio = circularWhiteCount / expectedCircularPixels;

  console.log(`Circular validation: ${circularWhiteCount}/${expectedCircularPixels.toFixed(0)} pixels (${(whiteRatio * 100).toFixed(1)}% white)`);

  if (whiteRatio < 0.6) {
    console.log('Not enough white pixels in circular pattern');
    return null;
  }

  console.log(`✅ Detected valid white circle at (${cx}, ${cy}) with radius ${r}`);
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

function extractFaceRegion(avatar: HTMLImageElement): HTMLImageElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return avatar;

  const originalWidth = avatar.naturalWidth;
  const originalHeight = avatar.naturalHeight;

  // Determine face crop region - assume face is in center portion of avatar
  // Most avatar images have the face in the upper-center area
  const faceWidth = Math.min(originalWidth * 0.8, originalHeight * 0.8);
  const faceHeight = faceWidth; // Square crop for circular insertion
  
  // Position face crop slightly towards upper portion (where faces typically are)
  const cropX = (originalWidth - faceWidth) / 2;
  const cropY = Math.max(0, (originalHeight - faceHeight) / 2 - originalHeight * 0.1);

  canvas.width = faceWidth;
  canvas.height = faceHeight;

  // Draw cropped face region
  ctx.drawImage(
    avatar,
    cropX, cropY, faceWidth, faceHeight, // Source crop
    0, 0, faceWidth, faceHeight          // Destination
  );

  // Apply circular mask to the face crop for smoother integration
  const imageData = ctx.getImageData(0, 0, faceWidth, faceHeight);
  const data = imageData.data;
  const centerX = faceWidth / 2;
  const centerY = faceHeight / 2;
  const radius = Math.min(faceWidth, faceHeight) / 2;

  // Apply soft circular mask
  for (let y = 0; y < faceHeight; y++) {
    for (let x = 0; x < faceWidth; x++) {
      const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      const alpha = Math.max(0, Math.min(1, (radius - distance + 10) / 20)); // Soft edge
      
      const pixelIndex = (y * faceWidth + x) * 4;
      data[pixelIndex + 3] = data[pixelIndex + 3] * alpha; // Apply alpha
    }
  }

  ctx.putImageData(imageData, 0, 0);

  // Convert canvas to image
  const faceImg = new Image();
  faceImg.src = canvas.toDataURL('image/png');
  return faceImg;
}
