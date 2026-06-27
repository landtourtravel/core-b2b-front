/**
 * Production-safe logger. In production, redacts connection strings and
 * truncates verbose stack traces. In development, logs the full error.
 */
export function logError(context: string, err: unknown): void {
  if (process.env.NODE_ENV === "production") {
    const message = err instanceof Error ? err.message : String(err);
    const safe = message
      .replace(/postgresql:\/\/[^\s"']*/gi, "[REDACTED_URL]")
      .replace(/password=[^&\s]*/gi, "[REDACTED]")
      .split("\n")[0]
      .slice(0, 200);
    console.error(`[${context}]`, safe);
  } else {
    console.error(`[${context}]`, err);
  }
}
