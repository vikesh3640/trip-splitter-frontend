// app/api/auth/login/route.js
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

    // 1h cookie; tweak maxAge as you like
    res.cookies.set("fb_token", idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
    });

    return res;
  } catch (err) {
    const msg = String(err?.message || err);
    const status = msg.includes("FIREBASE_ADMIN_NOT_CONFIGURED") ? 500 : 401;
    return NextResponse.json({ error: msg }, { status });
  }
}
