// app/api/proxy/_utils.js
import { cookies } from "next/headers";

const BACKEND_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

function buildHeaders() {
  const token = cookies().get("fb_token")?.value;
  if (!token) throw new Error("NO_AUTH");
  const h = new Headers();
  h.set("Authorization", `Bearer ${token}`);
  return h;
}

// Forward raw (multipart/form-data, streams)
export async function forwardRaw(req, path, method = "POST") {
  const headers = buildHeaders();
  const ct = req.headers.get("content-type");
  if (ct) headers.set("content-type", ct);

  const url = new URL(path, BACKEND_BASE).toString();
  return fetch(url, {
    method,
    headers,
    body: req.body,  
    cache: "no-store",
    duplex: "half",
  });
}

// For JSON bodies 
export async function forwardJSON(req, path, method = "POST") {
  const headers = buildHeaders();
  headers.set("content-type", "application/json");

  const body = await req.text();
  const url = new URL(path, BACKEND_BASE).toString();
  return fetch(url, { method, headers, body, cache: "no-store" });
}

export async function forwardNoBody(path, method = "GET") {
  const headers = buildHeaders();
  const url = new URL(path, BACKEND_BASE).toString();
  return fetch(url, { method, headers, cache: "no-store" });
}

export async function proxyFetch(req, path, opts = {}) {
  const headers = buildHeaders();
  if (opts.headers) {
    for (const [k, v] of Object.entries(opts.headers)) headers.set(k, v);
  }
  const method = opts.method || req?.method || "GET";
  const body =
    "body" in opts
      ? opts.body
      : method === "GET" || method === "HEAD"
      ? undefined
      : req.body;

  const url = new URL(path, BACKEND_BASE).toString();
  return fetch(url, { method, headers, body, cache: "no-store" });
}
