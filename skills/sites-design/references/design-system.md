# Design system

The token contract, the theming strategy, and the check-before-preview
procedure.

## Architecture

```
skills/sites-design/assets/tokens/tokens.json   ← source of truth (W3C DTCG)
        │  scripts/compile-tokens.mjs
        ▼
skills/sites-design/assets/tokens/tokens.css    ← generated, committed
        │  copied into generated sites by scripts/init-site.sh
        ▼
<site>/styles/tokens.css
        │  @import + @theme inline
        ▼
<site>/app/globals.css  →  Tailwind utilities (bg-surface, text-ink, …)
```

Edit the **JSON**, run the compiler, commit both. Never edit `tokens.css` by
hand — it is generated and will be overwritten.

```bash
node skills/sites-design/scripts/compile-tokens.mjs
```

The compiler also **asserts WCAG AA contrast** for the declared semantic pairs
in both themes (alpha roles composite over the page background first). A
failing pair exits non-zero — an illegal color combination dies at compile
time, never on screen. The pair list lives in `$contrast.pairs` in
`tokens.json`; fix the token source, never the rendered output.

## Token contract

### Color ramps (primitives)

- `--n-0 … --n-1000` — neutral (paper → ink). **Derived, not authored:** each step is tinted toward the brand hue at compile time in OKLCH (5% by default, configured in the `n` group's `$extensions.tint`), so recoloring `--b-*` re-tints every neutral without shifting its lightness. `--n-0`/`--n-1000` stay pure anchors.
- `--b-50 … --b-950` — brand ramp. Recolor the product by changing this ramp.
- `--success-500`, `--warning-500`, `--danger-500`, `--info-500` (+ `-subtle`).

### Semantic roles (use these in code)

| Token | Role |
| --- | --- |
| `--bg` | Page canvas |
| `--surface` / `--surface-2` / `--surface-3` | Cards, raised, sunken |
| `--ink` / `--ink-2` / `--ink-3` | Primary / secondary / muted text |
| `--line` / `--line-2` | Hairline borders, stronger borders |
| `--brand` / `--brand-hover` / `--brand-subtle` | Action color and its states |
| `--on-brand` | Text/icon on a brand fill |
| `--success` `--warning` `--danger` `--info` | Status text/icon |
| `--success-bg` `--warning-bg` `--danger-bg` `--info-bg` | Status fills |
| `--ring` | Focus ring color |
| `--scrim` | Modal backdrop |

Rule: **code uses semantic roles; ramps are for defining roles.** If a site
reaches for `--n-700` directly in a component, add a role instead.

### Space

`--sp-1: 4px` → `--sp-24: 96px`, geometric-ish (1,2,3,4,6,8,12,16,20,24).
Use the smallest set that expresses the layout; large consistent gaps read as
premium.

### Radius

`--rd-xs 4` · `--rd-sm 6` · `--rd-md 8` · `--rd-lg 12` · `--rd-xl 16` ·
`--rd-2xl 24` · `--rd-full 9999`. Pick a house style (e.g. `lg` for cards,
`full` for pills) and hold it.

### Type

Sizes `--fs-xs 12` → `--fs-7xl 72`. Line heights `--lh-tight 1.1` ·
`--lh-snug 1.25` · `--lh-normal 1.5` · `--lh-relaxed 1.7`. Tracking
`--ls-tight -0.02em` · `--ls-normal 0` · `--ls-wide 0.08em`. Weights
`--fw-regular 400` · `--fw-medium 500` · `--fw-semibold 600` · `--fw-bold 700`.

Rules: exactly **two** font families max (one UI sans + one optional display).
Never more than four type sizes in a single viewport. Body text never below
`--fs-sm`.

### Elevation

`--sh-xs` (hairline) → `--sh-xl` (floating). Elevation encodes layering, not
decoration. A flat design is legitimate and often better; use shadow only to
lift genuinely raised surfaces.

## Theming (light / dark)

`tokens.css` sets light values on `:root`, then overrides under both
`@media (prefers-color-scheme: dark)` and `[data-theme="dark"]`. It also honors
`[data-theme="light"]` for forcing light. `color-scheme` is set accordingly.

Semantic roles — not ramps — are what flip between themes. A site that uses
roles everywhere becomes theme-correct for free. Verify both themes, and
verify contrast in both.

## Applying a brand kit

1. **Palette** → rewrite `--b-50 … --b-950`. Keep relative lightness so
   `--on-brand` stays legible; recompute `--on-brand` to the ink or paper end
   by contrast test.
2. **Neutrals** → automatic. They derive from the brand hue at compile time
   (`$extensions.tint` on `n`; raise `$mix` for a stronger cast, remove the
   block for pure neutrals).
3. **Fonts** → set `--font-sans` / `--font-display`. Prefer self-hosted via
   Fontsource over a runtime CDN.
4. **Logo** → place as an SVG; size by height, not width; never recolor beyond
   the brand's own rules.
5. **Capture from a live site** → screenshot it, read the computed styles of
   headings/body/buttons/backgrounds, and translate those hexes/px into the
   ramps and type scale. Do not guess.

## Check before preview (mandatory)

Before showing the user anything, verify:

- [ ] No raw hex/rgb/hsl and no arbitrary `px` for space/radius/type in the diff.
- [ ] All colors resolve to a semantic role.
- [ ] Focusable elements show a visible `--ring` focus state.
- [ ] Body text meets WCAG 2.2 AA contrast in **both** themes (the core pairs
      are already enforced by the compiler).
- [ ] Type sizes and spacing come from the scale (no in-between values).
- [ ] Exactly one visual idea dominates the first viewport.

`grep` the diff for hex codes as a fast smell test:
`grep -RInE '#[0-9a-fA-F]{3,8}\b' app components styles | grep -v tokens.css`

Any hit is either a bug or a missing token. Fix it before preview.
