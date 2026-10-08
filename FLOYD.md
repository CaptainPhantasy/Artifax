# FLOYD.md — Project Context

OpenAI **Sites** Codex plugin payload: plugin manifest, skills (instructions), helper scripts, and the `vinext-starter` site template. This directory is a slice of the `openai/openai` monorepo — there is **no root `package.json`**; the repo root is not a buildable project. Build/test commands apply to *generated sites* created from the starter template.

## Commands

Repo root (payload tooling, bash, no install step):

```bash
scripts/init-site.sh TARGET_DIR              # scaffold vinext-starter into an EMPTY dir; refuses non-empty targets (exit 2)
scripts/package-site.sh PROJECT_DIR ARCHIVE  # validate + stage dist/, .openai/hosting.json, drizzle/ → .tar.gz
```

Both root scripts are thin shims that `exec` into `skills/sites-building/scripts/init-site.sh` and `skills/sites-hosting/scripts/package-site.sh`. Edit the `skills/` copies, not the shims.

Inside a generated site (from `skills/sites-building/templates/vinext-starter/`, Node >= 22.13.0, npm):

```bash
npm run dev          # vinext dev (Vite + Cloudflare Workers, wrangler logs to .wrangler/)
npm run build        # vinext build → dist/ (worker at dist/server/index.js)
npm run start        # serve built output
npm test             # runs `npm run build` first, then node --test tests/rendered-html.test.mjs
npm run lint         # eslint . --ignore-pattern dist --ignore-pattern .next
npm run db:generate  # drizzle-kit generate (D1 migrations → drizzle/)
```

Deployment is done through Sites MCP connector calls (`create_site` → git push with per-command credential header → `package-site.sh` → save version → deploy → poll `get_deployment_status`), not a CLI in this repo. See `skills/sites-hosting/SKILL.md`.

## Structure

- `.codex-plugin/plugin.json` — plugin manifest (name `sites`, version, interface metadata; points at `./skills/`, `./.app.json`, `./assets/`)
- `.app.json` — Sites connector app ID
- `skills/sites-building/` — build skill: `SKILL.md` (runtime instructions), `scripts/init-site.sh`, `references/` (`authentication.md`, `persistence-and-storage.md`), `templates/vinext-starter/`
- `skills/sites-hosting/` — hosting skill: `SKILL.md` (publish flow), `scripts/package-site.sh`
- `assets/` — `logo.svg`, `icon.svg` (referenced from plugin.json)
- `AGENTS.md` — dual-write mirror rule (see Gotchas)
- `TEMPEST.md` — risk/review policy: changes to skills, prompts, manifests, tool descriptions, or user-visible text always require human review
- `OWNERS` — `[block, review] / @openai/codex-cloud`

`vinext-starter` stack: Next.js-style `app/` dir on **vinext** (Vite + Cloudflare Workers ESM), React 19, Tailwind CSS 4, Drizzle ORM + Cloudflare D1, wrangler 4, TypeScript, ESLint 9 flat config.

## Conventions

- Skills are markdown files with YAML front matter (`name`, `description`); descriptions state trigger conditions ("Always use when the project contains `.openai/hosting.json`").
- Skill prose is written for a nontechnical end user: keep commands, paths, IDs, and internals out of user-facing text.
- D1/R2 bindings are *logical* names in `.openai/hosting.json` (`{"d1": null, "r2": null}` when unused — leave `null`, never add speculatively); `vite.config.ts` simulates them locally via the Cloudflare Vite plugin; Sites owns real resources.
- D1 access goes through the `getDb()` helper in `db/index.ts` (drizzle over `env.DB` via `cloudflare:workers`); schema lives in `db/schema.ts`, migrations in `drizzle/`.
- Worker entry is `worker/index.ts`; it adds the `/_vinext/image` optimization endpoint before delegating to vinext's app-router handler.
- The `sites()` Vite plugin (`build/sites-vite-plugin.ts`) runs on build (`apply: "build"`) and copies `.openai/hosting.json` + `drizzle/` into `dist/.openai/`.
- Shell scripts use `set -euo pipefail`, validate inputs, and exit non-zero with stderr messages on missing files.

## Testing

- Template tests use **`node --test`** (Node's built-in runner) with `node:assert/strict` — no Jest/Vitest.
- `tests/rendered-html.test.mjs` imports the built worker (`dist/server/index.js`) and calls `worker.fetch()` with stubbed env, so `npm test` always builds first.
- Tests double as template-contract tests: they assert exact starter skeleton copy, `react-loading-skeleton` colors/duration, `codex-preview` metadata, and that `app/_sites-preview/` contains exactly `SkeletonPreview.tsx` + `preview.css`. Changing starter cosmetics requires updating these assertions.

## Gotchas

- **Dual-write mirror (AGENTS.md)**: this payload is mirrored to a second location (`plugins/sites` ↔ `plugins/sites-codex`). Any shared change (skill, script, template, asset, version) must update both mirrors in the same PR, byte-identical except the manifest name (`sites` vs `sites-codex`). Mirroring does not authorize publishing a release.
- **Human review (TEMPEST.md)**: nearly everything user-visible here — skill text, plugin manifest, tool descriptions — is review-gated. Only comments/tests/docs and additive diagnostics are low-risk.
- `init-site.sh` hard-fails (exit 2) on non-empty targets; only `.git`, `.DS_Store`, `work/`, `outputs/` are tolerated.
- `package-site.sh` requires `dist/server/index.js` and `.openai/hosting.json` to exist, and verifies the archive contents; run `npm run build` first.
- Wrangler/Miniflare state is pinned project-local (`.wrangler/`) via env vars set in `vite.config.ts`; app secrets belong in ignored `.env*` files, never in `hosting.json`.
- On macOS Seatbelt sandboxes (`CODEX_SANDBOX=seatbelt`), FSEvents is blocked — `vite.config.ts` already switches HMR to polling; don't remove that.
- Reserved auth paths (`/signin-with-chatgpt`, `/signout-with-chatgpt`, `/callback`) are owned by the hosting dispatch layer — never implement routes for them. SIWC (Sign in with ChatGPT) proves identity only, not workspace membership; protected pages need `export const dynamic = "force-dynamic"`.
- D1 prepared statements take exactly one SQL statement per `prepare()`; use `batch([...])` for multiple. `env.DB.exec()` splits on newlines — do not use it for multiline `CREATE TABLE`.
- Starter is temporary infrastructure: after the first real implementation, `app/_sites-preview`, `react-loading-skeleton`, and the `codex-preview` metadata marker must be removed (and lockfile refreshed) — but the template tests assert they exist, so only remove them in generated sites, not in the template itself.
- Starter pins exact dependency versions (no `^`) and uses npm + `package-lock.json`; preserve the package manager and lockfile in generated sites.
