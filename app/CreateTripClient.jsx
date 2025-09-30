"use client";

import { useState, useTransition } from "react";
import CreateTripModal from "../components/CreateTripModal";

export default function CreateTripClient({ onCreated }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const onSubmit = async (body) => {
    try {
      const res = await fetch("/api/proxy/trips", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Create failed: ${res.status} ${await res.text()}`);
      setOpen(false);
      startTransition(() => onCreated?.());
    } catch (e) {
      alert(e.message || "Failed to create trip");
    }
  };

  return (
    <>
      <button className="fab" onClick={() => setOpen(true)}>New Trip</button>
      <CreateTripModal open={open} onClose={() => setOpen(false)} onSubmit={onSubmit} busy={isPending} />
    </>
  );
}
