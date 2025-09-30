"use client";

import { useTransition } from "react";

export default function DeleteTripButton({ tripId, onDeleted }) {
  const [isPending, startTransition] = useTransition();

  async function onDelete(e) {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (!confirm("Delete this trip and all its transactions?")) return;

    try {
      // Call the proxy (this forwards Authorization: Bearer <JWT>)
      const res = await fetch(`/api/proxy/trips/${tripId}`, { method: "DELETE" });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`Delete failed: ${res.status} ${t}`);
      }
      startTransition(() => onDeleted?.());
    } catch (err) {
      alert(err.message || "Failed to delete trip");
    }
  }

  const stop = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
  };

  return (
    <button
      onMouseDown={stop}
      onClick={onDelete}
      disabled={isPending}
      className="px-2 py-1 text-xs rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-60"
      title="Delete trip"
    >
      {isPending ? "…" : "Delete"}
    </button>
  );
}
