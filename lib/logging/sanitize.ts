export type LogValue = string | number | boolean | null;

export type LogContext = Record<string, LogValue | undefined>;

const SENSITIVE_FIELDS = [
  "password",
  "passcode",
  "token",
  "secret",
  "authorization",
  "cookie",
  "apikey",
  "servicerolekey",
  "email",
];

function isSensitiveField(key: string): boolean {
  const normalized = key.replace(/[^a-z0-9]/gi, "").toLowerCase();

  return SENSITIVE_FIELDS.some((field) => normalized.includes(field));
}

export function sanitizeLogContext(
  context: LogContext,
): Record<string, LogValue> {
  return Object.fromEntries(
    Object.entries(context)
      .filter(
        (entry): entry is [string, LogValue] => entry[1] !== undefined,
      )
      .map(([key, value]) => [
        key,
        isSensitiveField(key) ? "[REDACTED]" : value,
      ]),
  );
}
