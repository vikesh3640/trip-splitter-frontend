"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

/* ----------------------------- Modal ----------------------------- */
function Modal({ open, onClose, onSubmit, busy, initial }) {
  const [title, setTitle] = useState("");
  const [payers, setPayers] = useState([{ name: "", amount: "" }]);
  const [participants, setParticipants] = useState("");
  const [splitType, setSplitType] = useState("equal");
  const [customAmounts, setCustomAmounts] = useState("");

  useEffect(() => {
    if (!open) return;
    setTitle(initial?.title ?? "");
    setParticipants(initial?.participants ?? "");
    setPayers(
      Array.isArray(initial?.payers) && initial.payers.length
        ? initial.payers.map((p) => ({ name: p?.name ?? "", amount: p?.amount ?? "" }))
        : [{ name: "", amount: "" }]
    );
  }, [open, initial]);

  if (!open) return null;

  const addPayer = () => setPayers((p) => [...p, { name: "", amount: "" }]);
  const removePayer = (i) => setPayers((p) => p.filter((_, idx) => i !== idx));

  const submit = (e) => {
    e.preventDefault();
    const normPayers = payers
      .map((p) => ({ name: (p.name || "").trim(), amount: Number(p.amount) }))
      .filter((p) => p.name && Number.isFinite(p.amount) && p.amount >= 0);

    const parts = (participants || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const body = {
      title: (title || "").trim(),
      payers: normPayers,
      participants: parts,
      splitType,
    };

    if (splitType === "custom") {
      const arr = (customAmounts || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map(Number);
      if (arr.length !== parts.length) return alert("Custom amounts must match participants count");
      if (arr.some((n) => !Number.isFinite(n) || n < 0)) return alert("Invalid custom amounts");
      body.customAmounts = arr;
    }

    if (!body.title) return alert("Title required");
    if (!normPayers.length) return alert("At least one payer required");
    if (!parts.length) return alert("Participants required");

    onSubmit(body);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-card border border-gray-100">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="text-lg font-semibold">Add Transaction</h3>
          <button className="text-gray-500 hover:text-gray-800" onClick={onClose} disabled={busy}>
            ✕
          </button>
        </div>

        <form onSubmit={submit} className="px-5 py-4 space-y-4">
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
                      const c = [...payers];
                      c[i].name = e.target.value;
                      setPayers(c);
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
                      const c = [...payers];
                      c[i].amount = e.target.value;
                      setPayers(c);
                    }}
                    disabled={busy}
                  />
                  <button
                    type="button"
                    className="px-3 rounded-lg border hover:bg-gray-50"
                    onClick={() => removePayer(i)}
                    disabled={busy || payers.length === 1}
                  >
                    −
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addPayer}
              className="mt-2 text-sm text-emerald-700 hover:underline"
              disabled={busy}
            >
              + Add another payer
            </button>
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
                />{" "}
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
                />{" "}
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
              {busy ? "Saving..." : "Add Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/*  Helpers to format title from AI JSON  */
function normalizeMerchant(s) {
  if (!s) return "";
  s = s.trim();
  return s
    .replace(/’/g, "'")
    .replace(/\s+/g, " ")
    .replace(/\bdominos\b/i, "Domino's")
    .replace(/\bdomino'?s\b/i, "Domino's");
}
function itemsSubtitle(items = [], maxChars = 45) {
  const base = (items || [])
    .map((x) => String(x || "").toLowerCase().trim())
    .filter(Boolean)
    .slice(0, 8)
    .join(", ");
  if (!base) return "";
  if (base.length <= maxChars) return base;
  const cut = base.slice(0, maxChars);
  const lastComma = cut.lastIndexOf(",");
  return (lastComma > 10 ? cut.slice(0, lastComma) : cut).trim() + "…";
}
function pickTitle(data) {
  const merchant = normalizeMerchant(data?.merchant);
  const category = (data?.category || "").trim() || "Expense";
  const top = merchant || category;
  const sub = itemsSubtitle(data?.items || []);
  return sub ? `${top}\n${sub}` : top;
}

/*  Main */
export default function AddTxnClient({ tripId }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [prefill, setPrefill] = useState(null);
  const [pickerKey, setPickerKey] = useState(0); 

  const onSubmit = async (body) => {
    try {
      const res = await fetch(`/api/proxy/trips/${tripId}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`Create failed: ${res.status} ${t}`);
      }
      setOpen(false);
      setPrefill(null);
      startTransition(() => router.refresh());
    } catch (e) {
      alert(e.message || "Failed to add transaction");
    }
  };

  async function onPickReceipt(file) {
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/proxy/ai/receipt", { method: "POST", body: fd });
      if (!res.ok) throw new Error(`AI parse failed: ${res.status}`);
      const data = await res.json();
      const title = pickTitle(data);
      const total = Number(data?.total) || "";
      setPrefill({
        title,
        participants: "",
        payers: [{ name: "", amount: total }],
      });
      setOpen(true);
    } catch (err) {
      alert(err.message || "Failed to parse receipt");
    } finally {
      setPickerKey((k) => k + 1);
    }
  }

  return (
    <>
      <input
        key={pickerKey}
        type="file"
        accept="image/*"
        className="hidden"
        id="receipt-picker"
        onChange={(e) => onPickReceipt(e.target.files?.[0])}
      />

      {/* Floating action bar with matching buttons */}
      <div className="fab-bar">
        {/* Scan receipt (secondary) */}
        <button
          type="button"
          className="fab-btn fab-btn--secondary"
          onClick={() => document.getElementById("receipt-picker")?.click()}
          title="Scan receipt"
          aria-label="Scan receipt"
        >
          {/* camera icon */}
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path d="M4 7h3l1.2-2h7.6L17 7h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2zm8 3.5A4.5 4.5 0 1 0 16.5 15 4.5 4.5 0 0 0 12 10.5zm0 2A2.5 2.5 0 1 1 9.5 15 2.5 2.5 0 0 1 12 12.5z" />
          </svg>
          <span>Scan receipt</span>
        </button>

        {/* New Transaction (primary) */}
        <button
          type="button"
          className="fab-btn"
          onClick={() => {
            setPrefill(null);
            setOpen(true);
          }}
          title="Add Transaction"
          aria-label="Add Transaction"
        >
          {/* plus icon */}
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path d="M11 5h2v14h-2zM5 11h14v2H5z" />
          </svg>
          <span>New Transaction</span>
        </button>
      </div>

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setPrefill(null);
        }}
        onSubmit={onSubmit}
        busy={isPending}
        initial={prefill}
      />
    </>
  );
}
