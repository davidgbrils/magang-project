import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiClientError, request } from "../../lib/api-client";

describe("request API error boundary", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

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

  it("parses a JSON error envelope even when content type is missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.example.test");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: { code: "FORBIDDEN", message: "Akses ditolak." } }), {
          status: 403,
        }),
      ),
    );

    await expect(request("/api/me")).rejects.toMatchObject({
      status: 403,
      apiError: { error: { code: "FORBIDDEN", message: "Akses ditolak." } },
    });
  });

  it.each([
    ["malformed JSON", "{not-json", { "content-type": "application/json" }],
    ["non-JSON", "gateway unavailable", { "content-type": "text/plain" }],
  ])("keeps %s errors inside ApiClientError", async (_case, body, headers) => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(body, { status: 502, headers })),
    );

    await expect(request("/api/me")).rejects.toMatchObject({
      name: "ApiClientError",
      status: 502,
      apiError: { error: { code: "HTTP_ERROR" } },
    });
  });

  it("returns a successful JSON response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ id: "batch-123", status: "ready" }), {
          headers: { "content-type": "application/json" },
        }),
      ),
    );

    await expect(request<{ id: string; status: string }>("/api/batches/batch-123")).resolves.toEqual({
      id: "batch-123",
      status: "ready",
    });
  });

  it("rejects malformed JSON from a successful response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("{not-json", {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      ),
    );

    await expect(request("/api/me")).rejects.toThrow(
      "Respons API tidak berisi JSON yang valid.",
    );
  });

  it("adds authorization only when an access token is supplied", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() =>
        Promise.resolve(new Response(JSON.stringify({ ok: true }))),
      ),
    );

    await request("/api/me");
    expect(vi.mocked(fetch).mock.calls[0]?.[1]).toMatchObject({ headers: expect.any(Headers) });
    expect(new Headers(vi.mocked(fetch).mock.calls[0]?.[1]?.headers).get("Authorization")).toBeNull();

    await request("/api/me", { accessToken: "test-token" });
    expect(new Headers(vi.mocked(fetch).mock.calls[1]?.[1]?.headers).get("Authorization")).toBe(
      "Bearer test-token",
    );
  });
});
