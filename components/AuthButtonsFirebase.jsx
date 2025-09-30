"use client";
import { useEffect, useState } from "react";
import { firebaseSignInWithGoogle, firebaseSignOut } from "@/lib/firebaseClient";

export default function AuthButtonsFirebase() {
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState({ signedIn: false });

  async function refreshSession() {
    try {
      const res = await fetch("/api/auth/session", { cache: "no-store" });
      const j = await res.json();
      setSession(j);
      return !!j?.signedIn;
    } catch {
      setSession({ signedIn: false });
      return false;
    }
  }

  useEffect(() => { refreshSession(); }, []);

  async function handleSignIn() {
    setLoading(true);
    try {
      const { idToken } = await firebaseSignInWithGoogle();
      await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      await refreshSession();
      //tell rest of the app
      window.dispatchEvent(new Event("auth:changed"));
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    setLoading(true);
    try {
      await firebaseSignOut();
      await fetch("/api/auth/logout", { method: "POST" });
      await refreshSession();
      //tell rest of the app
      window.dispatchEvent(new Event("auth:changed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {session.signedIn ? (
        <>
          <span className="text-sm text-gray-600">{session.email || session.uid}</span>
          <button onClick={handleSignOut} disabled={loading}
            className="px-3 py-1 rounded-xl bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 disabled:opacity-60">
            Sign out
          </button>
        </>
      ) : (
        <button onClick={handleSignIn} disabled={loading}
          className="px-3 py-1 rounded-xl bg-brand-teal text-white shadow-fab hover:opacity-90 disabled:opacity-60">
          {loading ? "…" : "Sign in with Google"}
        </button>
      )}
    </div>
  );
}
