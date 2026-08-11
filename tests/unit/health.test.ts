import { describe, expect, it } from "vitest";
import { GET } from "../../app/api/health/route";

describe("GET /api/health", () => {
  it("returns healthy response", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");

    expect(body.status).toBe("ok");
    expect(body.version).toBeTruthy();

    expect(Number.isNaN(Date.parse(body.timestamp))).toBe(false);
  });
});
