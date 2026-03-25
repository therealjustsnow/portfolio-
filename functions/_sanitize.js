// functions/_sanitize.js
// Shared server-side sanitization for guestbook input.
// Imported by guestbook.js and guestbook/[id].js.
// Strategy: treat all input as plain text -- no HTML allowed at all.
// We strip tags, block dangerous URI schemes, and enforce content rules.

// Strip every HTML/XML tag completely, including partial/malformed ones.
function stripTags(str) {
  return str
    .replace(/<[^>]*>?/gm, '')           // full tags: <script>, <img />, etc.
    .replace(/&lt;[^&]*&gt;?/gm, '')     // encoded tags someone pre-encoded
    .replace(/</g, '')                   // stray opening angle brackets
    .replace(/>/g, '');                  // stray closing angle brackets
}

// Block dangerous URI schemes regardless of where they appear in the text.
// Covers javascript:, data:, vbscript:, blob:, and unicode/space evasion.
function blockDangerousSchemes(str) {
  // Normalize: remove whitespace and null bytes that browsers ignore in URIs.
  const normalized = str.replace(/[\x00-\x20\u00ad\u200b-\u200d\ufeff]/g, '');

  const dangerous = [
    /javascript\s*:/i,
    /j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t\s*:/i,   // spaced-out version
    /data\s*:/i,
    /vbscript\s*:/i,
    /blob\s*:/i,
    /file\s*:/i,
  ];

  if (dangerous.some(re => re.test(normalized))) {
    throw new ContentError('Disallowed content detected.');
  }
  return str;
}

// Block embedded iframes, objects, and embeds even if tags were manually typed.
function blockEmbeds(str) {
  const patterns = [
    /\biframe\b/i,
    /\bobject\b/i,
    /\bembed\b/i,
    /\bapplet\b/i,
    /\bbase\b\s+href/i,
    /\bform\b/i,
    /on\w+\s*=/i,        // inline event handlers: onclick=, onerror=, etc.
    /srcdoc\s*=/i,
    /&#/,                // HTML numeric entities (often used to bypass filters)
    /expression\s*\(/i,  // CSS expression() used in old IE XSS
  ];

  if (patterns.some(re => re.test(str))) {
    throw new ContentError('Disallowed content detected.');
  }
  return str;
}

// Normalise whitespace -- collapse runs, trim ends.
function normalizeWhitespace(str) {
  return str
    .replace(/\r\n/g, '\n')
    .replace(/\r/g,   '\n')
    .replace(/[ \t]+/g, ' ')       // collapse horizontal whitespace
    .replace(/\n{3,}/g, '\n\n')    // cap consecutive newlines at 2
    .trim();
}

// Full pipeline. Throws ContentError for rejected content,
// returns clean plain-text string for safe DB insertion and display.
export function sanitizeField(raw, maxLen) {
  let str = String(raw ?? '');
  str = blockDangerousSchemes(str);
  str = stripTags(str);
  str = blockEmbeds(str);
  str = normalizeWhitespace(str);
  if (str.length > maxLen) throw new ContentError(`Too long (max ${maxLen} characters).`);
  return str;
}

export class ContentError extends Error {}
