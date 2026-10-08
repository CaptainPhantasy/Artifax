---
name: sites-design
description: Give every site a real design system and real taste. Loads the bundled design tokens, selects accessible components, applies layout patterns, and enforces the rule that output is checked against the system before it is shown. Always use when building or restyling any site, when a user mentions their brand, logo, colors, fonts, or design guidelines, or when output looks generic.
license: MIT
metadata:
  layer: "2 — taste + 6 — knowledge"
  version: "1.0"
---

# Sites design

Correct sites are cheap. **Beautiful, on-brand sites are the product.** This
skill is how you get there without a designer.

The core mechanism, borrowed from how frontier design tools work: **derive a
system once, then constrain all output to it, and check the output against the
system before showing it.** Freedom is what makes an agent produce generic
defaults. Confinement is what makes it produce design.

## The non-negotiables

1. **No raw values in site code.** No hex colors, no arbitrary `px` spacing, no
   one-off font sizes. Everything comes from a token. If a value is missing,
   add it to the system — do not inline it.
2. **One type scale, one spacing scale, one radius scale, one shadow scale.**
   Consistency reads as quality even when the individual choices are plain.
3. **Check against the system before preview.** Walk the rendered result
   against the constraints below; fix violations before the user sees it.
4. **Restraint over decoration.** Most "breathtaking" comes from hierarchy,
   spacing, and type — not from effects. Add one signature moment, not six.

## The bundled system

The starter ships a complete token layer at `styles/tokens.css`, generated from
the DTCG source at `skills/sites-design/assets/tokens/tokens.json`:

- **Color**: neutral ramp (`--n-*`), brand ramp (`--b-*`), and semantic roles
  (`--bg`, `--surface`, `--surface-2`, `--ink`, `--ink-2`, `--ink-3`, `--line`,
  `--brand`, `--success`, `--warning`, `--danger`, `--info`, `--ring`).
- **Space**: `--sp-1 … --sp-24` (4px base).
- **Radius**: `--rd-xs … --rd-full`.
- **Type**: `--fs-xs … --fs-7xl`, `--lh-*`, `--ls-*`, `--fw-*`.
- **Elevation**: `--sh-xs … --sh-xl`, `--sh-inner`.
- **Motion**: `--dur-*`, `--ease-*` (see `sites-craft`).

Tailwind maps the semantic roles into utilities via `@theme inline` in
`app/globals.css`, so you write `bg-surface text-ink border-line rounded-lg
shadow-md` — never `bg-[#f5f5f5]`.

Read [design system](references/design-system.md) for the full token contract,
the light/dark strategy, and the exact "check before preview" procedure.

## Applying a brand

When the user provides a brand — a logo, a palette, fonts, a design file, or an
existing site — **rebrand by token, never by search-and-replace**:

1. Update the brand ramp (`--b-50 … --b-950`) and, if given, the neutral ramp.
2. Update `--font-sans` / `--font-display` and the type scale if the brand
   specifies one.
3. Re-derive contrast for `--on-brand` and `--ring` so WCAG holds.
4. If they gave a live site, capture its palette and type with the web-capture
   step in [design system](references/design-system.md); do not eyeball hexes.

Because everything downstream references tokens, one ramp change restyles the
entire site — including states you have not looked at yet.

## Components

Do not hand-roll interactive widgets. Compose from the bundled accessible
primitives (copy-in, zero dependencies) and the wider open-source libraries
listed in [component catalog](references/component-catalog.md). Every
interactive element must satisfy the keyboard/ARIA contract in that file.

## Layout

Reach for a proven structure before inventing one. The
[patterns library](references/patterns-library.md) covers heroes, feature
grids, pricing, dashboards, empty states, and forms — each expressed in tokens.

## Knowledge

[Resources](references/resources.md) is the curated reference set — typography,
color, layout, interaction, accessibility, and performance. Consult it instead
of re-deriving fundamentals; it exists so the agent's output clears a
professional bar, not a first-draft bar.

## Handoff

After the design is applied and checked, continue to `sites-craft` for motion,
PWA, and modern-web capability, then `sites-critique` to score the result.
