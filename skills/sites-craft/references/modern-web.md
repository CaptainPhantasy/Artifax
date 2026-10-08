# Modern web platform

Use the platform before adding a dependency. Each entry: what it is, when to
use it, when **not** to, and support expectations (baseline 2026).

## Layout

- **Container queries** — style by the container's size, not the viewport.
  Ideal for reusable cards/components. `@container (min-width: 24rem) { … }`.
  Use when a component appears in multiple widths; avoid for one-off page layout.
- **Subgrid** — align children to a parent grid's tracks. Great for card rows
  and form label/field alignment. Baseline widely available.
- **`aspect-ratio`** — reserve space for media, kill layout shift.
- **Logical properties** — `margin-inline`, `padding-block`, `inset-inline-start`.
  Use for any RTL-capable site.
- **`clamp()`** for fluid type: `font-size: clamp(2rem, 4vw, 3.75rem)`.

## Styling

- **`@layer`** — order CSS by layer (`reset, tokens, base, components, utilities`)
  so specificity stops escalating.
- **`color-mix()`** — derive hover/tint colors from tokens without new values:
  `color-mix(in oklab, var(--brand), black 12%)`.
- **`oklch()`** — perceptually even ramps; ideal for generating palettes.
- **Nesting** — native CSS nesting; no preprocessor needed.
- **`:has()`** — style a parent by its children ("field with an error").
  Powerful; use for state styling, not for layout hacks.
- **`@starting-style`** — animate elements entering from `display: none`
  (dialogs, popovers) without JS.

## Interaction

- **Native `<dialog>`** — modal + non-modal, built-in focus handling and Esc.
  Prefer over a custom overlay.
- **Popover API** — `popover` attribute + `popovertarget`; light-dismiss and
  top-layer for free.
- **`<details>`/`<summary>`** — disclosure/accordion with zero JS.
- **`:user-invalid` / `:user-valid`** — validate forms after interaction, not
  on first keystroke.
- **View Transitions** — animate between states/routes; also cross-document
  with `@view-transition { navigation: auto }`.
- **CSS scroll-driven animations** — `animation-timeline: scroll()` / `view()`
  for progress bars, reveals — no JS, no scroll listeners.
- **`accent-color`** — theme native controls (checkboxes, radios, range) with
  one property.

## Text & media

- **`text-wrap: balance`** on headings and `pretty` on paragraphs.
- **`font-optical-sizing`**, `font-variant-numeric: tabular-nums` for tables.
- **`content-visibility: auto`** to skip offscreen rendering cost.
- **`loading="lazy"`**, **`fetchpriority="high"`** on the LCP image.
- **`srcset`/`sizes`** with modern formats (AVIF/WebP) via the build.

## Performance budget

- LCP < 2.5s, INP < 200ms, CLS < 0.1 on a mid-tier mobile profile.
- Ship no dependency that a platform feature replaces.
- Fonts: self-host, `font-display: swap`, subset, preload the primary face.
- Images: correct dimensions, responsive formats, lazy below the fold.

## When NOT to use a shiny feature

- If it is behind a flag or has <90% support **and** has no graceful fallback.
- If a simple, well-supported alternative exists at similar cost.
- If it breaks keyboard access or screen readers (verify, don't assume).
- If it adds a build step for marginal gain.

Progressive enhancement is the default posture: the site works without the
feature, and is better with it.
