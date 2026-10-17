import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/lib/env";
import * as schema from "./schema";

let cached: ReturnType<typeof createDb> | undefined;

function createDb() {
  const client = postgres(env().DIGNUM_DATABASE_URL, { max: 5 });
  return drizzle(client, { schema });
}

/** Lazily created so `next build` works without a database. */
export function db() {
  cached ??= createDb();
  return cached;
}
