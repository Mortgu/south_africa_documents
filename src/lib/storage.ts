import "server-only";
import { issueSignedToken, presignUrl } from "@vercel/blob";
import { env } from "@/lib/env";

/** How long a download link stays valid. */
const DOWNLOAD_URL_TTL_MS = 5 * 60 * 1000;

/**
 * Returns a short-lived signed URL for a blob in the private Vercel Blob store.
 * The browser saves the file under the blob's pathname basename, so name blobs
 * after the desired download file name.
 *
 * All storage access goes through this module — swap it out to move to S3/R2.
 */
export async function getDownloadUrl(pathname: string): Promise<string> {
  const validUntil = Date.now() + DOWNLOAD_URL_TTL_MS;
  const token = await issueSignedToken({
    token: env().BLOB_READ_WRITE_TOKEN,
    pathname,
    operations: ["get"],
    validUntil,
  });
  const { presignedUrl } = await presignUrl(token, {
    access: "private",
    operation: "get",
    pathname,
    validUntil,
  });

  // Ask the CDN to serve the file as an attachment instead of inline.
  const url = new URL(presignedUrl);
  url.searchParams.set("download", "1");
  return url.toString();
}
