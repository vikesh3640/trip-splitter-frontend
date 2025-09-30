"use client";

import { useState } from "react";

const Field = ({ label, children }) => (
  <label className="block text-sm font-medium text-gray-700">
    {label}
    <div className="mt-1">{children}</div>
  </label>
);

/**
 * Props:
 *  - open, onClose()
 *  - busy (boolean)
 *  - onSubmit({ name, members[] })
 */
export default function CreateTripModal({ open, onClose, onSubmit, busy }) {
  const [name, setName] = useState("");
  const [members, setMembers] = useState([""]);

  if (!open) return null;

  const addMember = () => setMembers((m) => [...m, ""]);
  const removeMember = (i) => setMembers((m) => m.filter((_, idx) => idx !== i));

  const handleSubmit = (e) => {
    e.preventDefault();
    const clean = members.map((s) => s.trim()).filter(Boolean);
    if (!name.trim()) return alert("Trip name is required.");
    onSubmit({
      name: name.trim(),
      members: clean.map((n) => ({ name: n }))
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-card border border-gray-100">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="text-lg font-semibold">Create Trip</h3>
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
          <Field label="Trip Name">
            <input
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="e.g., Goa Trip"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={busy}
            />
          </Field>

          <div>
            <div className="text-sm font-medium text-gray-700">Members (optional)</div>
            <div className="mt-2 space-y-2">
              {members.map((val, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className="flex-1 rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-200"
                    placeholder={`Member ${i + 1}`}
                    value={val}
                    onChange={(e) => {
                      const copy = [...members];
                      copy[i] = e.target.value;
                      setMembers(copy);
                    }}
                    disabled={busy}
                  />
                  <button
                    type="button"
                    className="px-3 rounded-lg border hover:bg-gray-50"
                    onClick={() => removeMember(i)}
                    disabled={busy || members.length === 1}
                    aria-label="Remove member"
                  >
                    −
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addMember}
              className="mt-2 text-sm text-emerald-700 hover:underline"
              disabled={busy}
            >
              + Add another member
            </button>
          </div>

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
              {busy ? "Creating..." : "Create Trip"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
