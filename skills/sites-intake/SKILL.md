---
name: sites-intake
description: Turn a request into a build-ready specification before any site is built. Capture audience, purpose, required behavior, information, success criteria, and anti-goals; score ambiguity; resolve it with the fewest, highest-value questions. Always use at the start of a new site, when a request is vague or open-ended, or before sites-design, sites-craft, sites-critique, and sites-hosting.
license: MIT
metadata:
  layer: "1 — comprehension"
  version: "1.0"
---

# Sites intake

Your job in this skill is **comprehension, not construction**. Do not write a
single line of site code here. A site built from a vague request is the most
expensive mistake in this platform: it looks finished, so nobody reopens the
question. Spend the effort up front.

The goal is to deliver **significantly more than the user asked for** — but
"more" means *more of what they actually needed*, not decoration. That requires
knowing what they needed. You rarely learn that from the literal words.

## The two passes

Every intake has two passes. Do both. The first is visible to the user; the
second is silent and happens in your reasoning before you build.

### Pass A — Surface intake (the visible exchange)

Produce a **spec artifact** before building. It has eight fields:

| Field | Question it answers |
| --- | --- |
| **Audience** | Who uses this, and how expert are they? |
| **Purpose** | What job is this site hired to do? |
| **Required behavior** | What must the user be able to *do* (not just see)? |
| **Information** | What content, data, or copy must appear, and where does it come from? |
| **Success criteria** | How will the owner judge this a success in 30 days? |
| **Anti-goals** | What must this explicitly *not* be or do? |
| **Constraints** | Brand, legal, accessibility, performance, deadlines, integrations. |
| **Deliverable shape** | Which site shape (content, stateful, uploads, identity, auth)? |

Write the spec to `.sites/intake.md` in the workspace. It is the contract for
the rest of the pipeline, and `sites-critique` scores the result against it.

### Pass B — Below-surface understanding (silent, mandatory)

Before building, run this internal sequence and record it in the same file
under a `## Reasoning` heading. Keep it terse; it is for you, not the user.

1. **Read back.** Restate the request in one sentence of your own words.
2. **Name the ambiguity.** List every detail that could be read two ways.
3. **Guess the unstated.** For each, write the *most likely* user intent and
   your confidence (0–1). Users omit what feels obvious to them.
4. **Find the deeper job.** Ask: what is the user *really* trying to achieve?
   "A landing page" is often "credibility with a specific buyer." "A dashboard"
   is often "stop being asked the same question in Slack."
5. **Find the second-order win.** What would make them say *"I didn't know I
   wanted that"*? (A shareable OG card. A shareable deep link. A price
   calculator. A one-click export.) Choose one to include; do not add five.
6. **Decide: ask or assume.** Only details that are (a) low-confidence **and**
   (b) high-impact on the product become questions. Everything else becomes an
   explicit stated assumption you move forward with.

See [intake protocol](references/intake-protocol.md) and
[ambiguity scoring](references/ambiguity-scoring.md) for the scoring rules and
the question budget.

## Ask like a senior partner, not a form

When you must ask, ask **at most three** questions, in one grouped message,
each with your recommended default so the user can answer with one word.

Good question: *"Two things: (1) should this be public or private to your
team? — I'll default to private. (2) should the numbers be live or a static
snapshot? — I'll default to live if there's a data source, else snapshot."*

Bad: a numbered list of nine fields handed to a non-technical user. That is
you exporting your own uncertainty onto them.

If the request is already specific and complete, **ask nothing** — state your
assumptions and proceed. Silence is a feature when the brief is clear.

## Over-delivery rules

- Over-deliver on **substance** (the second-order win, real content, real
  states, real empty/error/loading states), not on **surface area** (more
  sections, more colors, more animation).
- Never invent facts the user will be held to: prices, legal copy, claims,
  statistics, names. Invent *placeholder* content only when clearly labeled and
  trivially swappable, and say so.
- If the user gave you a design system, brand kit, or existing site, intake is
  also where you inventory those assets (see `sites-design`).

## Handoff

When the spec is complete, pass to `sites-design` (to load taste and tokens),
then `sites-craft` (motion, PWA, modern web), then build. Never skip straight
from a vague request to code.
