# Ambiguity scoring

A small, mechanical method so "is this clear enough to build?" stops being a
feeling.

## Score each spec field

For every field in the intake spec, rate two things on a 0–1 scale:

- **Clarity (C)** — do I know what the user wants? 1.0 = explicit and
  unambiguous; 0.5 = inferable with moderate confidence; 0.0 = a coin flip.
- **Impact (I)** — if I guess wrong, how expensive is it? 1.0 = the whole
  product is wrong or it is publicly embarrassing; 0.5 = a section is wrong;
  0.0 = cosmetically off.

Compute `Risk = I × (1 − C)`.

## Decision rule

| Risk | Action |
| --- | --- |
| **≥ 0.6** | **Ask.** This is one of your (max three) questions. |
| **0.3 – 0.59** | **State the assumption** in `.sites/intake.md` and proceed. Mention it in your single user-facing update only if the user would care. |
| **< 0.3** | **Proceed silently.** Do not burden the user. |

If more than three fields land at ≥ 0.6, you are almost certainly asking the
wrong questions. Re-read the request: usually the *purpose* field is the real
unknown, and resolving it collapses several others at once.

## Choosing the question set

1. Sort candidates by Risk, descending.
2. Drop any question whose answer you could infer from a sibling answer.
3. Drop any question the user cannot plausibly answer (technical internals —
   decide those yourself).
4. Phrase each surviving question with a recommended default.
5. Cap at three. If four survive, ask the top three and assume the rest.

## Confidence discipline

- Do not round 0.5 up to "probably fine" to avoid asking. That is how
  under-delivery happens.
- Do not inflate impact to 1.0 for everything; then everything becomes a
  question and the user disengages.
- When the request is a *revision* to an existing site, clarity is usually high
  (you have the artifact) — score lower and move fast.

## After the build

`Risk` predictions are checkable. When a user says "that's not what I meant,"
note which field you mis-scored and why. That note is how the platform gets
better over time; write it to `.sites/intake.md` under `## Retro`.

## Archetype classifier

Before scoring, classify the request into one archetype. The archetype sets the
design floor and tells you which references to load — the fastest way to stop a
generic build. Match the **primary verb** in the request (show / sell / learn /
do). When two fit, choose the one that governs the home page.

| Signals in the spec | Archetype | Design lead | Load |
| --- | --- | --- | --- |
| portfolio, artist, photographer, "show my work", gallery | **Portfolio** | large imagery, gallery grid, minimal chrome, strong display type | design-system.md, patterns-library.md |
| product page, campaign, landing, "learn more", "get started" | **Brochure** | hero + benefit stack, one clear CTA, social proof | design-system.md, component-catalog.md |
| buy, price, cart, checkout, SKUs, shipping | **Commerce** | product grid, cart/checkout flow, trust marks | component-catalog.md, patterns-library.md |
| dashboard, login, account, metrics, admin, "manage" | **App** | app shell, persistent nav, dense cards/tables | component-catalog.md, motion.md |
| blog, articles, news, posts, "read" | **Content** | reading measure, typographic rhythm, index + detail | design-system.md, craft references |
| event, schedule, agenda, RSVP, dates, lineup | **Event** | date/venue prominence, schedule, map, RSVP | patterns-library.md, motion.md |
| booking, reservation, appointment, availability | **Booking** | calendar/slot picker, confirmation, reminders | component-catalog.md, patterns-library.md |
| directory, listings, search, filters, "browse" | **Directory** | search + filters first, result cards, optional map | component-catalog.md, patterns-library.md |
| class, course, curriculum, students, teaching, residency | **Education** | outcomes, syllabus, cadence, enrollment CTA | design-system.md, patterns-library.md |

### Hint table

The leads above are floors, not ceilings. Pick **one** signature moment — a
hero interaction, a transition, a data view — and let the rest stay quiet;
see `skills/sites-craft/` for motion primitives and `skills/sites-critique/`
for the bar the result will be judged against. Record the chosen archetype and
your confidence in `.sites/intake.md`.
