// app/api/proxy/_utils.js
import { cookies } from "next/headers";

const BACKEND_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

/** Build Authorization header from the Firebase session cookie */
function buildAuthHeaders() {
  const token = cookies().get("fb_token")?.value;
  if (!token) throw new Error("NO_AUTH");
  const h = new Headers();
  h.set("Authorization", `Bearer ${token}`);
  return h;
}

/**
 * Forward raw/streaming bodies (e.g., multipart/form-data for file uploads)
 * IMPORTANT: we construct a Request with `duplex: "half"` so Node/undici
 * allows streaming the body without buffering. Do NOT read the body first.
 */
export async function forwardRaw(req, path, method = "POST") {
  const headers = buildAuthHeaders();
  const ct = req.headers.get("content-type");
  if (ct) headers.set("content-type", ct);

  const url = new URL(path, BACKEND_BASE).toString();

  const init = {
    method,
    headers,
    body: req.body ?? null, // pass the original ReadableStream through
  };
  if (init.body) init.duplex = "half";

  const upstream = new Request(url, init);
  return fetch(upstream, { cache: "no-store" });
}

/**
 * Forward JSON requests (reads raw text and passes it as-is).
 * Use this for typical POST/PUT JSON calls.
 */
export async function forwardJSON(req, path, method = "POST") {
  const headers = buildAuthHeaders();
  headers.set("content-type", "application/json");

  const body = await req.text(); // raw pass-through (no re-encoding)
  const url = new URL(path, BACKEND_BASE).toString();

  return fetch(url, { method, headers, body, cache: "no-store" });
}

/** Forward requests that have no body (GET/DELETE/etc.) */
export async function forwardNoBody(path, method = "GET") {
  const headers = buildAuthHeaders();
  const url = new URL(path, BACKEND_BASE).toString();
  return fetch(url, { method, headers, cache: "no-store" });
}

/**
 * Generic proxy that can forward any method/body.
 * If a streaming body is present, we again use `duplex: "half"`.
 */
export async function proxyFetch(req, path, opts = {}) {
  const headers = buildAuthHeaders();

  if (opts.headers) {
    for (const [k, v] of Object.entries(opts.headers)) headers.set(k, v);
  }

  const method = opts.method || req?.method || "GET";
  const body =
    "body" in opts
      ? opts.body
      : method === "GET" || method === "HEAD"
      ? undefined
      : req.body ?? null;

  const url = new URL(path, BACKEND_BASE).toString();

  const init = { method, headers, body };
  if (body) init.duplex = "half";

  const upstream = new Request(url, init);
  return fetch(upstream, { cache: "no-store" });
}
