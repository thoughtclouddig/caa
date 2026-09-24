import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Replit provisions PostgreSQL and exposes DATABASE_URL automatically, so
 * no configuration is needed there. Locally, fall back to a dev database.
 *
 * At runtime in production a missing DATABASE_URL means the database was
 * never attached. Falling back to localhost there would produce
 * connection errors on every page and send whoever is debugging it
 * looking in the wrong place, so fail with the actual cause instead.
 *
 * The build is deliberately exempt. `next build` evaluates this module
 * while collecting page data, and on a first deployment the database may
 * not be attached yet. Throwing here would turn a fixable setup step into
 * a failed build with a misleading message.
 */
const isBuild = process.env.NEXT_PHASE === "phase-production-build";

if (!process.env.DATABASE_URL && process.env.NODE_ENV === "production" && !isBuild) {
  throw new Error(
    "DATABASE_URL is not set. Attach a PostgreSQL database to this " +
      "deployment, then run `npm run db:setup` once to create the schema " +
      "and seed the starting data.",
  );
}

const connectionString =
  process.env.DATABASE_URL ?? "postgres://localhost:5432/caa_dev";

/**
 * Managed Postgres (Replit, Neon, Supabase) terminates TLS at the pooler and
 * commonly presents a certificate that will not verify against the system
 * roots. Require TLS but skip verification there; use plain TCP locally.
 */
const isLocal =
  connectionString.includes("localhost") || connectionString.includes("127.0.0.1");

const client = postgres(connectionString, {
  ssl: isLocal ? false : { rejectUnauthorized: false },
  max: 10,
  idle_timeout: 20,
});

export const db = drizzle(client, { schema });
export { schema };
