import "server-only";
import { z } from "zod";

const schema = z.object({
  BLOB_READ_WRITE_TOKEN: z.string().min(1),
});

let cached: z.infer<typeof schema> | undefined;

/** Validated server environment. Parsed lazily so `next build` works without secrets. */
export function env() {
  cached ??= schema.parse(process.env);
  return cached;
}
