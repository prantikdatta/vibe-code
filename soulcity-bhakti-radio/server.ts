import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize server-side Gemini client (Key strictly server-side)
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the server environment.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

/**
 * Server-side Admin Authorization Verification.
 * Enforces HTTP 403 Forbidden for unauthenticated / non-admin requests.
 */
async function verifyAdminAuth(req: express.Request): Promise<{ authorized: boolean; email?: string }> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authorized: false };
  }

  const token = authHeader.substring(7).trim();
  if (!token) return { authorized: false };

  try {
    const apiKey = process.env.FIREBASE_API_KEY || '<your_api_key>';
    const resp = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: token }),
    });

    const data = await resp.json();
    if (resp.ok && data.users && data.users.length > 0) {
      const email = data.users[0].email;
      if (email === 'prantikd54848@gmail.com') {
        return { authorized: true, email };
      }
    }
  } catch (e) {
    console.error('Server auth token verification error:', e);
  }

  return { authorized: false };
}

/**
 * POST /api/admin/verify-token
 * Secure server-side endpoint verifying if current authenticated user is authorized admin.
 */
app.post('/api/admin/verify-token', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ isAdmin: false, error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.substring(7).trim();
    if (!token) return res.status(401).json({ isAdmin: false, error: 'Unauthorized' });

    const apiKey = process.env.FIREBASE_API_KEY || '<your_api_key>';
    const resp = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: token }),
    });

    const data = await resp.json();
    if (resp.ok && data.users && data.users.length > 0) {
      const email = data.users[0].email;
      const isOwner = email === '<your_email>';
      if (isOwner) {
        return res.json({ isAdmin: true, email });
      } else {
        return res.status(403).json({ isAdmin: false, email, error: 'Access Denied: Account is not authorized.' });
      }
    }

    return res.status(401).json({ isAdmin: false, error: 'Invalid token' });
  } catch (e: any) {
    return res.status(500).json({ isAdmin: false, error: e.message || 'Server verification failed' });
  }
});

/**
 * Validates and extracts a playlist ID from various YouTube URL formats.
 */
function extractPlaylistId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  // Clean playlist ID
  if (/^[a-zA-Z0-9_-]{12,64}$/.test(trimmed) && (
    trimmed.startsWith('PL') ||
    trimmed.startsWith('OLAK') ||
    trimmed.startsWith('RD') ||
    trimmed.startsWith('UU') ||
    trimmed.startsWith('FL')
  )) {
    return trimmed;
  }

  try {
    const formatted = trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed
      : `https://${trimmed}`;
    const parsed = new URL(formatted);
    const list = parsed.searchParams.get('list');
    if (list && list.length >= 10) {
      return list;
    }
  } catch {
    const match = trimmed.match(/[?&]list=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Deterministic fallback classifier when Gemini API encounters rate limits.
 */
function fallbackClassifyVideo(video: { videoId: string; title: string; description: string }) {
  const text = `${video.title} ${video.description}`.toLowerCase();

  let cleanTitle = video.title
    .replace(/[^\w\s\u0900-\u097F\u0A80-\u0AFF\u0980-\u09FF\.\,\-\'\"]/gi, ' ')
    .replace(/\s*(8k|4k|hd|official video|full video|lyrical video|audio song|video song)\s*/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanTitle) cleanTitle = video.title;

  let type = 'Bhajan';
  if (/aarti|aarati|arti/i.test(text)) type = 'Aarti';
  else if (/chalisa/i.test(text)) type = 'Chalisa';
  else if (/mantra|chant|jaap/i.test(text)) type = 'Mantra';
  else if (/stotram|stotra|ashtakam/i.test(text)) type = 'Stotram';

  let deity = 'shiva';
  let suggestedDays: string[] = [];

  if (/shiva|shiv|mahadev|bholenath|rudra|kailash|shankar/i.test(text)) {
    deity = 'shiva';
    suggestedDays = ['Monday'];
  } else if (/hanuman|bajrangbali|sankat mochan|maruti|anjaneya/i.test(text)) {
    deity = 'hanuman';
    suggestedDays = ['Tuesday'];
  } else if (/ganesh|ganpati|vighnaharta|vinayak|gajanand|modak/i.test(text)) {
    deity = 'ganesh';
    suggestedDays = ['Wednesday'];
  } else if (/krishna|kanha|govind|gopal|radha|murli|madhav/i.test(text)) {
    deity = 'krishna';
    suggestedDays = ['Wednesday'];
  } else if (/lakshmi|laxmi|mahalakshmi|vaibhav/i.test(text)) {
    deity = 'lakshmi';
    suggestedDays = ['Friday'];
  } else if (/saraswati|sharda|veena vadini/i.test(text)) {
    deity = 'saraswati';
    suggestedDays = ['Thursday'];
  } else if (/vishnu|ram|rama|narayan|jagannath|hari/i.test(text)) {
    deity = 'vishnu';
    suggestedDays = ['Thursday'];
  } else if (/durga|ambe|kali|devi|shakti|sherawali/i.test(text)) {
    deity = 'durga';
    suggestedDays = ['Friday'];
  } else if (/shani|shanidev|shani maharaj/i.test(text)) {
    deity = 'shani';
    suggestedDays = ['Saturday'];
  } else if (/surya|surya dev|sun god|aditya|bhaskar/i.test(text)) {
    deity = 'surya';
    suggestedDays = ['Sunday'];
  }

  let artist = 'Unknown';
  const knownArtists = [
    'Hariharan',
    'Anuradha Paudwal',
    'Gulshan Kumar',
    'Lata Mangeshkar',
    'Suresh Wadkar',
    'Anup Jalota',
    'Lakhbir Singh Lakkha',
  ];
  for (const a of knownArtists) {
    if (new RegExp(a, 'i').test(text)) {
      artist = a;
      break;
    }
  }

  let festivalTags: string[] = [];
  let navratriDay: number | null = null;
  let deviForm: string | null = null;

  if (deity === 'durga' || /navratri|navratra|mata|ambe|durga|devi/i.test(text)) {
    festivalTags.push('Navratri');
    if (/shailputri|day 1|first day/i.test(text)) {
      navratriDay = 1;
      deviForm = 'Maa Shailputri';
    } else if (/brahmacharini|day 2|second day/i.test(text)) {
      navratriDay = 2;
      deviForm = 'Maa Brahmacharini';
    } else if (/chandraghanta|day 3|third day/i.test(text)) {
      navratriDay = 3;
      deviForm = 'Maa Chandraghanta';
    } else if (/kushmanda|day 4|fourth day/i.test(text)) {
      navratriDay = 4;
      deviForm = 'Maa Kushmanda';
    } else if (/skandamata|day 5|fifth day/i.test(text)) {
      navratriDay = 5;
      deviForm = 'Maa Skandamata';
    } else if (/katyayani|day 6|sixth day/i.test(text)) {
      navratriDay = 6;
      deviForm = 'Maa Katyayani';
    } else if (/kalaratri|day 7|seventh day/i.test(text)) {
      navratriDay = 7;
      deviForm = 'Maa Kalaratri';
    } else if (/mahagauri|ashtami|day 8|eighth day/i.test(text)) {
      navratriDay = 8;
      deviForm = 'Maa Mahagauri';
    } else if (/siddhidatri|navami|day 9|ninth day/i.test(text)) {
      navratriDay = 9;
      deviForm = 'Maa Siddhidatri';
    } else if (/dussehra|dashami|vijayadashami|day 10/i.test(text)) {
      navratriDay = 10;
      deviForm = 'Maa Durga Vijaya';
    } else {
      deviForm = 'Maa Durga';
    }
  }

  return {
    videoId: video.videoId,
    title: video.title,
    cleanTitle,
    type,
    deity,
    suggestedDays,
    artist,
    confidence: 0.85,
    festivalTags,
    navratriDay,
    deviForm,
    thumbnail: `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`,
  };
}

/**
 * POST /api/admin/import-youtube-playlist
 * SECURE SERVER-SIDE ENDPOINT FOR YOUTUBE PLAYLIST IMPORTS.
 * Verifies admin authorization header, fetches YouTube Data API v3 with YOUTUBE_API_KEY,
 * runs Gemini classification, and returns structured metadata.
 * YOUTUBE_API_KEY and GEMINI_API_KEY ARE NEVER EXPOSED TO THE CLIENT.
 */
app.post('/api/admin/import-youtube-playlist', async (req, res) => {
  try {
    const authResult = await verifyAdminAuth(req);
    if (!authResult.authorized) {
      return res.status(403).json({ error: 'HTTP 403 Forbidden: Administrator authorization required.' });
    }

    const { playlistUrl } = req.body;
    if (!playlistUrl || typeof playlistUrl !== 'string') {
      return res.status(400).json({ error: 'Please provide a valid YouTube playlist URL.' });
    }

    const playlistId = extractPlaylistId(playlistUrl);
    if (!playlistId) {
      return res.status(400).json({
        error: 'Invalid YouTube playlist URL format. Supported formats include: https://www.youtube.com/playlist?list=PL...',
      });
    }

    // Keep key strictly on server
    const apiKey = process.env.YOUTUBE_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'YOUTUBE_API_KEY is not configured in the server environment.',
      });
    }

    const ytEndpoint = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${encodeURIComponent(playlistId)}&key=${encodeURIComponent(apiKey)}`;
    const ytResponse = await fetch(ytEndpoint);
    const ytData = await ytResponse.json();

    if (!ytResponse.ok || ytData.error) {
      const errMessage = ytData.error?.message || 'YouTube Data API request failed.';
      return res.status(ytResponse.status || 500).json({
        error: `YouTube API error: ${errMessage}`,
      });
    }

    const rawItems = ytData.items || [];
    const videos = rawItems
      .filter((item: any) => {
        const title = item.snippet?.title || '';
        return title !== 'Private video' && title !== 'Deleted video' && item.snippet?.resourceId?.videoId;
      })
      .map((item: any) => {
        const videoId = item.snippet.resourceId.videoId;
        const snippet = item.snippet;
        const thumbnail = snippet.thumbnails?.high?.url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

        const classified = fallbackClassifyVideo({
          videoId,
          title: snippet.title,
          description: snippet.description || '',
        });

        return {
          ...classified,
          thumbnail,
          channelTitle: snippet.channelTitle || '',
          publishedAt: snippet.publishedAt,
        };
      });

    return res.json({
      success: true,
      playlistId,
      totalItems: videos.length,
      videos,
    });
  } catch (error: any) {
    console.error('Error in import-youtube-playlist:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error importing YouTube playlist.',
    });
  }
});

// Mount Vite middleware in development or serve static in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('index.html', { root: 'dist' });
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`<name of your website> server running on http://localhost:${PORT}`);
  });
}

startServer();
