# OpenAI Sites connector (optional plug)

Preserved as received: the original plugin manifest (`plugin.json`) and the
connector app id (`app.json`). This directory is the only place OpenAI
service glue lives — nothing else in this repository depends on it.

## What the plug expects

The OpenAI Sites service is driven through its connector calls:

1. `create_site` — registers a new site, returns `project_id` (persist it in
   the project's `.sites/hosting.json`) and a source-write credential.
2. Commit and push the validated source using the credential as a
   per-command HTTP header — never in remote URLs or git configuration.
3. Package with `scripts/package-site.sh PROJECT_DIR ARCHIVE`.
4. Save one version with the pushed branch-head SHA as `commit_sha`.
5. Deploy — prefer private. Shared/public deployment requires explicit user
   approval.
6. Poll deployment status until it succeeds or fails; report one plain
   result.

Identity note: sites hosted through this plug may receive OpenAI identity
headers (`oai-authenticated-user-email`, optional
`oai-authenticated-user-full-name`). The starter's `app/chatgpt-auth.ts`
module reads exactly those headers and is useful only under this plug.

## Status

Optional. Without this plug the platform builds, validates, packages, and
serves locally; finished sites go wherever their human points them.
