export function formatDuration(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function generateId(): string {
  return 'scene_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
}

export async function copyToClipboard(text: string): Promise<boolean> {
  // 1. Try modern async Clipboard API first
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (clipboardErr) {
      console.warn(
        'navigator.clipboard.writeText blocked or failed (e.g. iframe policy), falling back to document.execCommand:',
        clipboardErr
      );
    }
  }

  // 2. Universal Fallback using document.execCommand('copy') with cross-browser/iOS textarea support
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    // Position offscreen to prevent layout shift or page scroll
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '-9999px';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    textArea.style.fontSize = '16px'; // Prevent auto-zoom in mobile Safari
    textArea.setAttribute('readonly', '');

    document.body.appendChild(textArea);
    textArea.focus({ preventScroll: true });
    textArea.select();
    textArea.setSelectionRange(0, textArea.value.length);

    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);

    if (successful) {
      return true;
    }
  } catch (execErr) {
    console.warn('document.execCommand copy fallback also failed:', execErr);
  }

  return false;
}

/**
 * Compresses an image File client-side to ensure rapid transmission,
 * minimal memory footprint, and prevent PayloadTooLargeError.
 */
export function compressImageFile(file: File, maxDimension = 1200, quality = 0.85): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onerror = () => resolve('');
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) {
        resolve('');
        return;
      }

      const img = new Image();
      img.onerror = () => resolve(dataUrl);
      img.onload = () => {
        try {
          let { width, height } = img;
          if (width <= maxDimension && height <= maxDimension && file.size < 500 * 1024) {
            // Already small and compact, keep original dataUrl
            resolve(dataUrl);
            return;
          }

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(dataUrl);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } catch {
          resolve(dataUrl);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Strips all image data (base64, data URLs, imageUrl, productImageUrl) from storyboard
 * project or scenes so exported JSON is clean and ready for Google Flow or other automations.
 */
export function sanitizeStoryboardForJSON<T = any>(data: T): T {
  if (!data) return data;
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeStoryboardForJSON(item)) as unknown as T;
  }
  if (typeof data === 'object') {
    const copy: any = {};
    for (const key of Object.keys(data as any)) {
      // Exclude image data fields
      if (
        key === 'imageUrl' ||
        key === 'productImageUrl' ||
        key === 'productImage' ||
        key === 'image' ||
        key === 'thumbnail' ||
        key === 'photo'
      ) {
        continue;
      }
      const val = (data as any)[key];
      // Exclude any inline base64 or blob data image string
      if (typeof val === 'string' && (val.startsWith('data:image/') || val.startsWith('blob:'))) {
        continue;
      }
      copy[key] = sanitizeStoryboardForJSON(val);
    }
    return copy as T;
  }
  return data;
}
