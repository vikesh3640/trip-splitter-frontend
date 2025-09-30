"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export default function EndTripClient({ tripId, isClosed }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const endTrip = async () => {
    if (!confirm("End this trip?")) return;
    try {
      const res = await fetch(`/api/proxy/trips/${tripId}/close`, { method: "PUT" });
      if (!res.ok) throw new Error(`Close failed: ${res.status}`);
      startTransition(() => router.refresh());
    } catch (e) {
      alert(e.message || "Failed to end trip");
    }
  };

  const reopenTrip = async () => {
    if (!confirm("Reopen this trip?")) return;
    try {
      const res = await fetch(`/api/proxy/trips/${tripId}/reopen`, { method: "PUT" });
      if (!res.ok) throw new Error(`Reopen failed: ${res.status}`);
      startTransition(() => router.refresh());
    } catch (e) {
      alert(e.message || "Failed to reopen trip");
    }
  };

  return isClosed ? (
    <button onClick={reopenTrip} disabled={isPending} className="px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50">
      {isPending ? "Working..." : "Reopen Trip"}
    </button>
  ) : (
    <button onClick={endTrip} disabled={isPending} className="px-3 py-1.5 rounded-lg bg-brand-teal text-white text-sm hover:opacity-90">
      {isPending ? "Ending..." : "End Trip"}
    </button>
  );
}
