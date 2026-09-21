/**
 * Persistent storage for uploaded SOP PDFs.
 *
 * The brief: keep the PDFs in a directory that survives restarts, with size
 * limits and cleanup. No S3.
 */
import { env } from "../config/env.ts";

export interface StoredFile {
  /** Path relative to `env.storageDir`, safe to persist in the database. */
  key: string;
  bytes: number;
  contentType: string;
}

// TODO(2.2): Implement `storeUpload`.
//   - Reject anything that is not a PDF (check the magic bytes `%PDF-`, not
//     just the declared content type or the extension).
//   - Reject files over `env.MAX_UPLOAD_BYTES` with a 413.
//   - Generate the filename yourself (e.g. `<uuid>.pdf`). Never build a path
//     out of the name the browser sent — that is a path-traversal bug waiting
//     to happen. Keep the original name in the database column instead.
export async function storeUpload(_file: File): Promise<StoredFile> {
  void env;
  throw new Error("storeUpload not implemented — see TODO(2.2)");
}

// TODO(2.3): Implement `readStoredFile(key)` — resolve the key against
//   `env.storageDir`, verify the resolved path is still INSIDE that directory,
//   and return the bytes. Reducto needs them; so does a "download original"
//   link if you add one.

// TODO(11.4): Implement `cleanupOrphans()` — delete files on disk with no
//   matching row, and files belonging to failed documents older than N days.
//   Wire it to a scheduled Inngest function (`{ cron: '0 3 * * *' }`) or expose
//   it as a script. The brief asks for "límites de tamaño y limpieza".
