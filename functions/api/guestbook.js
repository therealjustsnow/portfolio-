// functions/api/guestbook.js
// Handles GET (list entries) and POST (create entry).
// Bound to D1 via the "DB" binding in Cloudflare Pages settings.

import { sanitizeField, ContentError } from '../_sanitize.js';

const RATE_LIMIT  = 3;        // max posts per IP per window
const RATE_WINDOW = 60 * 60;  // 1 hour in seconds
const PAGE_MAX    = 100;

async function hashToken(token) {
  const buf  = new TextEncoder().encode(token);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// ── GET /api/guestbook?limit=100&offset=0 ─────────────────────────────────

export async function onRequestGet({ request, env }) {
  const url    = new URL(request.url);
  const limit  = Math.min(parseInt(url.searchParams.get('limit')  || '100'), PAGE_MAX);
  const offset = Math.max(parseInt(url.searchParams.get('offset') || '0'), 0);

  try {
    const { results } = await env.DB.prepare(
      `SELECT id, name, message, created_at, edited_at
         FROM entries
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?`
    ).bind(limit, offset).all();

    return json(results);
  } catch (err) {
    console.error('GET /api/guestbook:', err);
    return json({ error: 'Failed to fetch entries.' }, 500);
  }
}

// ── POST /api/guestbook ────────────────────────────────────────────────────

export async function onRequestPost({ request, env }) {
  const ip  = request.headers.get('CF-Connecting-IP') || 'unknown';
  const now = Math.floor(Date.now() / 1000);

  try {
    // Sweep expired rows, then check current IP.
    await env.DB.prepare(
      'DELETE FROM rate_limits WHERE window_start < ?'
    ).bind(now - RATE_WINDOW).run();

    const rl = await env.DB.prepare(
      'SELECT count FROM rate_limits WHERE ip = ?'
    ).bind(ip).first();

    if (rl && rl.count >= RATE_LIMIT) {
      return json({ error: 'Too many submissions. Please wait an hour and try again.' }, 429);
    }

    // Parse body.
    let body;
    try { body = await request.json(); }
    catch { return json({ error: 'Invalid JSON.' }, 400); }

    // Sanitize -- throws ContentError if malicious content is detected.
    let name, message;
    try {
      name    = sanitizeField(body.name,    40);
      message = sanitizeField(body.message, 200);
    } catch (err) {
      if (err instanceof ContentError) return json({ error: err.message }, 400);
      throw err;
    }

    if (!name)    return json({ error: 'Name is required.'        }, 400);
    if (!message) return json({ error: 'Message cannot be empty.' }, 400);

    // Store token hash only -- raw token is returned to client once and never stored.
    const token      = generateToken();
    const tokenHash  = await hashToken(token);
    const createdAt  = new Date().toISOString();

    const entry = await env.DB.prepare(
      `INSERT INTO entries (name, message, token_hash, created_at)
            VALUES (?, ?, ?, ?)
       RETURNING id, name, message, created_at, edited_at`
    ).bind(name, message, tokenHash, createdAt).first();

    // Update rate limit counter.
    if (rl) {
      await env.DB.prepare(
        'UPDATE rate_limits SET count = count + 1 WHERE ip = ?'
      ).bind(ip).run();
    } else {
      await env.DB.prepare(
        'INSERT INTO rate_limits (ip, count, window_start) VALUES (?, 1, ?)'
      ).bind(ip, now).run();
    }

    return json({ ...entry, token }, 201);

  } catch (err) {
    console.error('POST /api/guestbook:', err);
    return json({ error: 'Failed to submit entry.' }, 500);
  }
}
