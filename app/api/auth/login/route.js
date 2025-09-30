import { NextResponse } from "next/server";
import { verifyIdToken } from "@/lib/firebaseAdmin";

export async function POST(req) {
  try {
    const { idToken } = await req.json();
    if (!idToken) return NextResponse.json({ error: "Missing idToken" }, { status: 400 });

    const decoded = await verifyIdToken(idToken);
    const res = NextResponse.json({ ok: true, email: decoded.email, uid: decoded.uid });

    // Set cookie (HttpOnly)
    res.cookies.set("fb_token", idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60, // 1 hour
    });

    return res;
  } catch (err) {
    return NextResponse.json({ error: String(err?.message || err) }, { status: 401 });
  }
}
