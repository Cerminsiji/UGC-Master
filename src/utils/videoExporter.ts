import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
import { Scene } from '../types';

export interface VideoRenderOptions {
  scenes: Scene[];
  title: string;
  categoryName: string;
  productImageUrl?: string;
  showTikTokOverlay?: boolean;
  resolution?: '720p' | '540p';
  onProgress?: (progress: number, statusText: string) => void;
}

export interface VideoRenderResult {
  blob: Blob;
  url: string;
  filename: string;
  isFFmpegMp4: boolean;
  duration: number;
}

// Singleton FFmpeg instance
let ffmpegInstance: FFmpeg | null = null;
let isFFmpegLoading = false;
let isFFmpegLoaded = false;

/**
 * Initializes and loads client-side FFmpeg WebAssembly.
 * Attempts local server route first (/ffmpeg/ffmpeg-core.js),
 * then falls back to public unpkg CDN.
 */
export async function loadFFmpeg(
  onLog?: (message: string) => void
): Promise<FFmpeg | null> {
  if (isFFmpegLoaded && ffmpegInstance) {
    return ffmpegInstance;
  }

  if (isFFmpegLoading) {
    // Wait for in-flight initialization
    let attempts = 0;
    while (isFFmpegLoading && attempts < 50) {
      await new Promise((r) => setTimeout(r, 200));
      attempts++;
    }
    if (isFFmpegLoaded && ffmpegInstance) return ffmpegInstance;
  }

  isFFmpegLoading = true;
  try {
    const ffmpeg = new FFmpeg();

    if (onLog) {
      ffmpeg.on('log', ({ message }) => {
        onLog(message);
      });
    }

    // Attempt 1: Load from local Express static route
    try {
      const coreURL = await toBlobURL('/ffmpeg/ffmpeg-core.js', 'text/javascript');
      const wasmURL = await toBlobURL('/ffmpeg/ffmpeg-core.wasm', 'application/wasm');

      await ffmpeg.load({
        coreURL,
        wasmURL,
      });

      ffmpegInstance = ffmpeg;
      isFFmpegLoaded = true;
      isFFmpegLoading = false;
      return ffmpeg;
    } catch (localErr) {
      console.warn('Local FFmpeg core load failed, falling back to CDN...', localErr);
    }

    // Attempt 2: Load from unpkg CDN
    const cdnBase = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    const coreURL = await toBlobURL(`${cdnBase}/ffmpeg-core.js`, 'text/javascript');
    const wasmURL = await toBlobURL(`${cdnBase}/ffmpeg-core.wasm`, 'application/wasm');

    await ffmpeg.load({
      coreURL,
      wasmURL,
    });

    ffmpegInstance = ffmpeg;
    isFFmpegLoaded = true;
    isFFmpegLoading = false;
    return ffmpeg;
  } catch (err) {
    console.error('Failed to initialize client-side FFmpeg WebAssembly:', err);
    isFFmpegLoading = false;
    return null;
  }
}

/**
 * Preloads an image URL into an HTMLImageElement for canvas rendering safely.
 */
function preloadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }
    // For data URLs, crossOrigin is not needed
    if (src.startsWith('data:')) {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      // Fallback without crossOrigin
      const fallbackImg = new Image();
      fallbackImg.onload = () => resolve(fallbackImg);
      fallbackImg.onerror = () => {
        console.warn('Failed to load image for video render:', src.slice(0, 60));
        resolve(null);
      };
      fallbackImg.src = src;
    };
    img.src = src;
  });
}

/**
 * Renders an animated storyboard video directly on the client canvas,
 * captures audio & video streams, and transcodes to standard MP4 with FFmpeg.
 */
export async function renderStoryboardVideo(
  options: VideoRenderOptions
): Promise<VideoRenderResult> {
  const {
    scenes,
    title,
    categoryName,
    productImageUrl,
    showTikTokOverlay = true,
    resolution = '720p',
    onProgress,
  } = options;

  if (!scenes || scenes.length === 0) {
    throw new Error('Storyboard tidak memiliki adegan untuk diekspor ke video.');
  }

  const updateProgress = (pct: number, text: string) => {
    if (onProgress) onProgress(Math.min(100, Math.max(0, Math.round(pct))), text);
  };

  updateProgress(5, 'Memuat resource gambar & audio...');

  // Setup resolution
  const width = resolution === '720p' ? 720 : 540;
  const height = resolution === '720p' ? 1280 : 960;

  // Preload product image and scene-specific images
  const defaultProductImg = productImageUrl ? await preloadImage(productImageUrl) : null;
  const sceneImages: (HTMLImageElement | null)[] = [];
  for (const sc of scenes) {
    if (sc.imageUrl) {
      const img = await preloadImage(sc.imageUrl);
      sceneImages.push(img || defaultProductImg);
    } else {
      sceneImages.push(defaultProductImg);
    }
  }

  // Create offscreen canvas for rendering
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context tidak tersedia di browser ini.');
  }

  // Setup Web Audio for rhythm/tones
  let audioContext: AudioContext | null = null;
  let audioDestination: MediaStreamAudioDestinationNode | null = null;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      audioContext = new AudioCtx();
      audioDestination = audioContext.createMediaStreamDestination();
    }
  } catch (audioErr) {
    console.warn('Web Audio not available for video track:', audioErr);
  }

  // Play a soft transition sound per scene
  const playSceneBeep = (freq = 440, duration = 0.15) => {
    if (!audioContext || !audioDestination) return;
    try {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioContext.currentTime);
      gain.gain.setValueAtTime(0.08, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioDestination);
      osc.start();
      osc.stop(audioContext.currentTime + duration);
    } catch {
      // Ignore audio synthesis errors
    }
  };

  // Combine video stream and audio stream
  const canvasStream = canvas.captureStream(30); // 30 FPS
  let combinedStream = canvasStream;
  if (audioDestination && audioDestination.stream.getAudioTracks().length > 0) {
    const audioTrack = audioDestination.stream.getAudioTracks()[0];
    combinedStream.addTrack(audioTrack);
  }

  // Choose supported mimeType for MediaRecorder
  let mimeType = 'video/webm;codecs=vp9,opus';
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm;codecs=vp8,opus';
  }
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm';
  }
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/mp4';
  }

  const mediaRecorder = new MediaRecorder(combinedStream, {
    mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : undefined,
    videoBitsPerSecond: 3_500_000,
  });

  const recordedChunks: Blob[] = [];
  mediaRecorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      recordedChunks.push(e.data);
    }
  };

  const recordingFinishedPromise = new Promise<Blob>((resolve, reject) => {
    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: mimeType || 'video/webm' });
      resolve(blob);
    };
    mediaRecorder.onerror = (err) => reject(err);
  });

  mediaRecorder.start(100);

  // Total duration in seconds
  const totalDuration = scenes.reduce((sum, s) => sum + (Number(s.duration) || 3), 0);
  const fps = 30;
  const frameIntervalMs = 1000 / fps;

  updateProgress(10, 'Merender frame adegan video (Canvas)...');

  let currentGlobalTime = 0;
  let sceneStartIndex = 0;

  // Render scenes sequentially
  for (let sIdx = 0; sIdx < scenes.length; sIdx++) {
    const scene = scenes[sIdx];
    const durationSec = Math.max(1, Number(scene.duration) || 3);
    const totalFramesInScene = Math.round(durationSec * fps);
    const img = sceneImages[sIdx];

    // Trigger audio beep at start of scene
    playSceneBeep(sIdx === 0 ? 587.33 : 440 + (sIdx % 4) * 60, 0.18);

    for (let f = 0; f < totalFramesInScene; f++) {
      const sceneProgress = f / totalFramesInScene;
      const globalProgress = (currentGlobalTime + (f / fps)) / totalDuration;

      // Draw background
      ctx.save();
      if (img) {
        // Blur background fill (steady framing, zero anomalous snap)
        ctx.filter = 'blur(20px) brightness(0.4)';
        const bgScale = 1.08;
        const bgW = width * bgScale;
        const bgH = height * bgScale;
        ctx.drawImage(img, (width - bgW) / 2, (height - bgH) / 2, bgW, bgH);
        ctx.filter = 'none';

        // Dark overlay vignette
        const grad = ctx.createRadialGradient(
          width / 2,
          height / 2,
          width * 0.2,
          width / 2,
          height / 2,
          width * 0.9
        );
        grad.addColorStop(0, 'rgba(0,0,0,0.1)');
        grad.addColorStop(1, 'rgba(5,8,16,0.85)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Center Product Card (Clean, steady, professional)
        const cardWidth = width * 0.76;
        const cardHeight = height * 0.42;
        const cardX = (width - cardWidth) / 2;
        const cardY = height * 0.20;

        // Card shadow & container
        ctx.shadowColor = 'rgba(0,0,0,0.7)';
        ctx.shadowBlur = 30;
        ctx.fillStyle = 'rgba(17, 24, 39, 0.9)';
        roundRect(ctx, cardX, cardY, cardWidth, cardHeight, 28);
        ctx.fill();

        // Card border
        ctx.shadowColor = 'transparent';
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
        ctx.stroke();

        // Draw centered crisp product image without jumpy zoom snaps
        ctx.save();
        roundRect(ctx, cardX + 8, cardY + 8, cardWidth - 16, cardHeight - 16, 22);
        ctx.clip();
        const imgAspect = img.width / img.height;
        let dw = cardWidth - 16;
        let dh = (cardWidth - 16) / imgAspect;
        if (dh < cardHeight - 16) {
          dh = cardHeight - 16;
          dw = (cardHeight - 16) * imgAspect;
        }
        const dx = cardX + 8 + ((cardWidth - 16) - dw) / 2;
        const dy = cardY + 8 + ((cardHeight - 16) - dh) / 2;
        ctx.drawImage(img, dx, dy, dw, dh);
        ctx.restore();

        // Product tag badge
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        roundRect(ctx, cardX + 16, cardY + 16, 170, 32, 16);
        ctx.fill();
        ctx.fillStyle = '#f3e8ff';
        ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
        ctx.fillText('📸 Referensi Produk', cardX + 28, cardY + 37);
      } else {
        // Fallback modern studio gradient
        const bgGrad = ctx.createLinearGradient(0, 0, width, height);
        bgGrad.addColorStop(0, '#131b2e');
        bgGrad.addColorStop(0.5, '#0d1322');
        bgGrad.addColorStop(1, '#080d18');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Ambient glow circle
        const circleGrad = ctx.createRadialGradient(
          width / 2,
          height * 0.38,
          20,
          width / 2,
          height * 0.38,
          width * 0.5
        );
        circleGrad.addColorStop(0, 'rgba(147, 51, 234, 0.25)');
        circleGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = circleGrad;
        ctx.fillRect(0, 0, width, height);
      }
      ctx.restore();

      // Top Notch & Phone Status Bar
      ctx.fillStyle = '#000000';
      roundRect(ctx, (width - 180) / 2, 14, 180, 28, 14);
      ctx.fill();

      // Top Segments Progress Bar
      const segGap = 6;
      const totalSegWidth = width - 48;
      const segWidth = (totalSegWidth - (scenes.length - 1) * segGap) / scenes.length;
      for (let s = 0; s < scenes.length; s++) {
        const sx = 24 + s * (segWidth + segGap);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        roundRect(ctx, sx, 52, segWidth, 6, 3);
        ctx.fill();

        if (s < sIdx) {
          ctx.fillStyle = '#ffffff';
          roundRect(ctx, sx, 52, segWidth, 6, 3);
          ctx.fill();
        } else if (s === sIdx) {
          ctx.fillStyle = '#c084fc';
          roundRect(ctx, sx, 52, segWidth * sceneProgress, 6, 3);
          ctx.fill();
        }
      }

      // Scene Badge & Angle
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      roundRect(ctx, 24, 72, 140, 32, 8);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
      ctx.fillText(`ADEGAN ${sIdx + 1} / ${scenes.length}`, 36, 93);

      if (scene.cameraAngle) {
        ctx.fillStyle = 'rgba(126, 34, 206, 0.85)';
        roundRect(ctx, width - 170, 72, 146, 32, 8);
        ctx.fill();
        ctx.fillStyle = '#f5d0fe';
        ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
        ctx.fillText(`🎥 ${scene.cameraAngle}`, width - 158, 93);
      }

      // Visual Action Card (Middle)
      if (scene.visualAction) {
        const actionY = img ? height * 0.64 : height * 0.32;
        const actionW = width * 0.88;
        const actionX = (width - actionW) / 2;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        roundRect(ctx, actionX, actionY, actionW, 90, 18);
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(147, 51, 234, 0.3)';
        ctx.stroke();

        ctx.fillStyle = '#c084fc';
        ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
        ctx.fillText('👁️ AKSI VISUAL KAMERA', actionX + 18, actionY + 26);

        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'italic 14px system-ui, -apple-system, sans-serif';
        wrapText(ctx, `"${scene.visualAction}"`, actionX + 18, actionY + 48, actionW - 36, 20);
      }

      // POPUP TEXT STICKER (High impact TikTok sticker - Clean horizontal alignment)
      if (scene.popupText) {
        ctx.save();
        const stickerY = img ? height * 0.74 : height * 0.48;
        ctx.translate(width / 2, stickerY);

        ctx.font = '900 24px system-ui, -apple-system, sans-serif';
        const textMetrics = ctx.measureText(scene.popupText.toUpperCase());
        const pillW = Math.min(width * 0.85, textMetrics.width + 48);
        const pillH = 50;

        // Yellow sticker body with black border
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 18;
        ctx.shadowOffsetY = 6;
        ctx.fillStyle = '#facc15'; // Vibrant yellow
        roundRect(ctx, -pillW / 2, -pillH / 2, pillW, pillH, 12);
        ctx.fill();

        ctx.shadowColor = 'transparent';
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = '#000000';
        ctx.stroke();

        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(scene.popupText.toUpperCase(), 0, 2);
        ctx.restore();
      }

      // SFX Pill Indicator
      if (scene.soundEffect) {
        const sfxY = img ? height * 0.80 : height * 0.58;
        ctx.fillStyle = 'rgba(30, 27, 75, 0.9)';
        const sfxText = `🔊 SFX: ${scene.soundEffect}`;
        ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
        const sfxW = ctx.measureText(sfxText).width + 32;
        roundRect(ctx, (width - sfxW) / 2, sfxY, sfxW, 30, 15);
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.5)';
        ctx.stroke();

        ctx.fillStyle = '#fef08a';
        ctx.fillText(sfxText, (width - sfxW) / 2 + 16, sfxY + 20);
      }

      // Voice Over (VO) / Subtitles at Bottom
      const voBoxY = height * 0.84;
      const voBoxW = width * 0.88;
      const voBoxX = (width - voBoxW) / 2;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.82)';
      roundRect(ctx, voBoxX, voBoxY, voBoxW, 110, 18);
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
      ctx.fillText('🎙️ VOICE OVER (VO) / DIALOG:', voBoxX + 16, voBoxY + 26);

      ctx.fillStyle = '#ffffff';
      ctx.font = '600 15px system-ui, -apple-system, sans-serif';
      wrapText(
        ctx,
        scene.dialogVO || '(Tidak ada voice over)',
        voBoxX + 16,
        voBoxY + 50,
        voBoxW - 32,
        22
      );

      // TikTok Right Side Overlay (Heart, Comments, Share, Music Disc)
      if (showTikTokOverlay) {
        const iconX = width - 48;
        const iconStartY = height * 0.52;

        // Likes
        drawSocialIcon(ctx, iconX, iconStartY, '❤️', '24.8K');
        // Comments
        drawSocialIcon(ctx, iconX, iconStartY + 64, '💬', '482');
        // Bookmark
        drawSocialIcon(ctx, iconX, iconStartY + 128, '🔖', '1.9K');
        // Share
        drawSocialIcon(ctx, iconX, iconStartY + 192, '↗️', 'Share');

        // Rotating Music Disc
        ctx.save();
        const discY = iconStartY + 252;
        ctx.translate(iconX, discY);
        ctx.rotate((sceneProgress * 360 * Math.PI) / 180);
        ctx.fillStyle = '#18181b';
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#a855f7';
        ctx.stroke();
        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Yield frame timing to browser
      await new Promise((resolve) => setTimeout(resolve, frameIntervalMs));
    }

    currentGlobalTime += durationSec;
    const progressPct = 10 + ((sIdx + 1) / scenes.length) * 50;
    updateProgress(
      progressPct,
      `Merender adegan ${sIdx + 1}/${scenes.length} (${Math.round(progressPct)}%)...`
    );
  }

  updateProgress(65, 'Menyelesaikan perekaman stream...');
  mediaRecorder.stop();
  const rawVideoBlob = await recordingFinishedPromise;

  updateProgress(72, 'Menginisialisasi FFmpeg WebAssembly...');
  const ffmpeg = await loadFFmpeg((msg) => {
    // optional debug logging
  });

  const baseFilename = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_ugc_video`;

  // If FFmpeg is available, transcode to standard MP4 (libx264/AAC)
  if (ffmpeg) {
    try {
      updateProgress(78, 'Mentranscode video ke format MP4 (H.264/AAC)...');

      const inputName = 'input.webm';
      const outputName = 'output.mp4';

      // Load raw recorded bytes into virtual filesystem
      const rawBytes = new Uint8Array(await rawVideoBlob.arrayBuffer());
      await ffmpeg.writeFile(inputName, rawBytes);

      // Track ffmpeg transcoding progress
      ffmpeg.on('progress', ({ progress }) => {
        const transPct = 78 + progress * 20;
        updateProgress(transPct, `FFmpeg Encoding: ${Math.round(progress * 100)}%`);
      });

      // Execute FFmpeg transcode command
      // High speed preset, standard yuv420p for maximum device compatibility
      await ffmpeg.exec([
        '-i',
        inputName,
        '-c:v',
        'libx264',
        '-preset',
        'ultrafast',
        '-pix_fmt',
        'yuv420p',
        '-movflags',
        '+faststart',
        outputName,
      ]);

      const outputData = await ffmpeg.readFile(outputName);
      const mp4Blob = new Blob([(outputData as Uint8Array).buffer], { type: 'video/mp4' });

      // Clean up virtual files
      try {
        await ffmpeg.deleteFile(inputName);
        await ffmpeg.deleteFile(outputName);
      } catch {
        // ignore cleanup errors
      }

      updateProgress(100, 'Video MP4 berhasil dibuat! 🎉');

      return {
        blob: mp4Blob,
        url: URL.createObjectURL(mp4Blob),
        filename: `${baseFilename}.mp4`,
        isFFmpegMp4: true,
        duration: totalDuration,
      };
    } catch (ffmpegErr) {
      console.warn('FFmpeg transcode failed, falling back to recorded video blob:', ffmpegErr);
    }
  }

  // Fallback: If FFmpeg was unavailable or failed, return the high-quality recorded blob
  updateProgress(100, 'Video berhasil dibuat! 🎉');
  const fallbackUrl = URL.createObjectURL(rawVideoBlob);
  const isMp4 = rawVideoBlob.type.includes('mp4');

  return {
    blob: rawVideoBlob,
    url: fallbackUrl,
    filename: `${baseFilename}.${isMp4 ? 'mp4' : 'webm'}`,
    isFFmpegMp4: false,
    duration: totalDuration,
  };
}

/**
 * Helper: draw social action icon & count
 */
function drawSocialIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  emoji: string,
  label: string
) {
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.beginPath();
  ctx.arc(x, y, 20, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = '16px system-ui';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, x, y);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
  ctx.fillText(label, x, y + 27);
  ctx.restore();
}

/**
 * Helper: draw rounded rectangles on 2D canvas
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Helper: word wrap text on canvas
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ');
  let line = '';

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}
