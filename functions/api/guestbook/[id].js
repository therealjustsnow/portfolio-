// functions/api/guestbook/[id].js
// Handles PATCH (edit) and DELETE for a single entry.
// Auth: SHA-256 hash of the client token vs. the stored hash.

import { sanitizeField, ContentError } from '../../_sanitize.js';

async function hashToken(token) {
  const buf  = new TextEncoder().encode(token);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, '0')).join('');
}

// Constant-time string comparison to avoid timing attacks on token comparison.
function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function parseBody(request) {
  try { return await request.json(); }
  catch { return null; }
}

async function verifyToken(env, id, token) {
  const entry = await env.DB.prepare(
    'SELECT id, token_hash FROM entries WHERE id = ?'
  ).bind(id).first();

  if (!entry) return { ok: false, status: 404, error: 'Entry not found.' };

  const supplied = await hashToken(token);
  if (!safeEqual(entry.token_hash, supplied)) {
    return { ok: false, status: 403, error: 'Unauthorized.' };
  }

  return { ok: true };
}

// ── PATCH /api/guestbook/:id ───────────────────────────────────────────────

export async function onRequestPatch({ request, env, params }) {
  const id = parseInt(params.id);
  if (isNaN(id)) return json({ error: 'Invalid entry ID.' }, 400);

  const body = await parseBody(request);
  if (!body)          return json({ error: 'Invalid JSON.' }, 400);
  if (!body.token)    return json({ error: 'Missing token.' }, 400);
  if (!body.message)  return json({ error: 'Missing message.' }, 400);

  let newMessage;
  try {
    newMessage = sanitizeField(body.message, 200);
  } catch (err) {
    if (err instanceof ContentError) return json({ error: err.message }, 400);
    throw err;
  }
  if (!newMessage) return json({ error: 'Message cannot be empty.' }, 400);

  try {
    const auth = await verifyToken(env, id, body.token);
    if (!auth.ok) return json({ error: auth.error }, auth.status);

    const editedAt = new Date().toISOString();
    await env.DB.prepare(
      'UPDATE entries SET message = ?, edited_at = ? WHERE id = ?'
    ).bind(newMessage, editedAt, id).run();

    return json({ id, message: newMessage, edited_at: editedAt });

  } catch (err) {
    console.error('PATCH /api/guestbook/[id]:', err);
    return json({ error: 'Failed to update entry.' }, 500);
  }
}

// ── DELETE /api/guestbook/:id ─────────────────────────────────────────────

export async function onRequestDelete({ request, env, params }) {
  const id = parseInt(params.id);
  if (isNaN(id)) return json({ error: 'Invalid entry ID.' }, 400);

  const body = await parseBody(request);
  if (!body)       return json({ error: 'Invalid JSON.' }, 400);
  if (!body.token) return json({ error: 'Missing token.' }, 400);

  try {
    const auth = await verifyToken(env, id, body.token);
    if (!auth.ok) return json({ error: auth.error }, auth.status);

    await env.DB.prepare('DELETE FROM entries WHERE id = ?').bind(id).run();
    return json({ deleted: true });

  } catch (err) {
    console.error('DELETE /api/guestbook/[id]:', err);
    return json({ error: 'Failed to delete entry.' }, 500);
  }
}
