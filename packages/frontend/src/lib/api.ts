import { captureError, Severity } from "errorping";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { params?: Record<string, string> } = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;

  let url = `${API_BASE}${path}`;
  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.set(key, value);
      }
    }
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  const headers: Record<string, string> = {};
  if (
    fetchOptions.body &&
    typeof fetchOptions.body === "string" &&
    fetchOptions.method !== "GET"
  ) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    credentials: "include",
    ...fetchOptions,
    headers: {
      ...headers,
      ...(fetchOptions.headers as Record<string, string>),
    },
  });

  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = await res.text().catch(() => null);
    }

    let message =
      body && typeof body === "object" && "error" in body
        ? (body as { error: string }).error
        : `API error: ${res.status}`;

    if (res.status === 401) {
      message = "Unauthorized: Please Login";
    }

    const err = new ApiError(res.status, body, message);
    captureError(err, {
      severity: res.status >= 500 ? Severity.ERROR : Severity.WARNING,
      context: {
        method: fetchOptions.method || "GET",
        url: path,
        statusCode: res.status,
      },
    });
    throw err;
  }

  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}
