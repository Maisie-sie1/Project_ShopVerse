import { headers } from "next/headers";

/**
 * Server-side fetch helper that calls this app's own REST API
 * while forwarding the visitor's cookies (so auth + cart work).
 */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const base = `${proto}://${host}`;

  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      cookie: h.get("cookie") ?? "",
      ...(init?.headers as Record<string, string> | undefined),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text.slice(0, 200)}`);
  }

  return (await res.json()) as T;
}