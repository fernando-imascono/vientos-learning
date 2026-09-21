/**
 * Minimal structured logger. One JSON line per event so Inngest runs, HTTP
 * requests and agent steps can be correlated by `requestId` / `documentId`.
 */
type Level = "debug" | "info" | "warn" | "error";
type Fields = Record<string, unknown>;

function emit(level: Level, message: string, fields: Fields = {}) {
  const line = JSON.stringify({
    level,
    time: new Date().toISOString(),
    message,
    ...fields,
  });
  if (level === "error" || level === "warn") console.error(line);
  else console.log(line);
}

export const logger = {
  debug: (message: string, fields?: Fields) => emit("debug", message, fields),
  info: (message: string, fields?: Fields) => emit("info", message, fields),
  warn: (message: string, fields?: Fields) => emit("warn", message, fields),
  error: (message: string, fields?: Fields) => emit("error", message, fields),
  /** Returns a logger that stamps every line with the same fields. */
  child(bound: Fields) {
    return {
      debug: (m: string, f?: Fields) => emit("debug", m, { ...bound, ...f }),
      info: (m: string, f?: Fields) => emit("info", m, { ...bound, ...f }),
      warn: (m: string, f?: Fields) => emit("warn", m, { ...bound, ...f }),
      error: (m: string, f?: Fields) => emit("error", m, { ...bound, ...f }),
    };
  },
};
