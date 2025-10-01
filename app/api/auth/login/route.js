export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { verifyIdToken } from "@/lib/firebaseAdmin";

export async function POST(req) {
  try {
    const { idToken } = await req.json();
    if (!idToken) {
      return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
    }

    const decoded = await verifyIdToken(idToken);

    const res = NextResponse.json({
      ok: true,
      email: decoded.email || null,
      uid: decoded.uid,
    });

    // Cookie for our proxy → backend auth
    res.cookies.set("fb_token", idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60, // 1 hour
    });

    return res;
  } catch (err) {
    return NextResponse.json(
      { error: "verifyIdToken failed", detail: String(err?.message || err) },
      { status: 500 }
    );
  }
}
