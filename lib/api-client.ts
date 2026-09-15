export type ApiFieldError = {
  field: string;
  message: string;
};

export type ApiError = {
  error: {
    code: string;
    message: string;
    fields?: ApiFieldError[];
    requestId?: string;
  };
};

export class ApiClientError extends Error {
  readonly status: number;
  readonly apiError: ApiError;

  constructor(status: number, apiError: ApiError) {
    super(apiError.error.message);
    this.name = "ApiClientError";
    this.status = status;
    this.apiError = apiError;
  }
}

export type RequestOptions = RequestInit & {
  accessToken?: string;
};

function getApiUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  return baseUrl ? new URL(path, baseUrl).toString() : path;
}

function asApiError(value: unknown, status: number): ApiError {
  if (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof value.error === "object" &&
    value.error !== null &&
    "code" in value.error &&
    "message" in value.error &&
    typeof value.error.code === "string" &&
    typeof value.error.message === "string"
  ) {
    return value as ApiError;
  }

  return {
    error: {
      code: "HTTP_ERROR",
      message: `Permintaan gagal (${status}).`,
    },
  };
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { accessToken, headers, ...init } = options;
  const requestHeaders = new Headers(headers);
  requestHeaders.set("Accept", "application/json");
  if (accessToken) requestHeaders.set("Authorization", `Bearer ${accessToken}`);

  const response = await fetch(getApiUrl(path), { ...init, headers: requestHeaders });
  const rawBody = await response.text();
  let body: unknown;
  let hasInvalidJson = false;
  if (rawBody.trim()) {
    try {
      body = JSON.parse(rawBody) as unknown;
    } catch {
      hasInvalidJson = true;
    }
  }

  if (!response.ok) throw new ApiClientError(response.status, asApiError(body, response.status));
  if (hasInvalidJson) throw new Error("Respons API tidak berisi JSON yang valid.");
  return body as T;
}
