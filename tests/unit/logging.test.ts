import { describe, expect, it } from "vitest";
import { sanitizeLogContext } from "../../lib/logging/sanitize";

describe("sanitizeLogContext", () => {
  it("preserves safe metadata", () => {
    expect(
      sanitizeLogContext({
        action: "create_post",
        status: "failed",
        retryAfterSeconds: 30,
      }),
    ).toEqual({
      action: "create_post",
      status: "failed",
      retryAfterSeconds: 30,
    });
  });

  it("removes undefined values", () => {
    expect(
      sanitizeLogContext({
        action: "create_post",
        reason: undefined,
      }),
    ).toEqual({
      action: "create_post",
    });
  });

  it("redacts sensitive fields", () => {
    expect(
      sanitizeLogContext({
        password: "secret-password",
        accessToken: "secret-token",
        authorization: "Bearer secret",
        email: "user@example.com",
        serviceRoleKey: "secret-key",
      }),
    ).toEqual({
      password: "[REDACTED]",
      accessToken: "[REDACTED]",
      authorization: "[REDACTED]",
      email: "[REDACTED]",
      serviceRoleKey: "[REDACTED]",
    });
  });

  it("detects sensitive fields regardless of separators", () => {
    expect(
      sanitizeLogContext({
        api_key: "secret",
        refresh_token: "secret",
        service_role_key: "secret",
      }),
    ).toEqual({
      api_key: "[REDACTED]",
      refresh_token: "[REDACTED]",
      service_role_key: "[REDACTED]",
    });
  });
});
