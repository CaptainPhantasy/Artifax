# FLOYD.md — Project Context

**Sites** — an open (MIT), agent-agnostic website building and hosting platform. Rebuilt from a proprietary plugin payload (OpenAI's Codex "Sites" plugin) as received; the engine underneath was always open source (vinext, Vite, Drizzle ORM, Tailwind CSS, wrangler). The original payload as received is preserved in git history (baseline commit `f3e6bfe`); OpenAI service glue lives only under `connectors/openai/`.

The repo root is not a buildable project — it is a payload: manifest, skill instructions, helper scripts, and a site starter template. Build/test commands apply to generated sites created from the starter.

## Commands

Platform tooling (bash, no install step):

```bash
scripts/init-site.sh TARGET_DIR   # scaffold starter into EMPTY dir; refuses non-empty (exit 2)
scripts/package-site.sh PROJECT_DIR ARCHIVE  # validate + stage dist/, .sites/hosting.json, drizzle/ → .tar.gz
```

- Root scripts are shims that exec into `skills/*/scripts/` — edit the `skills/` copies.
- `init-site.sh` target defaults to `$SITES_WORKSPACE`, then `$PWD`. Install is lockfile-aware: `npm ci` when `package-lock.json` exists, else `npm install` (both with `--ignore-scripts`).
- Workspaces belong on a **non-system data drive** (never the OS drive). `SITES_WORKSPACE` makes remote agents behave like local ones.

Inside a generated site (Node >= 22.13, npm):

```bash
npm run dev          # vinext dev (Vite + Cloudflare Workers; wrangler logs to .wrangler/)
npm run build        # vinext build → dist/ (worker at dist/server/index.js)
npm run start        # serve built output
npm test             # npm run build first, then node --test tests/rendered-html.test.mjs
npm run lint         # eslint . --ignore-pattern dist --ignore-pattern .next
npm run db:generate  # drizzle-kit generate → drizzle/
```

Publishing is pluggable (see Hosting in `README.md`). Default deliverable: validated build served locally on the target machine. `connectors/openai/` preserves the first plug as received.

## Structure

- `plugin.json` — manifest (name `sites`, points at `./skills/`)
- `skills/sites-building/` — `SKILL.md`, `scripts/init-site.sh`, `references/` (authentication, persistence-and-storage), `templates/vinext-starter/`
- `skills/sites-hosting/` — `SKILL.md` (plug contract + hand-off), `scripts/package-site.sh`
- `connectors/openai/` — OpenAI Sites plug as received (manifest, app id, README with call sequence)
- `assets/` — logo.svg, icon.svg
- `README.md`, `LICENSE` (MIT)

Starter stack: Next.js-style `app/` dir on **vinext** (Vite + Cloudflare Workers ESM), React 19, Tailwind 4, Drizzle + D1, wrangler 4, TypeScript, ESLint 9 flat config.

## Conventions

- Skills are markdown with YAML front matter (`name`, `description`); descriptions state trigger conditions ("Always use when the project contains `.sites/hosting.json`").
- Skill prose targets a nontechnical end user: no commands, paths, IDs, or internals in user-facing text.
- **`.sites/hosting.json`** (renamed from `.openai/hosting.json`) holds only `project_id` plus optional logical `d1`/`r2` bindings (`null` when unused — never add speculatively). `vite.config.ts` simulates bindings locally; a hosting plug owns real resources.
- **`sites-preview`** metadata marker (renamed from `codex-preview`) marks the temporary starter skeleton page.
- D1 access via `getDb()` in `db/index.ts`; schema in `db/schema.ts`; migrations in `drizzle/`. One statement per `prepare()`; use `batch([...])` for multiples; never `env.DB.exec()` for multiline SQL.
- The `sites()` Vite plugin (`build/sites-vite-plugin.ts`) copies `.sites/hosting.json` + `drizzle/` into `dist/.sites/` on build.
- Hosting plugs follow a fixed contract (register → persist `project_id` → deploy exact source → one plain result; private first, shared/public requires explicit approval). Identity is plug-injected headers; `app/chatgpt-auth.ts` implements the OpenAI plug's headers as the reference pattern.
- Shell scripts: `set -euo pipefail`, validate inputs, exit non-zero with stderr messages.

## Testing

- **`node --test`** (Node built-in runner) with `node:assert/strict` — no Jest/Vitest.
- `tests/rendered-html.test.mjs` imports the built worker (`dist/server/index.js`), calls `worker.fetch()` with a stubbed env; `npm test` always builds first.
- Tests double as template-contract tests: they assert the starter skeleton copy, `react-loading-skeleton` values, the `sites-preview` marker, and that `app/_sites-preview/` contains exactly `SkeletonPreview.tsx` + `preview.css`. Changing starter cosmetics means updating these assertions.
- The test also guards against brand leakage: `assert.doesNotMatch(html, /codex/i)`.

## Gotchas

- **Git history is lineage.** Baseline commit `f3e6bfe` preserves the payload exactly as received (including the retired OpenAI governance files AGENTS.md, TEMPEST.md, OWNERS). Do not rewrite history; the README's lineage note depends on it.
- **Deliberate brand mentions** live in exactly three working places: root `README.md` (lineage), `connectors/openai/` (the plug), and the test's negative assertion. Don't scrub those; don't add new ones elsewhere.
- `init-site.sh` hard-fails (exit 2) on non-empty targets; only `.git`, `.DS_Store`, `work/`, `outputs/` are tolerated.
- `package-site.sh` requires `dist/server/index.js` and `.sites/hosting.json`, then verifies archive contents; run `npm run build` first.
- The template as received had **no lockfile**; `init-site.sh` falls back to `npm install`. If a lockfile exists in the template, keep it committed so `npm ci` stays reproducible.
- HMR polling: `SITES_HMR_POLLING=1` opts in; the legacy `CODEX_SANDBOX=seatbelt` trigger still works (kept for compatibility).
- Wrangler/Miniflare state is pinned project-local (`.wrangler/`) via env vars in `vite.config.ts`; app secrets belong in ignored `.env*` files, never in `hosting.json`.
- Reserved auth paths (`/signin-with-chatgpt`, `/signout-with-chatgpt`, `/callback`) are owned by the plug's dispatch layer — never implement routes for them. Sign-in proves identity, not membership; protected pages need `export const dynamic = "force-dynamic"`.
- Starter is temporary infrastructure: after the first real implementation, remove `app/_sites-preview`, `react-loading-skeleton`, and the `sites-preview` marker in **generated sites** — never in the template itself (the template tests assert they exist).
- Starter pins exact dependency versions and uses npm; preserve the package manager and lockfile in generated sites.
