import { retrieveRawInitData } from "@tma.js/sdk-react";

/**
 * Client-side fetch helpers. Every request to our own API carries the raw
 * Telegram init data in `Authorization: tma <initDataRaw>`, which lib/auth.ts
 * validates on the server.
 */

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function getInitDataRaw(): string | undefined {
  try {
    return retrieveRawInitData();
  } catch {
    return undefined;
  }
}

export async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const raw = getInitDataRaw();
  if (raw) headers.set("Authorization", `tma ${raw}`);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(input, { ...init, headers });
}

/** apiFetch + JSON parsing + error normalisation. */
export async function apiJson<T>(input: string, init: RequestInit = {}): Promise<T> {
  const response = await apiFetch(input, init);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(response.status, body.error || response.statusText || "Request failed");
  }
  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(url: string) => apiJson<T>(url),
  post: <T>(url: string, body: unknown) =>
    apiJson<T>(url, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(url: string, body: unknown) =>
    apiJson<T>(url, { method: "PUT", body: JSON.stringify(body) }),
};
