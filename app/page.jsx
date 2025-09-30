"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import Link from "next/link";
import CreateTripClient from "./CreateTripClient";
import DeleteTripButton from "../components/DeleteTripButton";

export default function HomePage() {
  const [trips, setTrips] = useState([]);
  const [error, setError] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const [loading, startTransition] = useTransition();

  const refreshSession = useCallback(async () => {
    try {
      const r = await fetch("/api/auth/session", { cache: "no-store" });
      const j = await r.json();
      setSignedIn(!!j?.signedIn);
      return !!j?.signedIn;
    } catch {
      setSignedIn(false);
      return false;
    }
  }, []);

  const fetchTrips = useCallback(async () => {
    setError("");
    try {
      const res = await fetch("/api/proxy/trips", { cache: "no-store" });
      if (!res.ok) throw new Error(await res.text());
      setTrips(await res.json());
    } catch (e) {
      setTrips([]);
      if (signedIn) setError(e?.message || "Failed to load trips");
      else setError("");
    }
  }, [signedIn]);

  // initial load
  useEffect(() => {
    startTransition(async () => {
      const ok = await refreshSession();
      if (ok) await fetchTrips();
    });
  }, [refreshSession, fetchTrips]);

  // react to auth changes and window focus
  useEffect(() => {
    const handler = () =>
      startTransition(async () => {
        const ok = await refreshSession();
        if (ok) await fetchTrips();
        else setTrips([]);
      });

    window.addEventListener("auth:changed", handler);
    window.addEventListener("focus", handler);
    return () => {
      window.removeEventListener("auth:changed", handler);
      window.removeEventListener("focus", handler);
    };
  }, [refreshSession, fetchTrips]);

  const refetch = useCallback(() => {
    startTransition(async () => {
      const ok = await refreshSession();
      if (ok) await fetchTrips();
    });
  }, [refreshSession, fetchTrips]);

  return (
    <div className="space-y-6">
      <div className="mx-auto w-fit pill px-6 py-3 text-center">
        <div className="text-xl font-semibold">Your Trips</div>
      </div>

      {!signedIn ? (
        <div className="card p-6 text-center text-gray-600">
          Please sign in to view and create trips.
        </div>
      ) : (
        <>
          {error && <div className="card p-5 text-sm text-red-600">{error}</div>}

          <div className="grid gap-4 sm:grid-cols-2">
            {trips.map((t) => (
              <Link key={t._id} href={`/trips/${t._id}`} className="relative card p-5 hover:shadow-lg transition">
                <div className="absolute top-4 right-4">
                  <DeleteTripButton tripId={t._id} onDeleted={refetch} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-semibold text-emerald-700">{t.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {t.members?.length || 0} member{(t.members?.length || 0) === 1 ? "" : "s"}
                    </div>
                    <div className="mt-2 flex gap-2">
                      {(t.members || []).slice(0, 6).map((m) => (
                        <span key={m.name}
                          className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-emerald-50 px-2 text-xs text-emerald-700">
                          {m.name?.[0]?.toUpperCase() || "?"}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(t.createdAt).toLocaleDateString()}
                    {t.isClosed && (
                      <div className="mt-1 inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700">
                        Closed
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}

            {!trips.length && !error && (
              <div className="card p-5 text-sm text-gray-500">
                {loading ? "Loading..." : "No trips yet. Click the “New Trip” button to create one."}
              </div>
            )}
          </div>

          <CreateTripClient onCreated={refetch} />
        </>
      )}
    </div>
  );
}
