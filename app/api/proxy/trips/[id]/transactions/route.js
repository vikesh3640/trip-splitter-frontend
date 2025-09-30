import { NextResponse } from "next/server";
import { forwardJSON } from "../../../_utils";

export async function POST(req, { params }) {
  try {
    const upstream = await forwardJSON(req, `/api/trips/${params.id}/transactions`, "POST");

    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: { "content-type": upstream.headers.get("content-type") || "application/json" },
    });
  } catch (e) {
    if (e?.message === "NO_AUTH") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Proxy error" }, { status: 500 });
  }
}
