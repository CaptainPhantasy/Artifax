---
name: sites-critique
description: Score a built site against a rubric and improve it before the user sees it — including a vision pass that screenshots the running site and critiques it as a designer would. Use after building or restyling a site, before hosting, when a site "looks generic" or "feels off", or whenever quality matters more than speed. Runs a bounded self-refine loop.
license: MIT
metadata:
  layer: "4 — critique"
  version: "1.0"
---

# Sites critique

Never present a first draft. Every strong result on this platform comes from a
**bounded critique loop**: build → score → fix → re-score, capped so it stays
fast. This skill is the missing half of "generate": the part that looks at the
output the way a designer would and corrects it.

Frontier design products do exactly this internally — they *check the output
against the design system and correct it before the user sees it*. Here, that
check is explicit and yours to run.

## The loop

```
build ─▶ screenshot ─▶ score vs rubric ─▶ patch ─▶ re-score
              ▲                                        │
              └────────────── max 3 passes ◀───────────┘
```

- **Bounded**: stop at 3 passes, or when the score stops improving.
- **Scored**: use the rubric in [rubric](references/rubric.md) — always, not by feel.
- **Specific**: each fix names the criterion it satisfies. "Made it nicer" is not a fix.
- **Opinionated**: the vision pass must be willing to say a thing is bad.

## Two critique passes

### Pass 1 — Structural (cheap, always run)

Run the automated gate where possible:

```bash
node skills/sites-quality/scripts/quality-gate.mjs <project-dir>
```

Then walk [rubric](references/rubric.md) and check the objective items:
hierarchy, spacing discipline, contrast, focus states, empty/loading/error
states, responsive behavior, and "no raw values in code".

### Pass 2 — Vision (the pass that finds ugliness)

Capture the running site and critique it as an image. This is the single
highest-leverage step for "breathtaking".

```bash
node skills/sites-critique/scripts/critique.mjs <project-dir> http://localhost:3000
```

It writes screenshots (desktop + mobile, light + dark) to `.sites/critique/`.
Then **look at them** with your vision capability and answer the vision prompt
in [vision loop](references/vision-loop.md) — literally, in writing, before you
touch the code. The output of that pass is a ranked list of defects; fix the
top three, then re-render and look again.

If you have an in-app browser tool, use it directly instead of the script:
open the local URL, resize, toggle dark mode, and inspect.

## What "good" means here

A site passes when a stranger could look at the top 1 second of it and answer:
*what is this, who is it for, what do I do next?* — and would describe it as
professional. Everything in the rubric serves that.

## Rules

- **Critique the artifact, not your intentions.** You built it; you are biased.
  Judge only what is on screen.
- **Fix in priority order**; do not polish a low-impact detail while hierarchy
  is broken.
- **Never regress accessibility to gain polish.**
- **Report honestly.** If pass 3 still fails a criterion, say so and name it —
  do not paper over it.
- **Keep the loop short.** A bounded 2-pass improvement beats an unbounded search.

## Handoff

When the rubric is satisfied (or the pass budget is spent with residual issues
noted), continue to `sites-hosting`.
