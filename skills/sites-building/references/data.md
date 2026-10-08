# The single data door

A generated site has exactly one way to reach its database. Do not add a second
connection, a second ORM, or a second client — that is the "second driver" the
data door exists to prevent.

## Read / write

Import the door; never open your own:

```ts
import { getDb } from "../db"; // db/index.ts (an @/db alias is available)
import { notes } from "../db/schema";

const db = getDb();
await db.select().from(notes);
```

`getDb()` reads the `DB` binding named in `.sites/hosting.json` (`"d1": "DB"`)
and throws a plain-language error when the site has not been given a database
yet — so a missing binding fails at the first query, not silently.

## Schema

Define tables in `db/schema.ts` (Drizzle, SQLite dialect). Generate the
migration after editing:

```bash
npm run db:generate
```

`db/schema.ts` is intentionally empty until a site needs persistence — most
sites (portfolios, brochures, events) never do. Adding a database to a site
that does not need one is a failure, not thoroughness.

## Seed

Seed rows live in exactly one place: `db/seed.sql`. Apply them with:

```bash
npm run db:seed
```

Keep every statement idempotent (`INSERT OR IGNORE …`) so re-running is safe.

## Why one door

Two doors drift: two clients, two error shapes, two places to rename a binding.
One door means one place to read, one place to fix, and one thing the quality
gate can reason about.
