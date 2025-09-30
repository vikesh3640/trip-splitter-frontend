// lib/api.js
import "server-only";
import { cookies } from "next/headers";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

/**
 * Server-side helpers that talk to the backend directly and
 * forward the Firebase session (fb_token) from cookies as Bearer auth.
 */
async function buildAuthHeaders(init = {}) {
  const cookieStore = cookies();
  const token = cookieStore.get("fb_token")?.value;

  const headers = new Headers(init.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return headers;
}

export async function apiGet(path, init = {}) {
  const headers = await buildAuthHeaders(init);
  const res = await fetch(`${API_BASE}${path}`, {
    cache: "no-store",
    ...init,
    headers,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`GET ${path} ${res.status}: ${body}`);
  }
  return res.json();
}

export async function apiPost(path, body, init = {}) {
  const headers = await buildAuthHeaders(init);
  headers.set("Content-Type", "application/json");

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    body: JSON.stringify(body),
    ...init,
    headers,
  });

  if (!res.ok) {
    const out = await res.text().catch(() => "");
    throw new Error(`POST ${path} ${res.status}: ${out}`);
  }
  return res.json();
}
