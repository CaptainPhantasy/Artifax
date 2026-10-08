---
name: sites-craft
description: Make a site feel modern and app-like — motion and micro-interaction, PWA installability and offline, and contemporary web-platform features. Use when a site should feel polished, animated, interactive, installable, or offline-capable, when the user asks for a "modern", "app-like", "smooth", or "animated" experience, or when building a PWA, dashboard, game, or tool.
license: MIT
metadata:
  layer: "3 — craft"
  version: "1.0"
---

# Sites craft

A correct site can still feel like a document. "Breathtaking" usually reduces
to three things this skill delivers: **motion that clarifies**, **app-like
capability**, and **native-feeling use of the modern platform**. All three are
cheap; the cost of not doing them is that the result reads as dated.

## Motion

Motion is a language, not garnish. It answers "where did that come from?" and
"what changed?". Rules:

1. **Animate only `transform` and `opacity`** on the hot path — never layout
   properties (`width`, `top`, `margin`). Layout animation causes jank.
2. **Durations come from tokens**: `--dur-fast 140ms` (state), `--dur-base 220ms`
   (entrance), `--dur-slow 340ms` (overlay), `--dur-slower 520ms` (large/flourish).
   Curves: `--ease-standard`, `--ease-decelerate`, `--ease-emphasized`.
3. **Respect `prefers-reduced-motion: reduce`** — every animation must have a
   zero/instant path. This is a WCAG requirement, not a nicety.
4. **One signature moment per site.** Everything else is quiet. If everything
   animates, nothing reads as intentional.
5. **No animation on scroll-jacking.** Never trap the scroll; never move content
   out from under the user's cursor.

The starter ships `styles/motion.css` with keyframes, entrance utilities,
reduced-motion guards, and view-transition helpers. See
[motion](references/motion.md) for the full kit and library choices (Motion,
GSAP, View Transitions, AutoAnimate).

## PWA — make it installable and offline-tolerant

When the site is something people will return to (dashboard, tracker, tool,
game), ship it as a PWA:

- **Manifest** at `public/manifest.webmanifest` (the starter ships one): name,
  short_name, `start_url`, `display: standalone`, theme/background color,
  `icons` (192, 512, and a `maskable` 512).
- **Icons** — never ship a 500px SVG-only PWA. Generate square PNGs.
- **Service worker** via `vite-plugin-pwa` (Workbox under the hood): precache
  the app shell; runtime-cache images/fonts; a clear update flow.
- **Offline behavior** — decide it explicitly: app-shell offline, or a real
  offline fallback page. Silence is not a strategy.
- **Install affordance** — a subtle "Install app" action when
  `beforeinstallprompt` fires; never nag.

See [PWA](references/pwa.md) for the exact wiring on this stack.

## Modern web platform

Use the platform before adding a dependency. The features worth reaching for
(listed with when-not-to in [modern web](references/modern-web.md)):

- **Layout**: container queries, subgrid, `aspect-ratio`, logical properties.
- **Styling**: `@layer`, `color-mix()`, `oklch()`, nesting, `:has()`.
- **Interaction**: native `<dialog>`, the Popover API, `<details>`/`<summary>`,
  `:user-invalid`, CSS scroll-driven animations, View Transitions.
- **Text**: `text-wrap: balance` / `pretty`, `font-optical-sizing`.
- **Perf**: `content-visibility`, `loading="lazy"`, `fetchpriority`, `@starting-style`.

## Quality bar for craft work

- [ ] Every animation has a reduced-motion path.
- [ ] No layout-affecting properties animated.
- [ ] Focus is never lost during transitions.
- [ ] PWA passes installability (manifest + SW + icons) if shipped as PWA.
- [ ] No console errors, no janky scroll, 60fps on a mid-tier device.
- [ ] Bundle cost acknowledged for each dependency; prefer the platform.

## Handoff

After craft, run `sites-critique` to score the result and `sites-quality` to
gate it before hosting.
