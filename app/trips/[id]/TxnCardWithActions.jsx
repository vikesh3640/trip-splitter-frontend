"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import TransactionCard from "../../../components/TransactionCard";

function EditModal({ open, onClose, onSubmit, busy, initial }) {
  const [title, setTitle] = useState(initial.title || "");
  const [payers, setPayers] = useState(
    (initial.payers || []).map((p) => ({ name: p.name, amount: String(p.amount) }))
  );
  const [participants, setParticipants] = useState((initial.participants || []).join(", "));
  const [splitType, setSplitType] = useState(initial.splitType || "equal");
  const [customAmounts, setCustomAmounts] = useState(
    (initial.customAmounts || []).join(", ")
  );

  useEffect(() => {
    if (!open) return;
    setTitle(initial.title || "");
    setPayers((initial.payers || []).map((p) => ({ name: p.name, amount: String(p.amount) })));
    setParticipants((initial.participants || []).join(", "));
    setSplitType(initial.splitType || "equal");
    setCustomAmounts((initial.customAmounts || []).join(", "));
  }, [open, initial]);

  const total = useMemo(
    () =>
      payers.reduce((s, p) => {
        const n = Number(p.amount);
        return s + (Number.isFinite(n) ? n : 0);
      }, 0),
    [payers]
  );

  if (!open) return null;

  const addPayer = () => setPayers((p) => [...p, { name: "", amount: "" }]);
  const removePayer = (i) => setPayers((p) => p.filter((_, idx) => i !== idx));

  const submit = (e) => {
    e.preventDefault();

    const normTitle = title.trim();
    if (!normTitle) return alert("Title is required.");

    const normPayers = payers
      .map((p) => ({ name: p.name.trim(), amount: Number(p.amount) }))
      .filter((p) => p.name && Number.isFinite(p.amount) && p.amount >= 0);
    if (!normPayers.length) return alert("At least one valid payer required.");

    const parts = participants
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!parts.length) return alert("Participants are required.");

    const body = {
      title: normTitle,
      payers: normPayers,
      participants: parts,
      splitType,
    };

    if (splitType === "custom") {
      const arr = customAmounts
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map(Number);

      if (arr.length !== parts.length)
        return alert("Custom amounts must match participants count.");
      if (arr.some((n) => !Number.isFinite(n) || n < 0))
        return alert("Custom amounts must be non-negative numbers.");

      body.customAmounts = arr;
    }

    onSubmit(body);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-card border border-gray-100">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="text-lg font-semibold">Edit Transaction</h3>
          <button
            className="text-gray-500 hover:text-gray-800"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={submit} className="px-5 py-4 space-y-5">
          {/* Title */}
          <label className="block text-sm font-medium text-gray-700">
            Title
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={busy}
            />
          </label>

          {/* Payers */}
          <div>
            <div className="text-sm font-medium text-gray-700">Payers</div>
            <div className="mt-2 space-y-2">
              {payers.map((p, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className="flex-1 rounded-lg border px-3 py-2"
                    placeholder="Name"
                    value={p.name}
                    onChange={(e) => {
                      const copy = [...payers];
                      copy[i].name = e.target.value;
                      setPayers(copy);
                    }}
                    disabled={busy}
                  />
                  <input
                    className="w-36 rounded-lg border px-3 py-2"
                    placeholder="Amount"
                    type="number"
                    inputMode="decimal"
                    value={p.amount}
                    onChange={(e) => {
                      const copy = [...payers];
                      copy[i].amount = e.target.value;
                      setPayers(copy);
                    }}
                    disabled={busy}
                  />
                  <button
                    type="button"
                    className="px-3 rounded-lg border hover:bg-gray-50"
                    onClick={() => removePayer(i)}
                    disabled={busy || payers.length === 1}
                    title="Remove payer"
                  >
                    −
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={addPayer}
                className="text-sm text-emerald-700 hover:underline"
                disabled={busy}
              >
                + Add another payer
              </button>
              <div className="text-sm text-gray-600">
                Total: <span className="font-medium">₹{total}</span>
              </div>
            </div>
          </div>

          {/* Participants */}
          <label className="block text-sm font-medium text-gray-700">
            Participants (comma-separated)
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2"
              placeholder="e.g., A, B, C"
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
              disabled={busy}
            />
          </label>

          {/* Split type */}
          <label className="block text-sm font-medium text-gray-700">
            Split Type
            <div className="mt-1 flex items-center gap-4">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="splitType"
                  value="equal"
                  checked={splitType === "equal"}
                  onChange={() => setSplitType("equal")}
                  disabled={busy}
                />
                Equal
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="splitType"
                  value="custom"
                  checked={splitType === "custom"}
                  onChange={() => setSplitType("custom")}
                  disabled={busy}
                />
                Custom
              </label>
            </div>
          </label>

          {/* Custom amounts */}
          {splitType === "custom" && (
            <label className="block text-sm font-medium text-gray-700">
              Custom Amounts (comma-separated)
              <input
                className="mt-1 w-full rounded-lg border px-3 py-2"
                placeholder="e.g., 200, 100, 100"
                value={customAmounts}
                onChange={(e) => setCustomAmounts(e.target.value)}
                disabled={busy}
              />
            </label>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border hover:bg-gray-50"
              disabled={busy}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-brand-teal text-white hover:opacity-90"
              disabled={busy}
            >
              {busy ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TxnCardWithActions({ txn, disabled = false }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (disabled) return <TransactionCard txn={txn} />;

  const onEdit = async (body) => {
    try {
      const res = await fetch(`/api/proxy/transactions/${txn._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`Edit failed: ${res.status} ${t}`);
      }
      setOpen(false);
      startTransition(() => router.refresh());
    } catch (e) {
      alert(e.message || "Failed to update");
    }
  };

  const onDelete = async () => {
    if (!confirm("Delete this transaction?")) return;
    try {
      const res = await fetch(`/api/proxy/transactions/${txn._id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
      startTransition(() => router.refresh());
    } catch (e) {
      alert(e.message || "Failed to delete");
    }
  };

  return (
    <div className="relative">
      <TransactionCard txn={txn} />

      <div className="absolute right-4 top-4 flex gap-2">
        <button
          className="px-2 py-1 text-xs rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-60"
          onClick={() => setOpen(true)}
          disabled={isPending}
          title="Edit transaction"
        >
          Edit
        </button>
        <button
          className="px-2 py-1 text-xs rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-60"
          onClick={onDelete}
          disabled={isPending}
          title="Delete transaction"
        >
          Delete
        </button>
      </div>

      <EditModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={onEdit}
        busy={isPending}
        initial={txn}
      />
    </div>
  );
}
