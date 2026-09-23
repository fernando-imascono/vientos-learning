/**
 * Persistent storage for uploaded SOP PDFs.
 *
 * The brief: keep the PDFs in a directory that survives restarts, with size
 * limits and cleanup. No S3.
 */

import { readFile, writeFile } from "node:fs/promises";
import { join, resolve, sep } from "node:path";

import { env } from "../config/env.ts";
import { HttpError } from "../lib/http-error.ts";

export interface StoredFile {
  /** Path relative to `env.storageDir`, safe to persist in the database. */
  key: string;
  bytes: number;
  contentType: string;
}

/** Every PDF starts with these five bytes, whatever its version. */
const PDF_MAGIC = new TextEncoder().encode("%PDF-");

/**
 * Whether the file starts like a PDF. Reads only the first bytes, so call it
 * after the size check and it never loads a large file into memory. It is a
 * cheap filter, not a validation: Reducto decides whether the PDF is readable.
 */
async function hasPdfMagicBytes(file: File): Promise<boolean> {
  const head = new Uint8Array(await file.slice(0, PDF_MAGIC.length).arrayBuffer());
  return head.length === PDF_MAGIC.length && head.every((byte, i) => byte === PDF_MAGIC[i]);
}

// TODO(2.2): Implement `storeUpload`.
//   - Reject anything that is not a PDF (check the magic bytes `%PDF-`, not
//     just the declared content type or the extension).
//   - Reject files over `env.MAX_UPLOAD_BYTES` with a 413.
//   - Generate the filename yourself (e.g. `<uuid>.pdf`). Never build a path
//     out of the name the browser sent — that is a path-traversal bug waiting
//     to happen. Keep the original name in the database column instead.
export async function storeUpload(file: File): Promise<StoredFile> {
  const mbMaxUploadSize = (env.MAX_UPLOAD_BYTES / 1024 / 1024).toFixed(2);
  if (file.size > env.MAX_UPLOAD_BYTES)
    throw HttpError.payloadTooLarge(`File exceeds the ${mbMaxUploadSize}MB limit`);

  if (!(await hasPdfMagicBytes(file))) throw new HttpError(415, "Unsupported media type");

  const uuid = crypto.randomUUID();

  await writeFile(join(env.storageDir, `${uuid}.pdf`), await file.bytes());
  return { key: `${uuid}.pdf`, bytes: file.size, contentType: "application/pdf" };
}

// TODO(2.3): Implement `readStoredFile(key)` — resolve the key against
//   `env.storageDir`, verify the resolved path is still INSIDE that directory,
//   and return the bytes. Reducto needs them; so does a "download original"
//   link if you add one.

export async function readStoredFile(key: string): Promise<Buffer> {
  const path = resolve(env.storageDir, key);

  if (!path.startsWith(env.storageDir + sep))
    throw new Error(`Storage key "${key}" resolves outside the storage directory`);

  return await readFile(path);
}

// TODO(11.4): Implement `cleanupOrphans()` — delete files on disk with no
//   matching row, and files belonging to failed documents older than N days.
//   Wire it to a scheduled Inngest function (`{ cron: '0 3 * * *' }`) or expose
//   it as a script. The brief asks for "límites de tamaño y limpieza".
