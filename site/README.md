# Catholic Aviation Association — website

Next.js (App Router) + PostgreSQL. Brand rules live in `../CAA_BRAND.md`,
which is the source of truth for colour, type and logo usage.

## Running on Replit

1. Import this repository into Replit.
2. Add a PostgreSQL database from the Replit Database pane. Replit sets
   `DATABASE_URL` for you — no other configuration is needed.
3. Push the schema and seed the starting data:

   ```
   cd site
   npm install
   npx drizzle-kit push
   npx tsx scripts/seed.ts
   ```

4. Press Run. `.replit` already binds to `0.0.0.0` and honours `PORT`,
   which is what Replit needs.

### Before going live

The seed creates two accounts with the password `changeme-in-production`:

- `admin@catholicaviation.org` (admin)
- `leader@catholicaviation.org` (chapter leader)

Change both passwords, or delete the accounts and register fresh ones.

## Local development

```
createdb caa_dev
npm install
npx drizzle-kit push
npx tsx scripts/seed.ts
npm run dev
```

## Layout

| Path | What it is |
| --- | --- |
| `app/` | Routes. Public pages at the root, `portal/` for members, `admin/` for staff. |
| `lib/schema.ts` | The database schema. Change here, then `npx drizzle-kit push`. |
| `lib/queries.ts` | Reads. Server-side only. |
| `lib/actions.ts` | Writes, as server actions. |
| `lib/auth.ts` | Sessions and guards. |
| `content/` | Copy that is not yet in the database. |
| `public/brand/` | Approved logo artwork. Place it, never redraw it. |

## Access model

Three roles: `member`, `chapter_leader`, `admin`.

- `/portal/*` requires any signed-in account.
- `/admin/*` requires `admin`. A signed-in member who is not staff is sent
  back to the member area rather than shown an error.

Sessions are opaque random tokens stored in the `sessions` table rather than
signed JWTs, so revoking access is a row delete and takes effect immediately.

## What is deliberately not finished

- **Payments.** CAA has a processor contract separate from eCatholic and we
  do not have those account details. Donation and dues forms record intent
  to the `donations` table with status `pending` and an empty `processorRef`;
  nothing is charged. Wire the processor, then reconcile those rows.
- **Membership pricing.** Amounts live in `membership_tiers` and are read at
  runtime, so the board can change them without a code release. The figures
  currently seeded are placeholders.
- **Photography.** Every image position is a labelled `PhotoSlot` describing
  the photograph needed. Real CAA photography replaces them. No stock or
  generated imagery.
- **Daily readings.** The USCCB translation is copyrighted. The design shows
  citations only; displaying full readings needs permission first.
