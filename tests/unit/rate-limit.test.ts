import { describe, expect, it, vi } from "vitest";
import { consumeRateLimit } from "../../lib/rate-limit";

describe("consumeRateLimit", () => {
  it("maps RPC response to application result", async () => {
    const single = vi.fn().mockResolvedValue({
      data: {
        allowed: true,
        retry_after_seconds: 0,
      },
      error: null,
    });

    const rpc = vi.fn().mockReturnValue({
      single,
    });

    const supabase = {
      rpc,
    } as never;

    const result = await consumeRateLimit(supabase, "create_post");

    expect(rpc).toHaveBeenCalledWith("consume_rate_limit", {
      p_action: "create_post",
    });

    expect(single).toHaveBeenCalledOnce();

    expect(result).toEqual({
      allowed: true,
      retryAfterSeconds: 0,
    });
  });

  it("maps blocked RPC response correctly", async () => {
    const single = vi.fn().mockResolvedValue({
      data: {
        allowed: false,
        retry_after_seconds: 42,
      },
      error: null,
    });

    const supabase = {
      rpc: vi.fn().mockReturnValue({
        single,
      }),
    } as never;

    const result = await consumeRateLimit(supabase, "create_comment");

    expect(result).toEqual({
      allowed: false,
      retryAfterSeconds: 42,
    });
  });

  it("throws when RPC returns an error", async () => {
    const supabase = {
      rpc: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: null,
          error: {
            message: "database unavailable",
          },
        }),
      }),
    } as never;

    await expect(consumeRateLimit(supabase, "create_post")).rejects.toThrow(
      "Rate limit check failed.",
    );
  });

  it("throws when RPC returns no data", async () => {
    const supabase = {
      rpc: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }),
    } as never;

    await expect(consumeRateLimit(supabase, "create_comment")).rejects.toThrow(
      "Rate limit check failed.",
    );
  });
});
