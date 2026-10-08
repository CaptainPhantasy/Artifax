# Intake protocol

The detailed procedure behind `sites-intake`. Follow it in order.

## 1. Classify the request

Determine, before anything else, which of these you are looking at:

| Request kind | Signals | Default site shape |
| --- | --- | --- |
| **Content** | "landing page", "portfolio", "about", "launch", "waitlist" | Static, no durable state |
| **Tool** | "calculator", "converter", "generator", "checker" | Static + client logic |
| **Tracker / dashboard** | "dashboard", "tracker", "monitor", "KPI", "report" | D1 (or external data via plug) |
| **Directory / hub** | "directory", "hub", "portal", "index of" | D1 (records) |
| **App** | "let users…", "log in", "save", "history", "accounts" | D1 + identity |
| **Media** | "upload", "gallery", "files", "images" | R2 (+ D1 metadata) |
| **Game / interactive** | "game", "play", "score", "leaderboard" | D1 (scores) + client state |

If a request spans two kinds, name the primary kind and the secondary as a
follow-up; build the primary first.

## 2. Fill the eight spec fields

For each field, if the user did not supply it, write your **assumed** value and
mark it `(assumed)`. Assumptions are not failures; unmarked assumptions are.

- **Audience** — role, expertise, device, context of use (desk vs phone on a
  job site), and whether they are the user *or* the funding stakeholder.
- **Purpose** — one sentence, verb-first: "Convince X to do Y." If you cannot
  write it verb-first, you do not understand it yet.
- **Required behavior** — enumerate actions as `[actor] can [action]`. Every
  row becomes a UI affordance; every affordance becomes an acceptance check.
- **Information** — group into *must appear* / *nice to appear* / *must not
  appear*. Identify the source of truth for each fact.
- **Success criteria** — prefer measurable: "signup conversion", "time-to-answer
  under 10s", "support tickets drop", "shareable link goes viral".
- **Anti-goals** — the fastest way to reveal these is to ask what a *bad*
  version looks like. Record at least one.
- **Constraints** — brand tokens available? legal/regulated copy? required
  languages? offline? accessibility target (default WCAG 2.2 AA)? SEO? analytics?
- **Deliverable shape** — map to the shapes in `sites-hosting` and record
  `d1`/`r2` bindings needed.

## 3. Score ambiguity per field

Use [ambiguity scoring](ambiguity-scoring.md). Any field scoring below the
threshold becomes a candidate question **only if** it also has high product
impact. Assemble the final question set (≤3).

## 4. Write `.sites/intake.md`

Use this template:

```markdown
# Intake — <working site name>

## Spec
- Audience: …
- Purpose: …
- Required behavior:
  - [ ] actor can …
- Information: (must / nice / must-not)
- Success criteria: …
- Anti-goals: …
- Constraints: …
- Deliverable shape: … (d1: …, r2: …)

## Reasoning (internal)
- Read-back: …
- Ambiguities: …
- Assumed intents + confidence: …
- Deeper job: …
- Chosen second-order win: …

## Questions asked
- … (or "none — brief was specific")

## Assumptions I am proceeding on
- …
```

## 5. Gate

Do not proceed to build until `.sites/intake.md` exists and has no empty spec
field. This is the platform's only hard gate on structure; honor it.
