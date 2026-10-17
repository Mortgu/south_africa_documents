import "server-only";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { env } from "@/lib/env";

const CONTENT_TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".zip": "application/zip",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

export type StoredFile = {
  /** Download file name: the basename of the storage key. */
  fileName: string;
  contentType: string;
  size: number;
  /** Opens the file for reading. Call only once the file is actually being served. */
  open: () => ReadableStream<Uint8Array>;
};

/**
 * Looks up a document below FILES_DIR by its storage key (e.g. `protected/report.pdf`).
 * Returns null when the file doesn't exist. Name files after the desired download file name.
 *
 * All storage access goes through this module — swap it out to move to S3/R2.
 */
export async function findFile(storageKey: string): Promise<StoredFile | null> {
  const root = path.resolve(env().FILES_DIR);
  const filePath = path.resolve(root, storageKey);
  if (!filePath.startsWith(root + path.sep)) {
    throw new Error(`Storage key escapes FILES_DIR: ${storageKey}`);
  }

  const stats = await stat(filePath).catch(() => null);
  if (!stats?.isFile()) return null;

  return {
    fileName: path.basename(filePath),
    contentType: CONTENT_TYPES[path.extname(filePath).toLowerCase()] ?? "application/octet-stream",
    size: stats.size,
    open: () => Readable.toWeb(createReadStream(filePath)) as ReadableStream<Uint8Array>,
  };
}
