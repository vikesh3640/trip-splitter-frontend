// app/api/auth/session/route.js
export const runtime = "nodejs";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyIdToken } from "@/lib/firebaseAdmin";

export async function GET() {
  try {
    const token = cookies().get("fb_token")?.value;
    if (!token) return NextResponse.json({ signedIn: false });

    const decoded = await verifyIdToken(token);
    return NextResponse.json({
      signedIn: true,
      email: decoded.email || null,
      uid: decoded.uid,
    });
  } catch (e) {
    return NextResponse.json({ signedIn: false });
  }
}
