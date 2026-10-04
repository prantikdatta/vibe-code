/**
 * YouTube Utility Helpers for SoulCity Bhakti Radio
 * Complies with official YouTube IFrame Player API and Terms of Service.
 */

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

/**
 * Extracts YouTube 11-character video ID from:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/live/VIDEO_ID
 * - Raw 11-char video ID
 */
export function extractYouTubeVideoId(inputUrl: string): string | null {
  if (!inputUrl) return null;
  const trimmed = inputUrl.trim();

  // If raw 11-character ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    const formattedUrl = trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed
      : `https://${trimmed}`;
    
    const parsed = new URL(formattedUrl);
    const host = parsed.hostname.toLowerCase().replace(/^(www\.|m\.)/, '');

    // youtu.be shortlinks
    if (host === 'youtu.be') {
      const parts = parsed.pathname.split('/').filter(Boolean);
      const id = parts[0];
      return id && id.length === 11 ? id : null;
    }

    // youtube.com domains
    if (host.includes('youtube.com') || host.includes('youtube-nocookie.com')) {
      // 1. ?v= parameter
      const v = parsed.searchParams.get('v');
      if (v && v.length === 11) return v;

      // 2. /shorts/ID, /embed/ID, /live/ID, /v/ID
      const segments = parsed.pathname.split('/').filter(Boolean);
      if (segments.length >= 2 && ['shorts', 'embed', 'live', 'v'].includes(segments[0])) {
        const id = segments[1];
        return id && id.length === 11 ? id : null;
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Extracts YouTube Playlist ID from:
 * - https://www.youtube.com/playlist?list=PLAYLIST_ID
 * - https://www.youtube.com/watch?v=...&list=PLAYLIST_ID
 * - https://youtu.be/...?list=PLAYLIST_ID
 * - Raw Playlist ID (starts with PL, OLAK, RD, UU, FL, etc.)
 */
export function extractYouTubePlaylistId(inputUrl: string): string | null {
  if (!inputUrl) return null;
  const trimmed = inputUrl.trim();

  // If already a clean playlist ID
  if (
    /^[a-zA-Z0-9_-]{12,64}$/.test(trimmed) &&
    (trimmed.startsWith('PL') ||
      trimmed.startsWith('OLAK') ||
      trimmed.startsWith('RD') ||
      trimmed.startsWith('UU') ||
      trimmed.startsWith('FL'))
  ) {
    return trimmed;
  }

  try {
    const formatted =
      trimmed.startsWith('http://') || trimmed.startsWith('https://')
        ? trimmed
        : `https://${trimmed}`;
    const parsed = new URL(formatted);
    const list = parsed.searchParams.get('list');
    if (list && list.length >= 10) {
      return list;
    }
  } catch {
    // Regex fallback
    const match = trimmed.match(/[?&]list=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Returns standard YouTube video thumbnail URL.
 * hqdefault.jpg is guaranteed to exist for all valid YouTube videos.
 */
export function getYouTubeThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Fetches video metadata (title, author, thumbnail) via official YouTube oEmbed API.
 * Uses CORS-enabled public endpoint without requiring an API key.
 */
export async function fetchYouTubeOEmbed(
  urlOrId: string
): Promise<{ title: string; author: string; thumbnailUrl: string } | null> {
  const videoId = extractYouTubeVideoId(urlOrId);
  if (!videoId) return null;

  const targetUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(targetUrl)}&format=json`;

  try {
    const res = await fetch(endpoint, { method: 'GET' });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      title: data.title || '',
      author: data.author_name || '',
      thumbnailUrl: data.thumbnail_url || getYouTubeThumbnailUrl(videoId),
    };
  } catch {
    return {
      title: '',
      author: '',
      thumbnailUrl: getYouTubeThumbnailUrl(videoId),
    };
  }
}

/**
 * Singleton loader for YouTube IFrame API script tag.
 */
let ytApiPromise: Promise<void> | null = null;

export function loadYouTubeIframeApi(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();

  if (window.YT && window.YT.Player) {
    return Promise.resolve();
  }

  if (ytApiPromise) {
    return ytApiPromise;
  }

  ytApiPromise = new Promise((resolve) => {
    // If script is already inserted
    const existing = document.getElementById('youtube-iframe-api');
    if (existing && window.YT && window.YT.Player) {
      resolve();
      return;
    }

    const previousOnReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (previousOnReady) previousOnReady();
      resolve();
    };

    if (!existing) {
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }
  });

  return ytApiPromise;
}
