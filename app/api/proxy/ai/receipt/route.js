import { forwardRaw } from "../../_utils";
export const runtime = "nodejs";
export async function POST(req) {
  try {
    return await forwardRaw(req, "/api/ai/receipt", "POST");
  } catch (e) {
    if (e?.message === "NO_AUTH") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ error: "Proxy error", detail: String(e?.message || e) }), {
      status: 502,
      headers: { "content-type": "application/json" },
    });
  }
}
