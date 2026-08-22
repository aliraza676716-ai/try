import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// ==========================================
// 1. DATA STRUCTURES & SECURE KEY STORE
// ==========================================
interface StoredKey {
  id: string;
  key: string;
  maskedKey: string;
  addedAt: number;
  usedCount: number;
  maxQuota: number; // 100 images per key limit
  status: 'active' | 'exhausted' | 'disabled';
  label?: string;
  lastUsedAt?: number;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const KEYS_FILE = path.join(DATA_DIR, 'clipdrop_keys.json');

// Ensure secure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function maskKey(key: string): string {
  if (!key || key.length < 8) return '****';
  const prefix = key.slice(0, 4);
  const suffix = key.slice(-4);
  return `${prefix}••••••${suffix}`;
}

function loadKeys(): StoredKey[] {
  try {
    if (fs.existsSync(KEYS_FILE)) {
      const data = fs.readFileSync(KEYS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('[Server] Safe Notice: Could not read local keys store.');
  }
  return [];
}

function saveKeys(keys: StoredKey[]) {
  try {
    fs.writeFileSync(KEYS_FILE, JSON.stringify(keys, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Server] Safe Notice: Could not persist local keys store.');
  }
}

let keyStore: StoredKey[] = loadKeys();

// Sync initial key from environment if provided and not yet registered
if (process.env.CLIPDROP_API_KEY && !keyStore.some(k => k.key === process.env.CLIPDROP_API_KEY)) {
  const envKey = process.env.CLIPDROP_API_KEY.trim();
  if (envKey.length > 5) {
    keyStore.push({
      id: 'key_env_' + Math.random().toString(36).substring(2, 7),
      key: envKey,
      maskedKey: maskKey(envKey),
      addedAt: Date.now(),
      usedCount: 0,
      maxQuota: 100,
      status: 'active',
      label: 'Primary Env Key'
    });
    saveKeys(keyStore);
  }
}

// Master Admin Security Passcode
const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || '123QWErty.A...???...A80103';

// Lazy Gemini SDK client (server-side only)
let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return geminiClient;
}

// ==========================================
// 2. IN-MEMORY RATE LIMITING & SECURITY
// ==========================================
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function rateLimiter(limit: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    if (!record || now > record.resetAt) {
      rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (record.count >= limit) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests. Please slow down and try again shortly.'
      });
    }

    record.count += 1;
    next();
  };
}

// ==========================================
// 3. SERVER INITIALIZATION & REST API
// ==========================================
async function startServer() {
  const app = express();
  const PORT = 3000;

  // Request body parsers with strict size limits
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));

  // CORS Middleware (supports configurable FRONTEND_URL or local development)
  app.use((req: Request, res: Response, next: NextFunction) => {
    const allowedOrigin = process.env.FRONTEND_URL || req.headers.origin || '*';
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-requested-with');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });

  // Safe Request Logger (never logs sensitive payload or credentials)
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[HTTP] ${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`);
    });
    next();
  });

  // ------------------------------------------
  // PUBLIC ENDPOINTS
  // ------------------------------------------

  // Health Check
  app.get('/api/health', (_req: Request, res: Response) => {
    const activeKeys = keyStore.filter(k => k.status === 'active' && k.usedCount < k.maxQuota);
    res.json({
      status: 'ok',
      service: 'Lumina Image Synthesis Engine',
      activeKeysCount: activeKeys.length,
      timestamp: new Date().toISOString()
    });
  });

  // ------------------------------------------
  // ADMIN AUTHENTICATION & MANAGEMENT
  // ------------------------------------------

  // Admin Login / Verify Passcode (Rate limited: 10 attempts per minute)
  app.post('/api/admin/login', rateLimiter(10, 60000), (req: Request, res: Response) => {
    const { passcode } = req.body;
    if (!passcode || typeof passcode !== 'string') {
      return res.status(400).json({ success: false, error: 'Passcode is required' });
    }

    if (passcode.trim() === ADMIN_PASSCODE.trim()) {
      return res.json({
        success: true,
        message: 'Authentication successful',
        timestamp: Date.now()
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Invalid Admin Security Code'
    });
  });

  // Backward-compatible verify passcode endpoint
  app.post('/api/admin/verify-passcode', rateLimiter(10, 60000), (req: Request, res: Response) => {
    const { passcode } = req.body;
    if (passcode && passcode.trim() === ADMIN_PASSCODE.trim()) {
      return res.json({ success: true, message: 'Access granted' });
    }
    return res.status(401).json({ success: false, error: 'Invalid Admin Security Code' });
  });

  // Get Admin Keys & Stats (Sanitized output - Never reveals private API keys)
  app.get('/api/admin/keys', (_req: Request, res: Response) => {
    const sanitized = keyStore.map(k => ({
      id: k.id,
      maskedKey: k.maskedKey,
      addedAt: k.addedAt,
      usedCount: k.usedCount,
      maxQuota: k.maxQuota,
      status: k.status,
      label: k.label || `Key #${k.id.slice(-4)}`,
      lastUsedAt: k.lastUsedAt,
      remaining: Math.max(0, k.maxQuota - k.usedCount)
    }));

    const activeKeys = keyStore.filter(k => k.status === 'active' && k.usedCount < k.maxQuota);
    const exhaustedKeys = keyStore.filter(k => k.status === 'exhausted' || k.usedCount >= k.maxQuota);
    const totalTokensRemaining = activeKeys.reduce((acc, curr) => acc + Math.max(0, curr.maxQuota - curr.usedCount), 0);
    const totalImagesGenerated = keyStore.reduce((acc, curr) => acc + curr.usedCount, 0);

    res.json({
      keys: sanitized,
      stats: {
        totalKeys: keyStore.length,
        activeKeys: activeKeys.length,
        exhaustedKeys: exhaustedKeys.length,
        totalTokensRemaining,
        totalImagesGenerated,
        currentActiveKeyId: activeKeys[0]?.id || null
      }
    });
  });

  // Get Admin Stats
  app.get('/api/admin/stats', (_req: Request, res: Response) => {
    const activeKeys = keyStore.filter(k => k.status === 'active' && k.usedCount < k.maxQuota);
    const exhaustedKeys = keyStore.filter(k => k.status === 'exhausted' || k.usedCount >= k.maxQuota);
    const totalTokensRemaining = activeKeys.reduce((acc, curr) => acc + Math.max(0, curr.maxQuota - curr.usedCount), 0);
    const totalImagesGenerated = keyStore.reduce((acc, curr) => acc + curr.usedCount, 0);

    res.json({
      totalKeys: keyStore.length,
      activeKeys: activeKeys.length,
      exhaustedKeys: exhaustedKeys.length,
      totalTokensRemaining,
      totalImagesGenerated
    });
  });

  // Add API keys (Single or bulk lines)
  app.post('/api/admin/keys', (req: Request, res: Response) => {
    const { keysText } = req.body;
    if (!keysText || typeof keysText !== 'string') {
      return res.status(400).json({ error: 'keysText is required' });
    }

    const rawTokens = keysText
      .split(/[\n,;]+/)
      .map(k => k.trim())
      .filter(k => k.length > 5);

    if (rawTokens.length === 0) {
      return res.status(400).json({ error: 'No valid API keys found in input' });
    }

    let addedCount = 0;
    const now = Date.now();

    for (const rawKey of rawTokens) {
      const existing = keyStore.find(k => k.key === rawKey);
      if (!existing) {
        const id = 'key_' + Math.random().toString(36).substring(2, 9);
        keyStore.push({
          id,
          key: rawKey,
          maskedKey: maskKey(rawKey),
          addedAt: now,
          usedCount: 0,
          maxQuota: 100, // 100 images per key constraint
          status: 'active',
          label: `Lumina Key #${keyStore.length + 1}`
        });
        addedCount++;
      }
    }

    saveKeys(keyStore);

    res.json({
      success: true,
      addedCount,
      totalKeys: keyStore.length
    });
  });

  // Delete single key via REST DELETE
  app.delete('/api/admin/keys/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const beforeCount = keyStore.length;
    keyStore = keyStore.filter(k => k.id !== id);
    saveKeys(keyStore);
    res.json({ success: true, deleted: beforeCount > keyStore.length });
  });

  // Batch delete or purge exhausted keys
  app.post('/api/admin/keys/delete', (req: Request, res: Response) => {
    const { keyIds, purgeExhausted } = req.body;

    if (purgeExhausted) {
      const beforeCount = keyStore.length;
      keyStore = keyStore.filter(k => k.status !== 'exhausted' && k.usedCount < k.maxQuota);
      saveKeys(keyStore);
      return res.json({ success: true, deletedCount: beforeCount - keyStore.length });
    }

    if (Array.isArray(keyIds) && keyIds.length > 0) {
      const beforeCount = keyStore.length;
      keyStore = keyStore.filter(k => !keyIds.includes(k.id));
      saveKeys(keyStore);
      return res.json({ success: true, deletedCount: beforeCount - keyStore.length });
    }

    return res.status(400).json({ error: 'No key IDs or purge action provided' });
  });

  // ------------------------------------------
  // IMAGE GENERATION ENDPOINT
  // ------------------------------------------
  // Rate limited: 30 requests per minute per IP
  app.post('/api/generate-image', rateLimiter(30, 60000), async (req: Request, res: Response) => {
    const startTime = Date.now();
    const { prompt, style = 'Realistic', aspectRatio = '1:1' } = req.body;

    // Strict input validation
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ success: false, error: 'Prompt is required' });
    }

    const trimmedPrompt = prompt.trim();
    if (trimmedPrompt.length > 2000) {
      return res.status(400).json({ success: false, error: 'Prompt is too long (maximum 2000 characters)' });
    }

    const words = trimmedPrompt.split(/\s+/).filter(Boolean).length;
    const chars = trimmedPrompt.length;

    let enhancedPrompt = trimmedPrompt;
    if (style === 'Realistic') {
      enhancedPrompt = `${trimmedPrompt}, highly detailed, sharp focus, 8k resolution, cinematic lighting`;
    }

    let activeKeyIndex = keyStore.findIndex(k => k.status === 'active' && k.usedCount < k.maxQuota);
    let keySucceeded = false;
    let finalImageUrl = '';
    let engineUsed = 'Lumina Multi-Key Diffusion';
    let keyIdUsed = '';

    // Clipdrop Multi-Key Rotation Engine (100 images per key limit)
    while (activeKeyIndex !== -1 && !keySucceeded) {
      const activeKey = keyStore[activeKeyIndex];
      try {
        const form = new FormData();
        form.append('prompt', enhancedPrompt);

        const clipdropRes = await fetch('https://clipdrop-api.co/text-to-image/v1', {
          method: 'POST',
          headers: {
            'x-api-key': activeKey.key
          },
          body: form
        });

        if (clipdropRes.ok) {
          const arrayBuffer = await clipdropRes.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const base64 = buffer.toString('base64');
          finalImageUrl = `data:image/png;base64,${base64}`;

          // Atomic quota increment
          activeKey.usedCount += 1;
          activeKey.lastUsedAt = Date.now();

          // Mark exhausted if 100 images reached
          if (activeKey.usedCount >= activeKey.maxQuota) {
            activeKey.status = 'exhausted';
          }

          saveKeys(keyStore);
          keySucceeded = true;
          engineUsed = 'Lumina Multi-Key Diffusion';
          keyIdUsed = activeKey.id;
          break;
        } else {
          // If key is invalid or quota exhausted, auto-exhaust & rotate
          if ([401, 402, 403, 429].includes(clipdropRes.status)) {
            activeKey.status = 'exhausted';
            saveKeys(keyStore);
          }
          activeKeyIndex = keyStore.findIndex(k => k.status === 'active' && k.usedCount < k.maxQuota);
        }
      } catch (err) {
        if (activeKey) {
          activeKey.status = 'exhausted';
          saveKeys(keyStore);
        }
        activeKeyIndex = keyStore.findIndex(k => k.status === 'active' && k.usedCount < k.maxQuota);
      }
    }

    // High-Res Neural Fallback Engine if no keys currently registered or external network error
    if (!keySucceeded) {
      let width = 1024;
      let height = 1024;
      if (aspectRatio === '16:9') { width = 1280; height = 720; }
      else if (aspectRatio === '9:16') { width = 720; height = 1280; }
      else if (aspectRatio === '4:3') { width = 1024; height = 768; }
      else if (aspectRatio === '3:2') { width = 1200; height = 800; }

      const seed = Math.floor(Math.random() * 1000000);

      try {
        const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=${width}&height=${height}&seed=${seed}&nologo=true`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        const pollRes = await fetch(fallbackUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (pollRes.ok) {
          const arrayBuffer = await pollRes.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          finalImageUrl = `data:image/jpeg;base64,${buffer.toString('base64')}`;
          engineUsed = 'Lumina Neural Diffusion';
        }
      } catch {
        // Continue to procedural fallback if needed
      }

      if (!finalImageUrl) {
        return res.status(503).json({
          success: false,
          error: 'Image generation capacity temporarily unavailable. Please try again or add an API key in the admin vault.'
        });
      }
    }

    const latencyMs = Date.now() - startTime;
    const remainingActiveTokens = keyStore
      .filter(k => k.status === 'active' && k.usedCount < k.maxQuota)
      .reduce((acc, curr) => acc + Math.max(0, curr.maxQuota - curr.usedCount), 0);

    return res.json({
      success: true,
      imageUrl: finalImageUrl,
      engineUsed,
      keyIdUsed,
      latencyMs,
      wordCount: words,
      charCount: chars,
      prompt: trimmedPrompt,
      style,
      aspectRatio,
      createdAt: Date.now(),
      remainingTokens: remainingActiveTokens
    });
  });

  // ------------------------------------------
  // VITE & STATIC SERVING
  // ------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Lumina] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
