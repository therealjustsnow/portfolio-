---
target: nanobot-docs.html
total_score: 31
p0_count: 0
p1_count: 1
p2_count: 2
timestamp: 2026-07-12T23-17-12Z
slug: nanobot-docs-html
---
# Critique — nanobot-docs.html (NanoBot docs hub)

Method: dual-agent (A: design review · B: detector + browser evidence)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Sticky nav shows current page (`is-active`); scroll-top appears past 260px |
| 2 | Match System / Real World | 4 | Language is exactly the self-hoster's: intents, `requirements.txt`, Docker, SQLite, `n!tag` |
| 3 | User Control and Freedom | 3 | Nav everywhere, scroll-top, Esc closes mobile menu; no breadcrumb but page is shallow |
| 4 | Consistency and Standards | 3 | Stat labels are `<h2>`, info-card titles `<h3>` for parallel "card" constructs |
| 5 | Error Prevention | 3 | Requirements card pre-empts the "which intents?" failure |
| 6 | Recognition Rather Than Recall | 3 | Cards summarize destinations well, but you must recall the top nav is the only route |
| 7 | Flexibility and Efficiency (findability) | 2 | The primary findability aid (topic cards) doesn't click; nav is the only route — a docs page's most-weighted heuristic underperforms |
| 8 | Aesthetic and Minimalist | 4 | Clean, quiet, well-spaced, on-register |
| 9 | Error Recovery | 3 | Low surface; FAQ/Privacy pointers exist |
| 10 | Help and Documentation | 3 | Orients well ("New? Start with Setup") but can't act on the guidance in place |
| **Total** | | **31/40** | **Good, not yet excellent** — gap concentrated in findability |

## Anti-Patterns Verdict

**AI-made? No — genuine POV and correct "quiet volume" register — held back by two template tells.**

- **Design review (A)**: The mobile-first thesis is specific and lived-in ("no copying IDs on a phone keyboard," "target the last message sender"), not interchangeable filler; blue identity is deliberate; motion is restrained — correct docs register. Two pulls toward generic: the **six-number stat grid** (legitimate content, cliché presentation, and the numbers don't add up), and the **"Find what you need" card grid that looks canonical but has had its core function amputated — the cards aren't links.** That's the most slop-adjacent thing here: the pattern without the substance.
- **Detector (B)**: 2 findings, **both false-positive** — the Bricolage/Hanken font flags (intentional sub-brand; nothing in `docs/styles.css` flagged). Confirmed: no gradient-clip text (h1 is solid white + blue glow), the banned `.hero-card__stripe` is dead CSS not rendered, contrast all passes (accent used only as button/border; accent-strong text 10:1, muted `#8fafc8` 8.4:1), nav 7 links + hamburger with ≥48px tap targets. (Fonts fell back to serif in-sandbox — proxy blocks Google Fonts; markup is correct, so it's an environment limitation.)
- **Overlays**: injection skipped.

## Overall Impression

Reassurance ramps beautifully — the hero pills ("No dashboard / SQLite local / Docker ready") pre-answer the three biggest "is this a pain?" fears, and "six steps from a fresh clone to a running bot" is genuinely calming. Then the journey **stalls at the moment of action**: every signpost ("Start with Setup," "Self-Hosting covers Docker…") is unlinked prose, the topic cards describing each destination don't click, and the only button invites the *hosted* bot — the path a self-hoster isn't taking. The page builds confidence and withholds the door. Biggest win by far: **make the topic cards real links.**

## What's Working

1. **Domain-perfect voice** — speaks the self-hoster's language natively (intents, `requirements.txt`, Docker, `n!tag`). Heuristic #2 is a 4/4.
2. **Correct register discipline** — quiet, glassy, low-motion, generous spacing; reads as the documentation volume of the three-surface site, not a second landing.
3. **Front-loaded reassurance** — requirements and constraints surface early and honestly, reducing a prospective self-hoster's anxiety.

## Priority Issues

- **[P1] The "Find what you need" cards are not links.** The five topic cards (Commands/Setup/Self-Hosting/FAQ/Privacy) are inert `<article>`s (no `<a>`, no JS wiring) — yet `.info-card:hover` applies lift + glow + border change, signaling clickability. It's a **false affordance** on the docs hub's primary findability mechanism, and it breaks the self-hoster's arc exactly at "take me there." **Fix**: make each card an `<a class="info-card" href="…">` to its destination; the existing hover styling then tells the truth. Lifts heuristics #6/#7/#10 and the emotional journey at once. → **$impeccable harden** (or a structural edit)
- **[P2] The six stat numbers don't reconcile.** 368 = 189 + 159 + 20, but 26 (social) and 33 (fun) are subsets *inside* the 189 public — presented as six equal peers they invite addition and produce 447. Contradicts the clarity mandate. **Fix**: subordinate 26/33 (a "of which…" sub-row / divider / note), or drop them from the top grid; make the part-whole relationship legible. → **$impeccable clarify**
- **[P2] No self-host CTA; the only button points hosted.** The sole `.button` is "Invite NanoBot" (hosted), despite the audience being people standing up their own instance. **Fix**: add a primary "Start setup →" / "Self-hosting guide →" near the hero or requirements card; keep Invite as secondary. → **$impeccable clarify**
- **[P3] Stat-card labels are `<h2>`.** Six `<h2>` stat labels nest under the section's own `<h2>`, while parallel info-card titles are `<h3>` — a screen-reader user gets six sibling-level headings that are really sub-items. **Fix**: demote stat labels to `<h3>`. → **$impeccable harden**
- **[P3] The card grid omits Changelog and orphans Privacy.** Nav has 7 destinations; the grid covers 5 (no Changelog), and 5 cards in a 4-col grid leaves Privacy alone on row 2. **Fix**: add a Changelog card → 6 cards = clean 3×2, resolving omission + orphan. → **$impeccable layout**

## Persona Red Flags

**Morgan (self-hoster following the docs — highest-impact)**: Reassured by the requirements card + "six steps, no extra tooling," then hits a wall — the Setup/Self-Hosting cards don't click, the in-text "Start with Setup" isn't a link, and the only button invites the hosted bot. Must fall back to the small top nav to begin. Motivates, then obstructs.

**Alex (power user)**: Tries to add the six stats, can't reach 368, and either distrusts the numbers or wastes time working out the overlap.

**Sam (accessibility)**: Contrast is genuinely strong (muted ~8:1, accent-strong text ~10:1). Flags: inert cards with hover-lift mislead expectations; the `<h2>`-for-stat-labels flattening degrades heading navigation.

## Minor Observations

- **Orphaned left padding**: `.hero-card` still reserves `padding-left: 1.6rem` for the removed `.hero-card__stripe`, so the "why mobile-first" card looks slightly indented. Reclaim the padding (leftover from the stripe removal).
- Dead CSS in the shared `docs/styles.css`: the `.hero-card__stripe` rule (no longer used) and the `.eyebrow` rule (intentionally removed from markup) — prune if no sibling page uses them.
- Latent typo in `docs/styles.css` (`.search` rule: `gap: .45rem; l }`) — harmless on this page (no search), but it's in the shared sheet.
- Fonts fall back in-sandbox (proxy blocks Google Fonts); markup is correct, so production is fine — flagged as environment limitation, not a defect.

## Questions to Consider

1. If the topic cards were never meant to click, what is the section *for* that the nav doesn't already do — and if they were, how did the hub ship with its main navigation aid inert?
2. Whose page is this — the hosted-bot adder, or the self-hoster? The copy says the latter; the only button says the former.
3. Six numbers that don't sum to the headline number: is the grid communicating scope, or borrowing the visual authority of metrics while failing the one test a numbers grid invites — addition?
