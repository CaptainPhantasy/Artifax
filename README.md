# Sites — agent-agnostic website building and hosting

Build, **design**, validate, package, serve, and hand off full-stack websites
from any machine, through any agent. The agent does not need to be "on" the
machine — everything here is driven through file and command tools against a
workspace path, so you can operate it from anywhere.

## Lineage

This wrapper was rebuilt from a proprietary plugin payload (OpenAI's Codex
"Sites" plugin) as received. The engine underneath was always open source:
[vinext](https://github.com/cloudflare/vinext), Vite, Drizzle ORM, Tailwind
CSS, and wrangler. What we rebuilt is the wrapper — the manifest, the skill
instructions, and the glue — released here under MIT for everyone. The
original payload as received is preserved in git history, and OpenAI's
service glue is kept optional under `connectors/openai/`.

On top of that wrapper we added a **craft pipeline** so any agent produces
frontier-grade results instead of correct-but-generic ones.

## The craft pipeline

Seven skills, run in order. Each answers a distinct failure mode.

| # | Skill | Layer | Answers |
| --- | --- | --- | --- |
| 1 | [`sites-intake`](skills/sites-intake/SKILL.md) | comprehension | "Did we understand what they actually need?" |
| 2 | [`sites-design`](skills/sites-design/SKILL.md) | taste | "Is it on-brand and beautiful?" |
| 3 | [`sites-craft`](skills/sites-craft/SKILL.md) | craft | "Does it feel modern and app-like?" |
| 4 | `sites-building` | orchestration | "Build it." |
| 5 | [`sites-critique`](skills/sites-critique/SKILL.md) | critique | "Is it actually good, on screen?" |
| 6 | [`sites-quality`](skills/sites-quality/SKILL.md) | verification | "Is it accessible, fast, sound?" |
| 7 | [`sites-hosting`](skills/sites-hosting/SKILL.md) | hosting | "Ship it, and report one result." |

The design layer ships a **W3C DTCG token system**, accessible **React
primitives**, a **patterns library**, and a **curated knowledge set**. The
critique layer adds a **rubric plus a vision pass** — the agent screenshots the
running site and critiques it as a designer would, before the user ever sees it.

## Layout

- `plugin.json` — manifest (points at `./skills/`)
- `skills/sites-intake/` — spec capture + ambiguity scoring
- `skills/sites-design/` — tokens (`assets/tokens/tokens.json`), token compiler,
  component catalog, patterns, resources
- `skills/sites-craft/` — motion, PWA, modern-web platform references
- `skills/sites-critique/` — rubric, vision loop, screenshot script
- `skills/sites-quality/` — objective gates + `scripts/quality-gate.mjs`
- `skills/sites-building/` — build orchestrator + `scripts/init-site.sh` + starter template
- `skills/sites-hosting/` — publish/hand-off + `scripts/package-site.sh`
- `connectors/openai/` — optional glue for OpenAI's Sites service (as received)
- `assets/` — logo and icon
- `scripts/` — root shims into the skill scripts

## Design system

Tokens are authored in DTCG JSON and compiled to CSS custom properties:

```bash
scripts/compile-tokens.sh          # regenerate styles/tokens.css from tokens.json
```

Generated sites ship `styles/tokens.css`, `styles/motion.css`, `lib/cn.ts`, and
`components/ui/*` — accessible primitives styled entirely from tokens. Tailwind
utilities are mapped to the system (`bg-surface`, `text-ink`, `border-line`,
`bg-brand`, `ring-focus`, …), so no raw colors or arbitrary spacing appear in
site code.

## Workspace rule

Workspaces live on a **non-system data drive** — never the drive the
operating system lives on. Choose the drive with the most room. Scripts
accept an explicit target path; `SITES_WORKSPACE` sets a default so agents
that reach the machine remotely get the same behavior as local ones.

## Quick start

```bash
scripts/init-site.sh /path/on/data-drive/my-site   # scaffold + install
cd /path/on/data-drive/my-site
npm run dev        # local server, prints the Local URL
npm run build      # verify production output in dist/
npm test           # build + rendered-output checks
```

Then, before shipping:

```bash
scripts/critique.sh . http://localhost:3000                 # vision screenshots
scripts/quality-gate.sh .                                   # static checks
SITES_AUDIT_URL=http://localhost:3000 scripts/quality-gate.sh .   # + Lighthouse / axe
```

## Hosting

Hosting is a plug, not a hard dependency. The default deliverable is a
validated build served locally on the target machine. A plug packages the
same artifact (`scripts/package-site.sh`) and registers, deploys, and
reports one plain-language result. OpenAI's Sites service ships as the
first optional plug under `connectors/openai/`; others follow the same
contract.

With `QUALITY_GATE=1`, `package-site.sh` enforces the quality gate before
packaging — blocking accessibility failures abort the release.

## License

MIT — see `LICENSE`. The engine stays under its own upstream licenses.
