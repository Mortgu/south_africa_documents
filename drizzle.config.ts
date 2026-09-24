import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local", quiet: true });

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Migrations use the direct (unpooled) connection.
    url: process.env.DIGNUM_DATABASE_URL_UNPOOLED ?? process.env.DIGNUM_DATABASE_URL ?? "",
  },
});
