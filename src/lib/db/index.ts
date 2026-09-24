import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/lib/env";
import * as schema from "./schema";

let cached: ReturnType<typeof createDb> | undefined;

function createDb() {
  // prepare: false — required for Neon's pooled (PgBouncer) connection string.
  const client = postgres(env().DIGNUM_DATABASE_URL, { prepare: false, max: 5 });
  return drizzle(client, { schema });
}

/** Lazily created so `next build` works without a database. */
export function db() {
  cached ??= createDb();
  return cached;
}
