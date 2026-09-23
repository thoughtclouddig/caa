import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Replit provisions PostgreSQL and exposes DATABASE_URL automatically, so
 * no configuration is needed there. Locally, fall back to a dev database.
 */
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
