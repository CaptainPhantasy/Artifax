# Patterns library

Proven structures, expressed in tokens. Reach for these before inventing.
Every pattern names its purpose, structure, and the tokens it leans on.

## Landing hero

**Purpose:** answer "what is this, who is it for, what do I do next?" in one
screen. **Structure:** eyebrow (optional) → H1 (one idea, ≤ 12 words) → subhead
(1–2 sentences) → primary CTA + optional secondary → one proof element
(logo row, metric, or screenshot). **Tokens:** `--fs-5xl/6xl` H1, `--ink`/`--ink-2`,
`--sp-16` vertical rhythm, `--brand` CTA. **Rule:** exactly one dominant idea;
no carousel.

## Feature grid

3 columns desktop / 1 mobile (`repeat(auto-fit, minmax(18rem, 1fr))`). Each cell:
icon (Lucide) → title → one-sentence body. **Tokens:** `--rd-lg`, `--surface`,
`--sh-xs`, `--sp-6`. Odd counts look intentional; even counts look like a table.

## Bento / asymmetric showcase

2–4 tiles of different sizes in a CSS grid (`grid-template-areas`). One tile is
the hero of the set. **Tokens:** `--sp-4` gap, `--rd-xl`. Use for "capabilities"
when a flat grid feels generic.

## Pricing

2–3 tiers, middle emphasized (`--brand-subtle` ring + `Badge` "Most popular").
Feature list uses `✓`/`–` rows, one line each, left-aligned. Annual/monthly
toggle is client state. **Tokens:** `--fs-4xl` price, `--line` dividers.

## Dashboard shell

Persistent left nav (collapsible) + top bar (search, account) + content region.
Content begins with a **KPI strip** (3–4 stat cards), then the primary chart/table.
**Tokens:** `--surface-2` shell, `--surface` cards, `--line` borders.
**Rule:** real data beats lorem; empty and loading states are required, not optional.

## Data table

Sticky header, zebra-free (use `--line` row borders), right-align numerics,
truncate long text with a title tooltip, row actions on the right. Provide a
sensible default sort and a visible count. Mobile: collapse to cards.

## Form

Single column, max ~40rem, label above field, help text below, inline validation
on blur (not on every keystroke). One primary action, right-aligned; destructive
actions separated. **Tokens:** `--sp-4` field gap, `--danger` errors,
`aria-invalid` + `aria-describedby`.

## Empty state

Never a blank panel. Icon → "Nothing here yet" → one sentence explaining what
will appear → the primary action that creates the first item. **Tokens:**
`--ink-3` copy, `--sp-8` padding.

## Loading state

Skeletons that mirror the eventual layout (the starter already ships one).
Respect `prefers-reduced-motion`. Never a bare spinner where layout is known.

## Error state

Plain-language cause + the next action + a retry if retryable. Never a raw stack
trace or error code in user-facing copy.

## Long-form article

Measure 60–75ch (`max-width: 68ch`), `--lh-relaxed`, generous paragraph spacing,
first-line no indent. Pull quotes and figures break the column occasionally.

## Footer

Grouped link columns, one line of legal, and — if the site has any — a final CTA.
Keep it shallow; a footer is a map, not a sitemap dump.

## Detail / profile page

Media or avatar → title → metadata row → primary actions → body. Breadcrumb or
back-link at top when reached from a list.

## Rules that apply to all patterns

1. **Hierarchy before decoration.** If it isn't clear what to look at first, no
   amount of color fixes it.
2. **Whitespace is the cheapest premium signal.** When in doubt, add `--sp-4`.
3. **One idea per section.** Two competing ideas = two sections.
4. **Real content.** Placeholder text hides layout bugs and reads as unfinished.
5. **Every list has an empty state; every action has a pending state; every
   failure has a message.**
