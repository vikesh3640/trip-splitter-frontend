// app/api/proxy/ai/receipt/route.js
import { forwardRaw } from "../../_utils";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const upstream = await forwardRaw(req, "/api/ai/receipt", "POST");

    // Force decode on the server, then re-send clean JSON
    const text = await upstream.text();
    const status = upstream.status;

    return new Response(text, {
      status,
      headers: {
        // Always send explicit JSON without any content-encoding
        "content-type":
          upstream.headers.get("content-type") || "application/json",
        "cache-control": "no-store",
      },
    });
  } catch (e) {
    if (e?.message === "NO_AUTH") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      });
    }
    return new Response(
      JSON.stringify({
        error: "Proxy error",
        detail: String(e?.message || e),
      }),
      {
        status: 502,
        headers: { "content-type": "application/json" },
      }
    );
  }
}
