# Gates

The complete check list, the commands, and how to fix each failure class.

## Static checks (no dependencies)

Run against `<project>/app`, `<project>/components`, `<project>/styles`,
`<project>/*.tsx`, excluding `tokens.css`, `node_modules`, `dist`.

| Check | Rule | Fix |
| --- | --- | --- |
| **Raw colors** | No `#hex`, `rgb(`, `hsl(` outside the token file | Re-express as a token/role; add a token if missing |
| **Raw palette** | No Tailwind default-palette utilities (`bg-gray-100`, `text-slate-500`, …) — **blocking** | Use a semantic role (`bg-surface`, `text-ink-2`) or add a token |
| **Image alt** | Every `<img>`/`<Image>` has `alt` (empty `alt=""` allowed only for decorative) | Add meaningful alt or `alt=""` |
| **Focus removal** | No `outline: none`/`outline-none` without a `:focus-visible` replacement | Add a `--ring` focus style |
| **Accessible name** | Icon-only `<button>` has text or `aria-label` | Add `aria-label` |
| **Heading order** | Exactly one `<h1>` per page; no skipped levels | Fix the outline |
| **Lang** | `<html lang>` present | Add `lang` |
| **Viewport** | Meta viewport present (framework default) | Ensure the framework emits it |
| **Placeholder text** | No `lorem`, `TODO`, `FIXME`, `XXX` in user-facing strings | Replace with real copy |

These catch the most common regressions cheaply, before any browser runs.

## Lint (optional, tool-detected)

```bash
scripts/lint.sh .            # or: node skills/sites-quality/scripts/lint.mjs .
```

Uses the project's local `oxlint` (oxc) if installed, else local `eslint`, else
fetches `oxlint` via `npx`. Reports and exits 0 unless `QUALITY_GATE=1`, when a
lint problem fails the build. oxlint is preferred for speed; either is fine.

## Live audits (opt-in)

Requires a running server and network access to fetch the tools.

### Lighthouse

```bash
npx --yes lighthouse "$SITES_AUDIT_URL" \
  --quiet --chrome-flags="--headless --no-sandbox" \
  --output=json --output-path=.sites/lighthouse.json
```

Read `categories.accessibility.score`, `performance.score`, `seo.score`,
`best-practices.score`, and the `audits` for `largest-contentful-paint`,
`cumulative-layout-shift`, `total-blocking-time`.

### axe-core

```bash
npx --yes @axe-core/cli "$SITES_AUDIT_URL" --save .sites/axe.json
```

Read `violations[]`, grouped by `impact` (`critical`, `serious`, `moderate`,
`minor`).

Links: https://github.com/GoogleChrome/lighthouse · https://github.com/dequelabs/axe-core
· https://github.com/dequelabs/axe-core-npm · https://github.com/GoogleChrome/lighthouse-ci
· https://github.com/unjs/unlighthouse

## Common failures → fixes

| Failure | Typical cause | Fix |
| --- | --- | --- |
| `color-contrast` (axe) | muted text on tinted surface | Use `--ink`/`--ink-2`, test both themes |
| `image-alt` | decorative image missing `alt=""` | Add `alt=""` if decorative, else describe |
| `button-name` | icon-only control | Add `aria-label` |
| `aria-*` invalid | wrong role/attr combination | Use native element; check APG |
| `link-name` | "click here"/icon link | Descriptive text or `aria-label` |
| LCP slow | unoptimized hero image, render-blocking font | `fetchpriority=high`, `font-display: swap`, preload |
| CLS high | media without dimensions | Set `width`/`height` or `aspect-ratio` |
| TBT/INP high | large JS on interaction path | Split, defer, remove deps |
| SEO low | missing title/description, non-crawlable links | Set metadata; use real `<a href>` |

## Wiring into packaging

`package-site.sh` invokes the gate on the deploy path when `QUALITY_GATE=1`, and
exports a clean, git-ready source tree with `--git-ready DIR` (tracked source
only, a `.gitignore`, and an initial commit). Recommended CI use:

```bash
# start the site, then gate, then package
npm run build && npm run start & SRV=$!
sleep 2
QUALITY_GATE=1 SITES_AUDIT_URL=http://localhost:3000 scripts/package-site.sh . out.tar.gz
kill $SRV

# lint + a pushable source export
scripts/lint.sh .
scripts/package-site.sh . --git-ready ./exported-site
```

## Interpreting results honestly

- axe passing ≠ accessible. It finds ~30–50% of issue types. The manual rubric
  in `sites-critique` covers the rest (focus order, meaningful content, keyboard
  traps).
- Lighthouse is a lab measurement; treat scores as directional, not absolute.
- A blocking failure must be **fixed or disclosed**. Never suppressed.
