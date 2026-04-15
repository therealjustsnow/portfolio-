# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

This is a static portfolio site deployed on **Cloudflare Pages** with no build step, bundler, or package manager. There is no `package.json`.

### Pages

- `index.html` — main single-page portfolio (hero, projects, stack, analytics, schedule, contact)
- `guestbook.html` — standalone guestbook page
- `terminal.html` — interactive fake terminal
- `photography.html` — photography gallery
- `nanobot.html` — project showcase page
- `404.html`, `privacy.html` — utility pages

### JS / CSS

All files in `css/` and `js/` are **pre-minified**. The unminified source does not live in this repo. When editing JS logic, the only files you should touch are:

- `js/guestbook-client.js` — the only non-minified, fully editable JS file; handles all guestbook UI (submit, list, edit, delete, pagination)
- `js/mobile-console.js` — a debug-only console overlay; **must not be loaded in production HTML**

**Do not edit `*.min.js` or `styles.min.css` directly** — changes there will be overwritten or will conflict with the minified format.

### Asset versioning

Static assets use cache-busting query strings (`?v=N`). When making a meaningful change to a file served from `/css/` or `/js/`, increment the version number consistently across every HTML page that references it (e.g. `styles.min.css?v=11` → `?v=12`).

### Backend: Cloudflare Pages Functions + D1

The `functions/` directory is the serverless API, auto-routed by Cloudflare Pages:

```
functions/
  _sanitize.js              # shared server-side input sanitization (imported by both handlers)
  api/
    guestbook.js            # GET (list) + POST (create) → /api/guestbook
    guestbook/[id].js       # PATCH (edit) + DELETE → /api/guestbook/:id
```

The D1 database binding is `env.DB`. The schema is in `schema.sql` — apply it with:

```bash
wrangler d1 execute guestbook-db --file=schema.sql --remote
```

### Guestbook auth model

- On POST, a random 32-byte token is generated, its SHA-256 hash is stored in `token_hash`, and the raw token is returned to the client **once**.
- The client stores the raw token in `localStorage` keyed by entry ID (`snow_gb_tokens`).
- PATCH / DELETE supply the raw token; the server re-hashes and compares using a constant-time comparison (`safeEqual`) to prevent timing attacks.
- Rate limiting: 3 posts per IP per hour, tracked in the `rate_limits` table with a sweep-on-write strategy.

### Why `app.min.js` is excluded from `guestbook.html`

`app.min.js` and `guestbook-client.js` both declare top-level variables with the same names. Loading both causes runtime errors. `guestbook.html` intentionally omits `app.min.js` and includes `guestbook-client.js` instead, which redefines the same global API (`submitGuestbook`, `renderGuestbookEntries`, etc.).

## Deployment

Push to the tracked branch triggers a Cloudflare Pages build. There is no CI test suite. The `_headers` file controls HTTP response headers and cache policies:

- `/css/*`, `/js/*`, `/photos/*`, `/previews/*` — `max-age=31536000, immutable`
- `/*.html` — `max-age=0, must-revalidate`

## Key Conventions

- **No framework, no npm.** Everything is vanilla HTML/CSS/JS.
- **Accent color theming** is driven by a CSS custom property `--accent-rgb`. The color picker and theme logic live in `js/theme.min.js`.
- **`glass` CSS class** is the shared frosted-glass card style used across all pages.
- **Section reveal animations** use the `reveal` / `reveal-delay-N` classes, triggered by an IntersectionObserver in `js/effects.min.js`.
- **Cookie consent** is checked in an inline `<script>` at the top of every page before Google Analytics (`G-559BWJ6T8E`) loads. Consent is stored in `localStorage` as `cookie-consent` (`"accepted"` or `"declined"`).
- **`mobile-console.js` is debug-only** — never add it to a `<script>` tag in any committed HTML page.
- When adding a new standalone page, replicate the nav, color-popup, cookie-banner, cookie-modal, cursor-glow, scroll-top, and cookie-settings-btn blocks from an existing page (e.g. `guestbook.html`) for consistency.
