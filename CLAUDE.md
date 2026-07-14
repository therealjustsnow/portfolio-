# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

Static portfolio site deployed on **Cloudflare Pages** with no build step, bundler, or package manager. No `package.json`.

### Pages

| File | Description |
|------|-------------|
| `index.html` | Main portfolio: hero, projects grid, tech stack, analytics, schedule, contact, TI-83 overlay |
| `guestbook.html` | Standalone guestbook with submit form, entry list, edit/delete |
| `terminal.html` | Interactive fake terminal emulator with hint buttons |
| `photography.html` | Photo gallery grid with lightbox modal |
| `nanobot.html` | NanoBot Discord bot project showcase |
| `nanobot-docs.html` | NanoBot documentation hub (links to `docs/` subpages) |
| `404.html` | Error page with terminal-style message |
| `privacy.html` | Privacy policy document |

### docs/ Directory

Static documentation subpages for NanoBot, served as plain HTML/CSS:

```
docs/
  commands.html
  faq.html
  self-hosting.html
  styles.css
  app.js
```

### External Submodule

`external/NanoBot/` is a git submodule pointing to `https://github.com/therealjustsnow/NanoBot`. It is empty in local checkouts unless initialized with `git submodule update --init`.

### NanoBot Command Count

The command totals shown on `nanobot-docs.html` (the "By the numbers" stat cards) and the `Commands` stat on `nanobot.html` are **not hand-counted** — they are produced by `scripts/count-commands.py`, which statically parses the NanoBot cog source with `ast`.

```bash
# Print counts as JSON (point at a NanoBot checkout — the dir containing cogs/)
scripts/count-commands.py external/NanoBot

# Also rewrite nanobot-docs.html (stat cards + prose breakdown + notes) in place
scripts/count-commands.py external/NanoBot --update nanobot-docs.html

# Also rewrite the single "Commands" stat card on nanobot.html in place
scripts/count-commands.py external/NanoBot --update nanobot-docs.html --update-total nanobot.html
```

**Counting rules** (see the script docstring for detail):
- Every `@command` / `@hybrid_command` / `@hybrid_group` / `@<group>.command` decorator on a direct Cog method counts once.
- Each entry in `cogs/fun/actions.py`'s `_SOCIAL_ACTIONS` / `_REACT_ACTIONS` dicts is a dynamically-registered prefix command and counts once (this is the `dynamic` field; all are public).
- **Owner** = cog gated by a `cog_check` calling `is_owner`, or `@commands.is_owner` on the command. **Restricted** = has a permission-check decorator or lives under a Group/`hybrid_group` with `default_permissions`. **Public** = everything else.
- `total = public + restricted + owner`.

**Critical gotcha:** the script must walk cogs with `rglob("*.py")`, not `glob("*.py")`. NanoBot reorganized its larger cogs into packages (`cogs/admin/`, `cogs/fun/`, `cogs/music/`, `cogs/moderation/`, `cogs/utility/`); a flat `glob` silently skips every command inside those subpackages (it once reported 130 instead of the real total). The script aborts if the total comes back under 50 as a guard against this.

When NanoBot changes, re-run the script. `--update` syncs `nanobot-docs.html` (stat cards, prose breakdown, and "part of the N public" notes) and `--update-total` syncs the `Commands` stat on `nanobot.html` — both are numeric-only and safe to automate (the `check-nanobot-updates.yml` workflow runs both). Adding any new command **categories** to `docs/commands.html` is still a manual review step. The submodule clone may be blocked by the sandbox proxy — in that case fetch a tarball (`https://codeload.github.com/therealjustsnow/NanoBot/tar.gz/refs/heads/main`) and run the script against the extracted dir.

> Current counts (NanoBot `main`, last sync): **381 total** — 200 public, 160 restricted, 21 owner (59 dynamic fun commands included in public).

### JS / CSS

All files in `css/` and `js/` are **pre-minified**. Unminified source does not live in this repo. Only touch these files for JS logic changes:

- `js/guestbook-client.js` — **only fully editable JS file**; handles all guestbook UI (submit, list, edit, delete, pagination, token storage)
- `js/mobile-console.js` — debug-only console overlay; **must not be loaded in any committed HTML page**

**Do not edit `*.min.js` or `styles.min.css` directly** — changes will conflict with minified format.

#### All JS Files Reference

| File | Size | Editable | Purpose |
|------|------|----------|---------|
| `app.min.js` | 34K | No | Projects data, stack, schedule, contact, modals, time bar, cookie settings |
| `projects.min.js` | 12K | No | Projects grid rendering, modal population, GitHub commits fetching |
| `theme.min.js` | 5.0K | No | Accent color picker, HSL/RGB conversion, localStorage persistence |
| `ti83.min.js` | 6.2K | No | TI-83 calculator emulator (graph, roots, solve) |
| `effects.min.js` | 1.7K | No | IntersectionObserver reveal animations |
| `analytics.min.js` | 1.4K | No | Google Analytics integration, visitor insights |
| `guestbook-client.js` | 11K | **Yes** | All guestbook UI logic |
| `mobile-console.js` | 4.1K | Yes (debug) | Debug overlay — never commit to HTML |

### Asset Versioning

Static assets use cache-busting query strings (`?v=N`). When making a meaningful change to any file in `/css/` or `/js/`, increment the version number consistently across **every HTML page** that references it.

**Current versions (as of last update):**

| Asset | Version |
|-------|---------|
| `styles.min.css` | `v=11` (all pages except `privacy.html` which uses `v=10`) |
| `app.min.js` | `v=11` |
| `projects.min.js` | `v=10` |
| `analytics.min.js` | `v=10` |
| `effects.min.js` | `v=10` |
| `theme.min.js` | `v=10` |
| `guestbook-client.js` | `v=3` |
| `previews/selfie.webp` | `v=2` |

> Note: `privacy.html` lags on `styles.min.css?v=10` — sync to `v=11` when next updating that page.

### Backend: Cloudflare Pages Functions + D1

The `functions/` directory is the serverless API, auto-routed by Cloudflare Pages:

```
functions/
  _sanitize.js              # shared server-side input sanitization (imported by both handlers)
  api/
    guestbook.js            # GET (list) + POST (create) → /api/guestbook
    guestbook/[id].js       # PATCH (edit) + DELETE → /api/guestbook/:id
```

D1 database binding: `env.DB`. Schema lives in `schema.sql`:

```sql
CREATE TABLE IF NOT EXISTS entries (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  message     TEXT    NOT NULL,
  token_hash  TEXT    NOT NULL,
  created_at  TEXT    NOT NULL,
  edited_at   TEXT
);

CREATE TABLE IF NOT EXISTS rate_limits (
  ip           TEXT    PRIMARY KEY,
  count        INTEGER NOT NULL DEFAULT 1,
  window_start INTEGER NOT NULL  -- unix timestamp of first request in window
);
```

Apply schema:

```bash
wrangler d1 execute guestbook-db --file=schema.sql --remote
```

There is no `wrangler.toml` in this repo — Cloudflare project settings are configured in the Cloudflare dashboard.

### Guestbook Auth Model

- POST generates a random 32-byte token; stores SHA-256 hash in `token_hash`; returns raw token to client **once**.
- Client stores raw token in `localStorage` keyed by entry ID (`snow_gb_tokens`).
- PATCH / DELETE supply the raw token; server re-hashes and compares via `safeEqual()` (constant-time to prevent timing attacks).
- Rate limiting: 3 posts per IP per hour, tracked in `rate_limits` with sweep-on-write strategy.

### Input Sanitization (`functions/_sanitize.js`)

All user input passes through `sanitizeField(raw, maxLen)` which:
1. `stripTags()` — removes `<>` and HTML entities
2. `blockDangerousSchemes()` — blocks `javascript:`, `data:`, `vbscript:`, `blob:`, `file:` (including whitespace-evasion variants)
3. `blockEmbeds()` — blocks `iframe`, `object`, `embed`, `applet`, `form`, event handlers, numeric HTML entities
4. `normalizeWhitespace()` — collapses runs, caps newlines at 2
5. Throws `ContentError` on rejection

### Why `app.min.js` Is Excluded from `guestbook.html`

`app.min.js` and `guestbook-client.js` both declare top-level variables with the same names. Loading both causes runtime errors. `guestbook.html` intentionally omits `app.min.js` and includes `guestbook-client.js` instead.

## Deployment

Push to the tracked branch triggers a Cloudflare Pages build. No CI test suite.

### HTTP Headers (`_headers`)

**Global (all routes):**
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

**Cache policies:**
- `/css/*`, `/js/*`, `/photos/*`, `/previews/*` — `max-age=31536000, immutable`
- `/*.html` — `max-age=0, must-revalidate`
- `/sitemap.xml`, `/robots.txt` — `max-age=86400`

## Key Conventions

- **No framework, no npm.** Everything is vanilla HTML/CSS/JS.
- **Accent color theming** is driven by CSS custom property `--accent-rgb`. Color picker and theme logic live in `js/theme.min.js`.
- **`glass` CSS class** is the shared frosted-glass card style used across all pages.
- **Section reveal animations** use `reveal` / `reveal-delay-N` classes, triggered by IntersectionObserver in `js/effects.min.js`.
- **Cookie consent** is checked in an inline `<script>` at the top of every page before Google Analytics (`G-559BWJ6T8E`) loads. Consent stored in `localStorage` as `cookie-consent` (`"accepted"` or `"declined"`).
- **`mobile-console.js` is debug-only** — never add it to a `<script>` tag in any committed HTML page.
- **New standalone pages** must replicate: nav, color-popup, cookie-banner, cookie-modal, cursor-glow, scroll-top, and cookie-settings-btn blocks from an existing page (e.g. `guestbook.html`).
- **Static assets** (photos, previews): WebP format preferred. Images live in `photos/` and `previews/`.
- **`resume.pdf`** is served directly from the repo root.

## Design Context

Strategic and visual design context for this site lives in two root files — read them before any design/UI work:

- **`PRODUCT.md`** — register: `brand` (portfolio primary; NanoBot landing + docs are sibling surfaces). Personality: playful, curious, hands-on. Positioning: personality-first developer — the site itself is the resume. Belief ladder: fun → curious → capable. Primary CTA: resume; fallback: explore the toys. Anti-references: generic template portfolio, corporate SaaS landing, overdone hacker aesthetic. Accessibility: WCAG AA.
- **`DESIGN.md`** — visual system ("The Midnight Arcade"): Void dark bg + Neon Amethyst (#a855f7) accent, glass cabinets, Syne/DM Sans/JetBrains Mono. Key rules: never hardcode the accent (always `rgba(var(--accent-rgb), α)`); glow/lift only on interactive elements; phosphor green stays inside TI-83/terminal. Machine-readable tokens in the frontmatter and `.impeccable/design.json`.
