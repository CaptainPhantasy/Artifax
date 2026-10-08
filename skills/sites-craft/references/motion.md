# Motion

The motion kit: tokens, primitives, libraries, and the rules that keep motion
from becoming noise.

## Token reference

| Token | Value | Use |
| --- | --- | --- |
| `--dur-instant` | 80ms | hover/press feedback |
| `--dur-fast` | 140ms | small state changes |
| `--dur-base` | 220ms | entrances, fades |
| `--dur-slow` | 340ms | overlays, larger surfaces |
| `--dur-slower` | 520ms | one signature flourish |
| `--ease-standard` | `cubic-bezier(.2,0,0,1)` | default |
| `--ease-decelerate` | `cubic-bezier(0,0,.2,1)` | things entering |
| `--ease-accelerate` | `cubic-bezier(.4,0,1,1)` | things leaving |
| `--ease-emphasized` | `cubic-bezier(.3,1.4,.4,1)` | the one flourish |

## What to animate (and what not to)

Animate: **entrance** (fade + small translateY), **state** (hover/press/focus),
**layout change** (shared element via View Transitions), **overlays** (scale +
fade from origin), **loading** (skeletons shimmer, progress).

Do **not** animate: page scroll position, cursor position, layout properties,
anything looping without user intent, anything longer than ~600ms in a workflow.

## The starter kit (`styles/motion.css`)

Provides:

- Keyframes: `ds-fade-in`, `ds-rise`, `ds-scale-in`, `ds-slide-in-right`, `ds-shimmer`.
- Utilities: `.ds-enter`, `.ds-enter-rise`, `.ds-enter-scale`, `.ds-shimmer`.
- `.ds-view-transition-*` helpers for the View Transitions API.
- A global `@media (prefers-reduced-motion: reduce)` guard that neutralizes
  animations and transitions.

Use the utilities for one-shot entrances; write hand-authored `@keyframes` only
when a pattern genuinely needs it.

## Library choices

| Need | Choice | Link |
| --- | --- | --- |
| React state/layout/gesture motion | **Motion** (Framer Motion), MIT | https://motion.dev |
| Timeline / scroll-scrubbed / SVG | **GSAP** (check license) | https://gsap.com |
| List add/remove animation, zero-config | **AutoAnimate** | https://auto-animate.formkit.com |
| Page/route & shared-element transitions | **View Transitions API** (native) | https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API |
| Scroll-driven progress | native **CSS scroll-driven animations** | https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-timeline |

Install Motion only when the site has real state/gesture motion; otherwise the
CSS utilities are sufficient and free.

## Patterns

**Entrance stagger** — wrap list items; apply `.ds-enter-rise` with an inline
`style={{ animationDelay: \`calc(var(--i) * 60ms)\` }}`. Cap the total at ~400ms.

**Press feedback** — `active:scale-[0.98]` with `transition-transform`
`--dur-fast`. Cheap, makes controls feel physical.

**Overlay** — fade the scrim (`--dur-slow`), scale the panel from `0.98 → 1`
with `--ease-decelerate`. Origin should match the trigger where possible.

**Shared element** — same `view-transition-name` on source and destination; wrap
the navigation in `document.startViewTransition(...)`.

**Skeleton → content** — cross-fade (`--dur-base`); never pop.

## Anti-patterns

- Animating `height`/`width`/`top`/`left` (causes layout thrash).
- Scroll-jacking, parallax that fights the user, autoplaying carousels.
- Motion that delays the primary action or blocks input.
- Animating on every keystroke.
- Ignoring `prefers-reduced-motion`.

## Performance notes

- Promote to the compositor: `will-change: transform` only while animating, then
  remove it.
- Prefer CSS transitions for simple state; reach for JS only for orchestration.
- Long lists: animate the container, not each row, past ~50 items.
