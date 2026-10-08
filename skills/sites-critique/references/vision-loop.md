# Vision loop

The pass that finds ugliness. You are looking at a rendered image of the site
and critiquing it as a demanding senior designer would — before the user ever
sees it.

## Capture

```bash
node skills/sites-critique/scripts/critique.mjs <project-dir> <url>
```

Produces, in `<project-dir>/.sites/critique/`:

- `desktop-light.png`, `desktop-dark.png`
- `mobile-light.png`, `mobile-dark.png`
- `full-page.png` (desktop, full height)
- `faults.json` — a **machine-readable fault card**

(Requires the project to have Playwright installed. If it is not, the script
prints the one-line install command. An in-app browser tool is an acceptable
substitute — open the URL, resize, toggle theme, screenshot.)

### The fault card

`faults.json` is objective, per viewport and theme: horizontal overflow,
broken images, tap targets under 24px, an empty main, missing `lang`/`title`,
and console errors. It is **data, not a fix** — the script never edits source,
because the fixes are design decisions. Read it first: it is the checklist of
things that are unambiguously wrong *before* you apply taste. Structure:

```json
{ "url": "…", "summary": { "error": 2, "warning": 3 },
  "faults": [ { "id": "horizontal-overflow", "severity": "error",
    "viewport": "mobile", "theme": "light", "message": "…" } ] }
```

Fix every `error` and `warning` fault before moving to the vision pass; leave
`info` to judgment.

## The critique prompt (answer it literally, in writing)

> You are a senior product designer reviewing this screen for the first time.
> Be specific and be critical; polite non-answers are useless here.
>
> 1. **First impression (1s):** What is this, who is it for, what is the single
>    next action? If any of those is not obvious, say which and why.
> 2. **Hierarchy:** What does my eye hit first, second, third? Is that the
>    intended order? What is competing for attention that should not?
> 3. **Type:** Are sizes coherent? Is any line too long (>75ch) or too tight?
>    Are there more than four sizes in view? Is the headline actually a headline?
> 4. **Spacing & alignment:** Name every element that is off-grid, too tight, or
>    inconsistently spaced. Where is whitespace missing?
> 5. **Color & contrast:** Is there one color idea or several? Does anything fail
>    contrast or look muddy? Is the accent used for one thing or five?
> 6. **Content:** Is any text placeholder? Are there empty/loading/error states
>    visible or conspicuously absent?
> 7. **Specific defects:** Give a numbered list of concrete, fixable problems,
>    ranked by impact. Each must name a location and a change.
> 8. **The one change:** If you could change exactly one thing to most improve
>    this screen, what is it?

Then compare light vs dark and desktop vs mobile: does the design hold, or does
it only work at one size/theme?

## Turning critique into patches

- Start from `faults.json`: clear every `error` and `warning` fault first —
  those are objective, not taste.
- Then take the **top three** ranked defects from the written critique. Ignore
  the rest for this pass.
- For each, name the rubric criterion it maps to (e.g. B2 spacing, A2 CTA).
- Make the fix. Re-render. Look again.
- Stop when no defect is above "minor", or at 3 passes.

## Guardrails

- **Do not hallucinate quality.** If the screen is plain, say it is plain.
- **Do not invent requirements** the user did not ask for; critique against the
  intake spec and the rubric, not your taste alone.
- **Do not "fix" by adding.** More sections, more gradients, more motion are
  usually the wrong move. Most fixes are subtraction or spacing.
- **Do not break function** to improve looks. Re-run the build/tests after patches.

## Why this works

Iterative self-critique with a concrete rubric reliably improves output —
published results (Self-Refine, Reflexion) show large gains from feedback loops
on the same model. The rubric is what stops the loop from being self-congratulatory:
it forces the critique to be specific and the fixes to be checkable.
