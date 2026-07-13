---
name: snowbuilds.dev
description: A midnight arcade of hand-built web toys — dark glass, Neon Amethyst glow, everything clickable begs to be pressed.
colors:
  neon-amethyst: "#a855f7"
  amethyst-deep: "#7c3aed"
  void: "#05060f"
  nebula-violet: "#1a0533"
  nebula-abyss: "#0d0221"
  nebula-indigo: "#1e1040"
  moonlight: "#e2e8f0"
  glass-white: "#ffffff0f"
  glass-border: "#ffffff1f"
  signal-red: "#ef4444"
  phosphor-green: "#00ff41"
typography:
  display:
    fontFamily: "Syne, sans-serif"
    fontSize: "clamp(3.5rem, 8vw, 6.5rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Syne, sans-serif"
    fontSize: "clamp(2rem, 5vw, 3.2rem)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Syne, sans-serif"
    fontSize: "clamp(1.6rem, 4vw, 2.2rem)"
    fontWeight: 800
    lineHeight: 1.1
  body:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "0.72rem"
    fontWeight: 400
    letterSpacing: "0.04em"
rounded:
  card: "16px"
  button: "10px"
  input: "10px"
  chip: "7px"
  micro: "4px"
spacing:
  xs: "0.5rem"
  sm: "1rem"
  md: "1.75rem"
  lg: "2.5rem"
  xl: "4rem"
components:
  button-primary:
    backgroundColor: "{colors.amethyst-deep}"
    textColor: "#ffffff"
    rounded: "{rounded.button}"
    padding: "0.6rem 1.4rem"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "#ffffffb3"
    rounded: "{rounded.button}"
    padding: "0.6rem 1.4rem"
  input:
    backgroundColor: "#ffffff0d"
    textColor: "{colors.moonlight}"
    rounded: "{rounded.input}"
    padding: "0.65rem 0.9rem"
  card-glass:
    backgroundColor: "{colors.glass-white}"
    textColor: "{colors.moonlight}"
    rounded: "{rounded.card}"
---

# Design System: snowbuilds.dev

## 1. Overview

**Creative North Star: "The Midnight Arcade"**

A dark room full of glowing machines, and every cabinet is playable. The site is a deep-space void (#05060f) washed by drifting violet nebulae, with frosted-glass cabinets floating above it. The signature Neon Amethyst (#a855f7) is not decoration — it is the arcade's light source, and light means *touch me*. The whole system exists to make a visitor play first and realize the skill second: PRODUCT.md's belief ladder is "fun → curious → capable," and the visuals carry step one.

This system explicitly rejects the generic template portfolio (skill bars, identical card grids, stock hero), the corporate SaaS landing (enterprise gradients, stat rows), and the overdone hacker aesthetic (Matrix rain, wall-to-wall neon green mono). The arcade is playful and hand-built, never edgy or enterprise. Phosphor green exists in exactly two cabinets — the TI-83 and the terminal — as a deliberate in-world joke, not a site theme.

The single most important mechanic: **the accent is a live variable.** Visitors re-theme the entire site through the color picker; `--accent-rgb` cascades everywhere. Purple is the default personality, not a constant.

**Key Characteristics:**
- Deep-space dark, always — glass surfaces over a nebula gradient, never flat panels on gray.
- Neon Amethyst glow = interactivity. Glow is a promise that something happens when you click.
- Syne 800 display voice: wide, geometric, confident; JetBrains Mono whispers the technical labels.
- Tactile and eager — hover states lift, brighten, and respond fast (0.15–0.3s ease-out).
- Honest affordances: static content never borrows interactive styling.

## 2. Colors

A committed dark palette: one saturated signature accent over a violet-black void, with white-at-opacity doing all neutral work.

### Primary
- **Neon Amethyst** (#a855f7 / `--accent`, `--accent-rgb: 168, 85, 247`): the brand's light source. Used for interactive borders, focus rings, hover glows, link underlines, and active states. Almost always applied as `rgba(var(--accent-rgb), α)` at α .08–.4 for fills/borders, full strength for text on dark.
- **Amethyst Deep** (#7c3aed / `--accent-dark`): solid fill for primary buttons, where full-saturation Neon Amethyst would vibrate against white text.

### Neutral
- **Void** (#05060f): the body background beneath everything; also the nav's blur tint at 60% opacity.
- **Nebula ramp** — Abyss (#0d0221), Violet (#1a0533), Indigo (#1e1040): the fixed radial-gradient backdrop (`--g1/--g2/--g3`). Atmosphere only; never used on components.
- **Moonlight** (#e2e8f0): default body text.
- **Glass White** (rgba(255,255,255,.06) bg / .12 border): the frosted-cabinet surface pair behind every `.glass` card.
- White-at-opacity does all secondary text: `.85` nav-active, `.65` body-secondary, `.45` disabled/meta. Never introduce a gray hex.

### Tertiary
- **Signal Red** (#ef4444): errors and destructive hover only (invalid inputs, guestbook delete).
- **Phosphor Green** (#00ff41): quarantined to the TI-83 and terminal toys. Prohibited anywhere else.

### Named Rules
**The Live Accent Rule.** Never hardcode purple. Every accent usage goes through `rgba(var(--accent-rgb), α)` or `var(--accent)` / `var(--accent-dark)`, because the visitor's color picker re-themes the site at runtime. A hex-coded #a855f7 in a component is a bug.

**The Quarantine Rule.** Phosphor Green lives inside the TI-83 and terminal cabinets and nowhere else. One leak and the site becomes the hacker cliché PRODUCT.md bans.

## 3. Typography

**Display Font:** Syne (weights 700/800, with sans-serif fallback)
**Body Font:** DM Sans (weights 400/500, with sans-serif fallback)
**Label/Mono Font:** JetBrains Mono (weights 400/700, with monospace fallback)

**Character:** Syne's wide, slightly-alien geometry gives headings arcade-marquee confidence; DM Sans stays friendly and invisible underneath; JetBrains Mono marks the machine surfaces — inputs, terminal output, technical metadata. Three voices, never blended: a heading is never mono, body copy is never Syne.

### Hierarchy
- **Display** (Syne 800, clamp(3.5rem, 8vw, 6.5rem), line-height 0.95, letter-spacing -0.04em): hero title only.
- **Headline** (Syne 800, clamp(2rem, 5vw, 3.2rem), letter-spacing -0.03em, line-height 1): section titles.
- **Title** (Syne 800, clamp(1.6rem, 4vw, 2.2rem)): card/CTA-box headings.
- **Body** (DM Sans 400, ~0.9rem, line-height 1.65): prose and descriptions; secondary body at white/.65.
- **Label** (JetBrains Mono 400, 0.7–0.85rem, letter-spacing 0.04em): inputs, terminal text, metadata; nav links are DM Sans 500 0.85rem uppercase with the same tracking.

### Named Rules
**The Marquee Rule.** Syne appears at weight 700+ only. There is no "light Syne"; the display voice is always fully lit.

**The Tracking Floor.** Display letter-spacing never goes below -0.04em (current hero value is the floor, not a starting point).

## 4. Elevation

**Glow is depth.** Structural shadows stay ambient and dark — every glass cabinet carries the same `0 8px 32px rgba(0,0,0,.35)` plus an inset top highlight (`inset 0 1px 0 rgba(255,255,255,.1)`) suggesting light from above. Hierarchy and lift are signaled by *accent glow*, not by bigger dark shadows: a hovered card border brightens toward `rgba(var(--accent-rgb), .5)`, a primary button carries `0 4px 20px rgba(var(--accent-rgb), .4)` rising to `0 8px 28px @ .55` on hover. Depth layering also comes from backdrop blur: page background (z -2) → glass cards (blur 14px) → fixed nav (blur 18px) → modals.

### Shadow Vocabulary
- **Cabinet ambient** (`box-shadow: 0 8px 32px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.1)`): every `.glass` surface, at rest and hover. Never varies.
- **Interactive glow** (`box-shadow: 0 4px 20px rgba(var(--accent-rgb),.4)`): primary buttons at rest.
- **Eager glow** (`box-shadow: 0 8px 28px rgba(var(--accent-rgb),.55)` + `translateY(-2px)`): primary buttons on hover.
- **Focus ring** (`box-shadow: 0 0 0 2px rgba(var(--accent-rgb),.18)` + accent border): focused inputs; swap accent for Signal Red on invalid.

### Named Rules
**The Honest Glow Rule.** Accent glow, hover lift, and brightening borders are reserved for elements that respond to a click or keypress. Static content never glows, never lifts, never shows a pointer cursor. A false affordance is a broken promise in an arcade.

## 5. Components

Tactile and eager — but only what's clickable. Interactive elements react within 150–300ms with glow, lift, or border-brightening; everything else holds still.

### Buttons
- **Shape:** softly rounded (10px), inline-flex with 0.5rem icon gap; DM Sans 600 at 0.85rem with 0.05em tracking.
- **Primary:** solid Amethyst Deep (#7c3aed) fill, white text, resting interactive glow (see Elevation), padding 0.6rem 1.4rem.
- **Hover / Focus:** lifts -2px with eager glow; all transitions 0.25s ease.
- **Ghost:** transparent fill, white/.7 text, 1px border at `rgba(var(--accent-rgb),.35)`; hover fills `rgba(var(--accent-rgb),.12)`, text to white, border to α .7.
- **Micro-actions** (guestbook edit/delete): near-invisible at rest (white/.12 border, white/.45 text, 4px radius); hover reveals intent — accent for edit, Signal Red for delete.

### Cards / Containers
- **Corner Style:** 16px (`--card-radius`).
- **Background:** Glass White fill with 14px backdrop blur.
- **Border:** 1px `rgba(var(--accent-rgb),.2)` — the accent-tinted edge is what makes glass feel lit from within.
- **Shadow Strategy:** cabinet ambient, always (see Elevation). Interactive cards brighten their border on hover instead of growing shadow.
- **Internal Padding:** ~1.75–3rem desktop, tightening on mobile.

### Inputs / Fields
- **Style:** glass fill (white/.05–.06), 1px border (accent-tinted .2 on guestbook, white/.14 on utility inputs), 10px radius, mono or DM Sans per context.
- **Focus:** border to `rgba(var(--accent-rgb),.7)` + focus ring (Elevation). Never remove the outline without this replacement.
- **Error:** Signal Red border + red-tinted ring on `.invalid`.

### Navigation
- Fixed 64px bar, Void at 60% opacity under 18px blur, 1px accent-tinted bottom border.
- Links: DM Sans 500, 0.85rem, uppercase, white/.65 → white on hover, with a 2px accent underline animating width 0→100% (0.3s).
- Mobile: hamburger opens stacked full-width links at 1rem with hairline separators.

### The Cabinets (signature)
Self-contained toys with their own in-world skins: the TI-83 (phosphor green on #001a08, 3–4px radii, mono everything) and the terminal. Each cabinet's interior may break site typography and color rules — that's the joke — but its outer shell is still a glass card, and Phosphor Green never escapes (Quarantine Rule).

## 6. Do's and Don'ts

### Do:
- **Do** route every accent color through `rgba(var(--accent-rgb), α)` — the visitor's color picker must re-theme everything (The Live Accent Rule).
- **Do** make every clickable thing eager: glow, lift -2px, or brighten within 150–300ms, `ease` / ease-out only.
- **Do** keep body/secondary text at white/.65 or brighter on Void — that's the WCAG AA floor here; white/.45 is for disabled and meta text only.
- **Do** ship `prefers-reduced-motion` alternatives for every animation, and keep the nebula drift disabled on mobile as it is now.
- **Do** give new pages the full shared shell (nav, color-popup, cookie banner/modal, cursor-glow, scroll-top) so the arcade feels continuous.

### Don't:
- **Don't** put glow, hover lift, or pointer cursors on non-interactive elements — no false affordances (The Honest Glow Rule).
- **Don't** let Phosphor Green (#00ff41) out of the TI-83/terminal cabinets; no Matrix rain, no site-wide neon green mono — PRODUCT.md bans the "overdone hacker aesthetic" by name.
- **Don't** build the "generic template portfolio": no skill bars, no identical icon-heading-text card grids, no stock hero.
- **Don't** drift toward "corporate SaaS landing" moves: no multi-color enterprise gradients, no stat rows, no gradient text.
- **Don't** introduce gray hexes for text or borders — neutrals are white-at-opacity, full stop.
- **Don't** use Syne below weight 700, or track display type tighter than -0.04em.
- **Don't** hand-edit `*.min.js` / `styles.min.css` styling conventions away — extend within the existing token vocabulary (`--accent-rgb`, `.glass`, `reveal`).

## 7. NanoBot Sub-Brand

NanoBot's surfaces (`nanobot.html` landing + `docs/` documentation) are a **sibling brand** to the Midnight Arcade, not a departure from it. They share the Void background, `.glass` cabinets, and the live color-picker, but deliberately diverge on two axes to match the product's own mascot identity:

- **Accent:** NanoBot **blue** is the default — `#1a6cf5` (hero art), rendered via the picker system as `hsl(217, 80%, 58%)` ≈ `rgb(62, 128, 234)`. It matches the mascot logo. The site-wide 🎨 picker still overrides it live; the blue is seeded per-page (inline `:root` + a non-persisting `applyCustomColor(217,1)` on load) so it never leaks to the portfolio's amethyst default.
- **Typography:** NanoBot uses **Bricolage Grotesque** (display) + **Hanken Grotesk** (body), chosen for phone-first legibility, with **JetBrains Mono** for command syntax. These are intentional and distinct from the portfolio's Syne / DM Sans — the detector flags them as "outside DESIGN.md" only because it reads the main-brand tokens; they are sanctioned here.
- **Register:** the landing turns personality up for conversion (primary CTA: *Add to Server*, repeated at the top and bottom); the docs turn it down for clarity (quiet volume). Same voice, different volumes — the "one voice, three volumes" rule from PRODUCT.md.
