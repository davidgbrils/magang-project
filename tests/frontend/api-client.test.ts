import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiClientError, request } from "../../lib/api-client";

describe("request API error boundary", () => {
  afterEach(() => vi.restoreAllMocks());

  it("parses the common API error envelope into a typed error", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.example.test");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: {
              code: "VALIDATION_ERROR",
              message: "Kolom NIM tidak ditemukan.",
              fields: [{ field: "sheetName", message: "Kolom NIM wajib ada." }],
              requestId: "request-123",
            },
          }),
          { status: 422, headers: { "content-type": "application/json" } },
        ),
      ),
    );

    const promise = request("/api/graduation-batches");

    await expect(promise).rejects.toBeInstanceOf(ApiClientError);
    await expect(promise).rejects.toMatchObject({
      apiError: {
        error: {
          code: "VALIDATION_ERROR",
          message: "Kolom NIM tidak ditemukan.",
          fields: [{ field: "sheetName", message: "Kolom NIM wajib ada." }],
          requestId: "request-123",
        },
      },
      status: 422,
    });
  });
});
