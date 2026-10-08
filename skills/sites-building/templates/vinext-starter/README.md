# vinext-starter

A clean full-stack starter running on
[vinext](https://github.com/cloudflare/vinext), with optional Cloudflare D1
and Drizzle support.

## Prerequisites

- Node.js `>=22.13.0`

## Quick Start

```bash
npm install
npm run dev
npm run build
```

This starter does not use `wrangler.jsonc`.

## Included Shape

- edit site code under `app/`
- `.sites/hosting.json` declares optional logical D1 and R2 bindings
- `vite.config.ts` simulates declared bindings for local development
- `db/schema.ts` starts intentionally empty
- `examples/d1/` contains an optional D1 example surface
- `drizzle.config.ts` supports local migration generation when needed
- if your sandbox cannot deliver file-change events, set
  `SITES_HMR_POLLING=1` to switch HMR to polling

## Identity Headers

Hosting plugs may forward the current user's identity as request headers.
Treat them as optional and untrusted, and fall back from full name to email
when the full name is absent.

The bundled `app/chatgpt-auth.ts` module implements this pattern for the
OpenAI plug's headers (`oai-authenticated-user-email`, optional
`oai-authenticated-user-full-name`); see `connectors/openai/README.md` in
the platform root. Copy the pattern for other plugs rather than importing
plug assumptions into the site.

## Optional ChatGPT Sign-In (OpenAI plug)

The `app/chatgpt-auth.ts` module provides helpers for optional or required
ChatGPT sign-in when the site is hosted through the OpenAI plug:

- `getChatGPTUser()` for optional signed-in UI.
- `requireChatGPTUser(returnTo)` for server-rendered pages that should send
  anonymous visitors through Sign in with ChatGPT.
- `chatGPTSignInPath(returnTo)` / `chatGPTSignOutPath(returnTo)` for links;
  pass a same-origin relative `returnTo` path.
- Mark protected pages with `export const dynamic = "force-dynamic"` because
  they depend on per-request identity headers.

The hosting dispatch owns `/signin-with-chatgpt`, `/signout-with-chatgpt`,
`/callback`, the OAuth cookies, and identity header injection. Do not
implement app routes for those reserved paths. Routes that do not import the
helper remain anonymous-compatible.

Sign-in establishes identity only; it does not prove workspace membership.
Use the hosting platform's access controls for workspace-wide restrictions,
or enforce explicit server-side membership checks.

## Useful Commands

- `npm run dev`: start local development
- `npm run build`: verify the vinext build output
- `npm test`: build the starter and verify its rendered loading skeleton
- `npm run lint`: eslint
- `npm run db:generate`: generate Drizzle migrations after schema changes

## Learn More

- [vinext Documentation](https://github.com/cloudflare/vinext)
- [Drizzle D1 Guide](https://orm.drizzle.team/docs/get-started/d1-new)
