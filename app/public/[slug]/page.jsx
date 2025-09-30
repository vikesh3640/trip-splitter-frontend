import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

export const dynamic = "force-dynamic";

async function fetchJson(path) {
  const r = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
  if (!r.ok) throw new Error(`${r.status} ${await r.text().catch(() => "")}`);
  return r.json();
}

async function getData(slug) {
  const trip = await fetchJson(`/api/trips/public/slug/${slug}`);
  const txns = await fetchJson(`/api/public/trips/${slug}/transactions`).catch(() => []);
  let settlement = { settlements: [], algorithm: "optimal" };

  if (trip.isClosed) {
    settlement = await fetchJson(`/api/public/trips/${slug}/settlement`).catch(() => settlement);
  }
  return { trip, txns, settlement };
}

export default async function PublicTripPage({ params }) {
  const { slug } = params;

  let data;
  try {
    data = await getData(slug);
  } catch (e) {
    return (
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-2">Trip not available</h2>
        <p className="text-sm text-red-600">{e?.message || "Unknown error"}</p>
        <div className="mt-3">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 underline">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const { trip, txns, settlement } = data;

  return (
    <div className="space-y-6">
      {/* Header pill */}
      <div className="mx-auto w-fit pill px-6 py-3 text-center">
        <div className="text-xl font-semibold">Trip: {trip.name} (Public)</div>
      </div>

      {/* Balances */}
      <section className="card p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Balances</h3>
          {!trip.isClosed && (
            <span className="text-xs text-gray-500">Trip in progress</span>
          )}
        </div>

        <div className="mt-3 space-y-2">
          {trip.members?.map((m) => (
            <div key={m.name} className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">{m.name}</span>
              <span
                className={`font-medium ${
                  (m.balance ?? 0) < 0 ? "text-red-600" : "text-emerald-700"
                }`}
              >
                {(m.balance ?? 0) < 0 ? "-" : "+"}₹
                {Math.abs(Number(m.balance || 0)).toLocaleString("en-IN")}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Settlement: only if closed */}
      {trip.isClosed && (
        <section className="card p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Final Settlement</h3>
            <span className="text-xs text-gray-500">Algorithm: {settlement.algorithm}</span>
          </div>
          {settlement.settlements?.length ? (
            <div className="mt-3 space-y-2">
              {settlement.settlements.map((s, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">
                    {s.from} → {s.to}
                  </span>
                  <span className="font-medium">
                    ₹{Number(s.amount).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 mt-2">No settlements needed.</p>
          )}
        </section>
      )}

      {/* Transactions */}
      <div className="space-y-4">
        {txns.length ? (
          txns.map((t) => (
            <div key={t._id} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-semibold">{t.title}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Paid by:{" "}
                    <span className="font-medium">
                      {t.payers.map((p) => `${p.name} ₹${p.amount}`).join(", ")}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Paid for: <span className="font-medium">{t.participants.join(", ")}</span>
                  </div>
                  <div className="text-xs text-gray-500">Split: {t.splitType}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Total</div>
                  <div className="text-xl font-semibold">₹{t.totalAmount}</div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="card p-5 text-sm text-gray-500">No transactions yet.</div>
        )}
      </div>
    </div>
  );
}
