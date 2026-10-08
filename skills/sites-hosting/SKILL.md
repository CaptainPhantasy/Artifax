---
name: sites-hosting
description: Host websites with Sites. Always use after `sites-building`, and use for website publishing, deployment, hosting management, or projects containing `.sites/hosting.json`.
---

# Sites hosting

Publish the exact validated source with the shortest safe sequence. Hosting
is pluggable: every plug follows the same contract — package the built site,
hand it to a target, deploy, and report one plain-language result. The
active plug's own documentation is the source of truth for its arguments.

## Communicate clearly

Assume the user is a nontechnical knowledge worker. Keep source control,
credentials, IDs, commits, branches, archives, versions, packaging,
connector calls, and deployment polling out of user-facing messages. Usually
send one update when publishing begins, then the final URL, path, or a
plain-language blocker.

## Rules

- Publish after a successful build unless the user requested local-only work.
- Publishing does not require a browser preview or visual QA. Use the
  preview from `sites-building`; do more browser work only when the user
  asks.
- Store only `project_id` plus optional logical `d1` and `r2` bindings in
  `.sites/hosting.json`. Runtime values belong to the hosting plug, never to
  this file.
- Keep the workspace on a non-system data drive; never write builds,
  archives, or caches to an operating-system drive.

## Default deliverable (no plug configured)

- Serve the validated build on the target machine and return its local URL.
- Package the exact artifact for handoff at any time:
  `scripts/package-site.sh PROJECT_DIR ARCHIVE`. It stages `dist/`,
  `.sites/hosting.json`, and migrations; validates required files; and
  creates the archive. It requires `dist/server/index.js`, so run
  `npm run build` first.

## Plug contract

A hosting plug, whatever its target, must:

1. Take the packaged archive (or the workspace) unchanged.
2. Register the site once and persist a stable `project_id` in
   `.sites/hosting.json`; reuse it instead of rediscovering it.
3. Deploy a version tied to the exact validated source.
4. Report success as one resolvable URL, or failure as one plain-language
   reason and next step.
5. Prefer private access. Shared or public access requires the user's
   explicit approval, captured before deployment.

Retry only on errors that explicitly identify a temporary failure or a
naming conflict. Treat quota, permission, and access errors as terminal; do
not change names or targets speculatively.

## OpenAI Sites plug

`connectors/openai/` preserves the first plug as received: register the
site, push the source using the plug's credential as a per-command header,
package, save a version tied to the pushed source, deploy (private first),
and poll status. Its README carries the full sequence.

## Existing sites and advanced capabilities

- Reuse the existing `project_id` and valid credentials recorded for the
  active plug.
- If a D1 schema changed, ensure generated migrations are present before
  packaging.
- Require `dist/server/index.js`, static assets when emitted,
  `dist/.sites/hosting.json`, and `dist/.sites/drizzle/**` when migrations
  exist.
- For non-vinext projects, use the established Cloudflare
  Workers-compatible build output and adapt staging only as required by the
  plug contract.

## Handoff

When the active plug reports success, return the deployed URL. With no plug,
return the local URL and the workspace path. Keep source credentials and
temporary archives private. On failure, do not soften it into a partial
success: give the user-visible reason and the next step.
