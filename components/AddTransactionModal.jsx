"use client";

import { useState } from "react";

const Field = ({ label, children }) => (
  <label className="block text-sm font-medium text-gray-700">
    {label}
    <div className="mt-1">{children}</div>
  </label>
);

export default function AddTransactionModal({ open, onClose, onSubmit, busy }) {
  const [title, setTitle] = useState("");
  const [payers, setPayers] = useState([{ name: "", amount: "" }]);
  const [participants, setParticipants] = useState("");
  const [splitType, setSplitType] = useState("equal");
  const [customAmounts, setCustomAmounts] = useState("");

  if (!open) return null;

  const addPayer = () => setPayers([...payers, { name: "", amount: "" }]);
  const removePayer = (idx) => setPayers(payers.filter((_, i) => i !== idx));

  const handleSubmit = (e) => {
    e.preventDefault();

    const normPayers = payers
      .map(p => ({ name: p.name.trim(), amount: Number(p.amount) }))
      .filter(p => p.name && !Number.isNaN(p.amount) && p.amount >= 0);

    const partList = participants.split(",").map(s => s.trim()).filter(Boolean);

    const body = {
      title: title.trim(),
      payers: normPayers,
      participants: partList,
      splitType
    };

    if (splitType === "custom") {
      const arr = customAmounts
        .split(",")
        .map(s => s.trim())
        .filter(Boolean)
        .map(Number);

      if (arr.length !== partList.length) {
        alert("Custom amounts count must equal participants count.");
        return;
      }
      if (arr.some(n => Number.isNaN(n) || n < 0)) {
        alert("Custom amounts must be non-negative numbers.");
        return;
      }
      body.customAmounts = arr;
    }

    if (!body.title) return alert("Title is required.");
    if (!normPayers.length) return alert("At least one valid payer is required.");
    if (!partList.length) return alert("Participants are required.");

    onSubmit(body);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-card border border-gray-100">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="text-lg font-semibold">Add Transaction</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
            disabled={busy}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <Field label="Title">
            <input
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="e.g., Food, Boating"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={busy}
            />
          </Field>

          <div>
            <div className="text-sm font-medium text-gray-700">Payers</div>
            <div className="mt-2 space-y-2">
              {payers.map((p, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className="flex-1 rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-200"
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
                    className="w-36 rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-200"
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
                    onClick={() => removePayer(i)}
                    className="px-3 rounded-lg border hover:bg-gray-50"
                    disabled={busy || payers.length === 1}
                    aria-label="Remove payer"
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

          <Field label="Participants (comma-separated)">
            <input
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="e.g., A, B, C"
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
              disabled={busy}
            />
          </Field>

          <Field label="Split Type">
            <div className="flex items-center gap-4">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="splitType"
                  value="equal"
                  checked={splitType === "equal"}
                  onChange={() => setSplitType("equal")}
                  disabled={busy}
                />
                <span>Equal</span>
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
                <span>Custom</span>
              </label>
            </div>
          </Field>

          {splitType === "custom" && (
            <Field label="Custom Amounts (comma-separated, aligns with participants)">
              <input
                className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-200"
                placeholder="e.g., 200,100,100"
                value={customAmounts}
                onChange={(e) => setCustomAmounts(e.target.value)}
                disabled={busy}
              />
            </Field>
          )}

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
              {busy ? "Adding..." : "Add Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
