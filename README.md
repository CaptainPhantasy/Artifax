# Sites — agent-agnostic website building and hosting

Build, validate, package, serve, and hand off full-stack websites from any
machine, through any agent. The agent does not need to be "on" the machine —
everything here is driven through file and command tools against a workspace
path, so you can operate it from anywhere.

## Lineage

This wrapper was rebuilt from a proprietary plugin payload (OpenAI's Codex
"Sites" plugin) as received. The engine underneath was always open source:
[vinext](https://github.com/cloudflare/vinext), Vite, Drizzle ORM, Tailwind
CSS, and wrangler. What we rebuilt is the wrapper — the manifest, the skill
instructions, and the glue — released here under MIT for everyone. The
original payload as received is preserved in git history, and OpenAI's
service glue is kept optional under `connectors/openai/`.

## Layout

- `plugin.json` — manifest (points at `./skills/`)
- `skills/sites-building/` — build skill: instructions, `scripts/init-site.sh`, reference docs, `templates/vinext-starter/`
- `skills/sites-hosting/` — hosting skill: publish/hand-off instructions, `scripts/package-site.sh`
- `connectors/openai/` — optional glue for OpenAI's Sites service (as received)
- `assets/` — logo and icon

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

## Hosting

Hosting is a plug, not a hard dependency. The default deliverable is a
validated build served locally on the target machine. A plug packages the
same artifact (`scripts/package-site.sh`) and registers, deploys, and
reports one plain-language result. OpenAI's Sites service ships as the
first optional plug under `connectors/openai/`; others follow the same
contract.

## License

MIT — see `LICENSE`. The engine stays under its own upstream licenses.
