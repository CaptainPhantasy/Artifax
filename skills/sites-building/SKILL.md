---
name: sites-building
description: Build beautiful, accessible websites with Sites — landing pages, portfolios, dashboards, portals, trackers, hubs, games, PWAs, and internal tools. Always use Sites when the project contains `.sites/hosting.json`, and start from `sites-intake` so the build matches what the user actually needs.
license: MIT
metadata:
  role: "orchestrator"
  version: "2.0"
---

# Sites building

Build the complete requested site, make it genuinely good, validate it, then
hand off to `sites-hosting` unless the user explicitly asks to keep it local.

Sites is agent-agnostic and location-independent. Operate on the workspace
through your file and command tools from wherever you run; nothing here
requires you to be on the machine. The workspace lives on a non-system data
drive on its target machine — one chosen by the human or set in
`SITES_WORKSPACE`. Never assume a particular machine, user, or path.

## The pipeline

Run the skills in order. Each one exists for a reason; skipping one is how the
result becomes correct-but-generic or pretty-but-wrong.

1. **`sites-intake`** — turn the request into a build-ready spec; resolve
   ambiguity before writing code. *(Always.)*
2. **`sites-design`** — load the design system, pick components, choose a
   layout pattern. *(Always.)*
3. **`sites-craft`** — add motion, PWA, and modern-web capability where the
   product calls for it. *(When the site should feel app-like or modern.)*
4. **Build** — implement against the spec and the tokens.
5. **`sites-critique`** — score the result against the rubric, including a
   vision pass, and fix the top defects.
6. **`sites-quality`** — run the objective gate (a11y/perf/SEO).
7. **`sites-hosting`** — publish and report one plain-language result.

## Communicate clearly

Assume the user is a nontechnical knowledge worker. Talk about their site,
choices, progress, and results. Keep tools, commands, files, runtimes,
browser software, permissions, dependencies, source control, credentials,
IDs, builds, and deployment internals out of user-facing messages unless the
user asks or must take action.

Use no more than one short update for each user-visible phase: preparing,
building, refining, and publishing. If a phase takes longer than 60 seconds,
give one plain-language update. Keep recoverable technical problems private;
say only that you hit a problem and are trying another method.

Ask one concise group of up to three discovery questions per `sites-intake`.
Otherwise proceed immediately with best judgment. Do not generate design
options or pause for a visual selection unless the user explicitly asks to
compare designs; when they do, produce up to three directions and let them pick.

## Choose the execution path

Use the **one-shot fast path** only when all of these are true:

- this is a new site in an empty or projectless workspace;
- one route can satisfy the request;
- the request does not require D1, R2, uploads, identity-aware behavior,
  external connectors, or browser UI QA; and
- the normal deliverable is a working served site.

Use the **capability path** otherwise. This includes existing-site changes,
multi-route sites, persistent data, uploads, sign-in, external data, and
requested browser testing. Both paths still run intake, design, critique, and
quality — the difference is depth, not whether craft happens.

## Design and craft are not optional

Even on the fast path, output is expected to be **beautiful and accessible**,
not merely functional:

- **Use the design system.** Everything is styled from the tokens in
  `styles/tokens.css` (colors, type, space, radius, shadow, motion). No raw
  hex, no arbitrary pixel values. See `sites-design`.
- **Use the bundled components.** `components/ui/` ships accessible primitives
  (Button, Card, Badge, Alert, Skeleton, Field/Input/Textarea, Dialog, Tabs,
  Accordion). Compose from them before hand-rolling widgets.
- **Reach for a known layout.** Consult the patterns library in `sites-design`
  before inventing a structure.
- **Add motion and PWA capability where it fits.** See `sites-craft`.

## Use imagery purposefully

Avoid agent-authored SVGs in finished sites, including inline SVG
illustrations. Prefer strong typography, color, layout, CSS shapes, and
existing icon components when imagery is unnecessary. When a site needs real
imagery, prefer suitable images found through web image search. Use your
environment's image-generation tool if and only if original imagery is
important and a suitable existing image is unavailable; generation adds
latency, so keep it purposeful and limited.

## Start new projects immediately

For a new site in an empty or projectless workspace, make setup the first
task action. Run this platform's root-level `scripts/init-site.sh` with the
workspace path as its target (or rely on `SITES_WORKSPACE` when set) and
retain the session until installation completes. Do not run a second
initializer.

Wait for setup to finish, then immediately start `npm run dev` in a retained
session. Use the exact Local URL printed by the development server. If you
have a browser tool, open the preview once; if you do not, hand the URL to
the user and continue. Complete these startup steps before asking any
necessary discovery questions. The user should see the starter loading
skeleton before implementation begins; continue building the requested site
through HMR and keep the development server alive through build and hosting.

## One-shot build

After setup, run `sites-intake` to produce `.sites/intake.md`, then build and
deliver the complete site in one focused pass.

1. Reuse the retained setup, development server, and preview started above.
   Start or open anything here only when the corresponding earlier step did
   not happen. Preserve the package manager and lockfile.
2. Start by inspecting `app/page.tsx`, `app/layout.tsx`, `app/globals.css`,
   `styles/tokens.css`, `components/ui/`, and `.sites/hosting.json`. Read other
   files only when the implementation needs them. Avoid broad scans and
   speculative research.
3. Make one complete product patch. Prefer one page component and one
   stylesheet, styled entirely from tokens and composed from `components/ui/`.
   Include all requested content, interactions, responsive behavior, keyboard
   and touch behavior when relevant, and accessible labels. The starter
   loading skeleton is temporary infrastructure, not product UI. Once the
   requested first version replaces it, remove `app/_sites-preview` and its
   imports. If nothing else uses `react-loading-skeleton`, remove that
   dependency and refresh the lockfile. Remove the temporary `sites-preview`
   metadata marker, replace the starter title and description with the
   requested site's own values, and update starter icons when appropriate
   before the final build unless the user explicitly asked to work on the
   starter itself. Keep the PWA manifest and update it for the finished site.
4. As soon as implementation is complete, run `npm run build` while the
   retained `npm run dev` process stays alive. Fix actual build failures,
   then rerun it. Run lint separately only if the build omits compilation or
   the user asks.
5. **Critique the result.** Run `sites-critique`: the structural pass plus the
   vision pass against the rubric, and fix the top defects (bounded to three
   passes). This is expected work, not extra credit.
6. **Gate the result.** Run `sites-quality` and resolve blocking findings.
7. Continue to `sites-hosting`.

## Capability path

### Project setup

- For a new site, use the setup flow in **Start new projects immediately**
  and preserve the bundled vinext structure, tokens, and components.
- For an existing site, preserve its package manager, lockfile, scripts,
  architecture, and `.sites/hosting.json`. Install only when dependencies
  are absent. Do not replace a working structure merely to use the starter.
- Keep site code within the selected project surface.

### Shape the product

- Build the first viewport around the requested product, not generic
  dashboard chrome.
- For a new site, replace the starter loading skeleton completely and remove
  `app/_sites-preview` and its imports. Remove `react-loading-skeleton` and
  refresh the lockfile if the finished site no longer uses it. Remove the
  temporary `sites-preview` metadata marker, update `app/layout.tsx` with
  the finished site's title and description, and replace any other starter
  metadata before final validation. Preserve the skeleton only when the user
  explicitly asked to work on the starter itself.
- Use concrete, product-specific copy and realistic data.
- Once the site's visual direction, primary headline, and supporting copy
  are stable, and your environment offers image generation, freeze a compact
  social-preview brief and launch exactly one generation request in parallel
  with the remaining implementation and validation. Ask for the complete
  social card, including its typography, as one cohesive landscape image
  that represents the actual finished site; optimize it for legibility in
  link unfurls.
- Inspect the returned image for incorrect, missing, or invented text.
  Retry once only when the card is unusable; do not generate multiple
  candidates in parallel. If validation succeeds, save the image as
  `public/og.png` and update `app/layout.tsx` with site-specific Open Graph
  metadata using an absolute URL derived from the incoming request host.
  Run the final build after wiring the asset. Never ship a generic or
  starter fallback image; if no bespoke card passes validation, omit
  `og:image`.
- Avoid speculative features and unnecessary client state.
- Use the starter's `sites()` Vite plugin and produce Cloudflare
  Worker-compatible ESM output.

### Add only requested capabilities

- For durable state, records, uploads, or other persistence, read
  [Persistence and storage](references/persistence-and-storage.md).
- For identity-aware or sign-in-gated behavior, read
  [Authentication](references/authentication.md).
- Use browser storage only for device-local preferences or explicitly local
  state.
- Keep logical D1 and R2 declarations in `.sites/hosting.json`; a hosting
  plug owns the real resources and deployment wiring.
- Keep local `.env` and `.env.example` keys aligned. Manage hosted runtime
  values through the hosting plug.

### Validate capability work

- Run the deployment build once after the complete implementation. If a D1
  schema changed, generate and inspect its migration. Fix real failures
  before hosting.
- Then run `sites-critique` and `sites-quality` as on the fast path.

## Preview

- If you have a browser tool, reuse the preview opened during startup, or
  open the exact Local URL printed by the healthy development server. If it
  fails, report it and continue.
- If you have no browser tool, provide the Local URL and continue; a missing
  preview never blocks the build.
- For an existing site, preserve its normal package and development flow.
- **Look at the rendered output before shipping.** The vision critique pass in
  `sites-critique` expects screenshots at desktop and mobile, light and dark.
  Use an in-app browser tool or `skills/sites-critique/scripts/critique.mjs`.
  This is the highest-leverage step for quality — do it.
- Do not scan ports or repeatedly reopen the browser.

## Hosting handoff

Use `sites-hosting` after validation. Do not finish with only a local build
unless the user requested local-only work. Return the deliverable — a URL or
a workspace path — as the primary result, in plain language. Keep the
development server running until hosting finishes, then stop it during final
teardown.
