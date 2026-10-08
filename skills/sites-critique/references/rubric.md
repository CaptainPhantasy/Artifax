# Critique rubric

Score each criterion 0–5. Weighted total decides whether another pass is worth
it. Be harsh: a 5 means "professional, no notes."

## A. Clarity (weight ×3)

| # | Criterion | 0 | 5 |
| --- | --- | --- | --- |
| A1 | One-second test: what/who/next is obvious | unclear | instant |
| A2 | Primary action is unmistakable | buried | dominant |
| A3 | Information hierarchy is flat or is it ordered | flat | clear ranks |

## B. Craft (weight ×3)

| # | Criterion | 0 | 5 |
| --- | --- | --- | --- |
| B1 | Type: scale respected, ≤4 sizes/viewport, rhythm | random | calibrated |
| B2 | Spacing: consistent scale, generous whitespace | cramped | deliberate |
| B3 | Color: one idea, tokens only, accessible contrast | clashing | cohesive |
| B4 | Alignment: everything sits on a grid | off-grid | precise |
| B5 | Restraint: one signature, no decoration noise | busy | composed |

## C. Substance (weight ×2)

| # | Criterion | 0 | 5 |
| --- | --- | --- | --- |
| C1 | Real content (no lorem, no placeholder copy) | filler | real |
| C2 | States present: empty, loading, error, success | missing | complete |
| C3 | Over-delivery: the second-order win is there | literal | generous |

## D. Accessibility (weight ×3, gating)

| # | Criterion | 0 | 5 |
| --- | --- | --- | --- |
| D1 | Contrast AA in both themes | fails | passes |
| D2 | Keyboard operable; visible focus | broken | complete |
| D3 | Semantics/ARIA correct; names present | wrong | correct |
| D4 | Reduced-motion respected; zoom/reflow OK | ignored | honored |

## E. Function & performance (weight ×2)

| # | Criterion | 0 | 5 |
| --- | --- | --- | --- |
| E1 | Primary flows actually work | broken | solid |
| E2 | Responsive at 320/768/1280, no overflow | breaks | fluid |
| E3 | Lighthouse perf/a11y/SEO reasonable | poor | strong |

## Score → action

`total = Σ(section_avg × weight)`, max 5.0.

| Total | Action |
| --- | --- |
| **≥ 4.5** | Ship. Note anything below 4 as residual risk. |
| **3.5 – 4.4** | One more targeted pass on the two lowest criteria, then ship. |
| **2.5 – 3.4** | Return to `sites-design`; the problems are systemic. |
| **< 2.5** | Stop. Re-read `.sites/intake.md`; you likely built the wrong thing. |

**Gating rule:** any D (accessibility) criterion scoring ≤2 blocks shipping
regardless of total. Fix it or disclose it explicitly.

## Recording

Write scores to `.sites/critique.md` each pass:

```markdown
## Pass 1 — total 3.6
- A1: 4  A2: 3  A3: 4
- B1: 3  B2: 2  B3: 4  B4: 4  B5: 3
- C1: 5  C2: 3  C3: 2
- D1: 4  D2: 5  D3: 4  D4: 4
- E1: 5  E2: 4  E3: 4
Top defects: B2 (spacing cramped in hero), C3 (no second-order win), A2 (CTA buried)
Fix plan: …
```

Retaining the score history shows improvement and exposes regressions.
