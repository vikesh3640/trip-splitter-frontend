import { NextResponse } from "next/server";
import { forwardNoBody, forwardJSON } from "../_utils";

export async function GET() {
  try {
    const upstream = await forwardNoBody("/api/trips", "GET");
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

export async function POST(req) {
  try {
    const upstream = await forwardJSON(req, "/api/trips", "POST");
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
