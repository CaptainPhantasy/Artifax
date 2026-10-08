# Component catalog

Compose from accessible primitives instead of hand-rolling widgets. Three tiers.

## Tier 0 — bundled in the starter (use these first)

Every site scaffolded by `init-site.sh` ships `components/ui/` — React 19 +
Tailwind primitives with **no runtime dependencies** beyond React, already
styled to the design tokens and satisfying the accessibility contract below.
Import from `components/ui` (barrel) or the individual files:

| Component | File | Notes |
| --- | --- | --- |
| `Button` | `button.tsx` | variants: primary/secondary/ghost/danger; sizes sm/md/lg; `asChild`-free, renders `<button>` or `<a>` |
| `Card` | `card.tsx` | `Card`, `CardHeader`, `CardTitle`, `CardBody`, `CardFooter` |
| `Badge` | `badge.tsx` | neutral/brand/success/warning/danger |
| `Input` / `Textarea` | `field.tsx` | `Field` label+help+error wrapper, `Input`, `Textarea` |
| `Dialog` | `dialog.tsx` | native `<dialog>` modal with backdrop, Esc, focus return |
| `Tabs` | `tabs.tsx` | roving tabindex, arrow keys, ARIA tabs |
| `Accordion` | `accordion.tsx` | native `<details>`/`<summary>` disclosure |
| `Alert` | `alert.tsx` | status callouts with `role=status`/`alert` |
| `Skeleton` | `skeleton.tsx` | loading placeholder (reduced-motion aware) |

```tsx
import { Button, Card, CardBody, Dialog, Tabs, Field, Input } from "../../components/ui";
```

Keep them as project code — edit freely; they are yours, not a dependency. The
class helper lives at `lib/cn.ts`. The canonical copies live in the starter
template (`skills/sites-building/templates/vinext-starter/components/ui/`), so
improvements made here are inherited by every future site.

## Tier 1 — open-source libraries (when you need more)

Install only what the product actually uses (the platform forbids speculative
dependencies). All are MIT/Apache and unstyled-by-design so they inherit tokens.

| Library | Use for | Link |
| --- | --- | --- |
| **Radix Primitives** | full menu/select/popover/tooltip/dialog range | https://www.radix-ui.com/primitives |
| **React Aria** (Adobe) | the strongest a11y primitives, i18n, dates | https://react-spectrum.adobe.com/react-aria/ |
| **Ark UI** | multi-framework state machines | https://ark-ui.com |
| **Headless UI** | minimal Tailwind-oriented set | https://headlessui.com |
| **Base UI** (MUI team) | unstyled core | https://base-ui.com |

## Tier 2 — styled component systems (when you need speed, accept the look)

Use when the brief values breadth over bespoke identity, and restyle to tokens.

- **shadcn/ui** (copy-in on Radix + Tailwind) — https://ui.shadcn.com
- **HeroUI** — https://www.heroui.com · **daisyUI** — https://daisyui.com
- **Mantine** — https://mantine.dev

## High-taste blocks (patterns you can lift and re-token)

- **Magic UI** — https://magicui.design · **Aceternity UI** — https://ui.aceternity.com
- **Origin UI** — https://originui.com · **Cult UI** — https://www.cult-ui.com
- **Tremor** (dashboards/charts) — https://tremor.so
- **Icons**: Lucide — https://lucide.dev · **Fonts**: Fontsource — https://fontsource.org

Always strip their palette/type and re-express in the site's tokens.

## Accessibility contract (every interactive component)

Non-negotiable, regardless of source:

- **Keyboard**: reachable and operable by Tab/Shift-Tab; Enter/Space activate;
  arrows move within composite widgets; Esc closes overlays.
- **Focus**: visible `--ring` focus indicator at all times; focus returns to the
  invoker when an overlay closes; no `outline: none` without a replacement.
- **Roles/states**: correct ARIA (`role`, `aria-expanded`, `aria-selected`,
  `aria-controls`, `aria-current`, `aria-live` for status), or native elements
  that provide them implicitly. Prefer native.
- **Names**: every control has an accessible name (label, `aria-label`, or
  visible text). Icon-only buttons must have a label.
- **Targets**: hit area ≥ 24×24 CSS px (44×44 preferred on touch).
- **Motion**: respect `prefers-reduced-motion: reduce`.
- **Contrast**: text and meaningful UI meet WCAG 2.2 AA.
- **Zoom**: usable at 200% and at 320px width without loss of function.
