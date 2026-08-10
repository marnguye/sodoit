import "server-only";

import { sanitizeLogContext, type LogContext } from "@/lib/logging/sanitize";

type LogLevel = "info" | "warn" | "error";

function write(level: LogLevel, event: string, context: LogContext = {}) {
  const entry = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    event,
    ...sanitizeLogContext(context),
  });

  switch (level) {
    case "error":
      console.error(entry);
      break;

    case "warn":
      console.warn(entry);
      break;

    default:
      console.info(entry);
  }
}

export const logger = {
  info(event: string, context?: LogContext) {
    write("info", event, context);
  },

  warn(event: string, context?: LogContext) {
    write("warn", event, context);
  },

  error(event: string, context?: LogContext) {
    write("error", event, context);
  },
};
