import Link from "next/link";
import { apiGet } from "../../../lib/api";
import TxnCardWithActions from "./TxnCardWithActions";
import AddTxnClient from "./AddTxnClient";
import EndTripClient from "./EndTripClient";
import ShareLinkButton from "./ShareLinkButton";

export const dynamic = "force-dynamic";

async function getData(id) {
  const [trip, txns] = await Promise.all([
    apiGet(`/api/trips/${id}`),
    apiGet(`/api/trips/${id}/transactions`)
  ]);

  let settlement = { settlements: [], algorithm: "optimal" };
  if (trip.isClosed) {
    try {
      settlement = await apiGet(`/api/trips/${id}/settlement`);
    } catch {
      settlement = { settlements: [], algorithm: "optimal" };
    }
  }
  return { trip, txns, settlement };
}

export default async function TripDetailPage({ params }) {
  const { id } = params;

  let data;
  try {
    data = await getData(id);
  } catch (e) {
    return (
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-2">Failed to load trip</h2>
        <p className="text-sm text-red-600">{e?.message || "Unknown error"}</p>
        <div className="mt-3">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 underline">
            Back to Trips
          </Link>
        </div>
      </div>
    );
  }

  const { trip, txns, settlement } = data;

  return (
    <div className="space-y-6">
      {/* Pill header */}
      <div className="mx-auto w-fit pill px-6 py-3 text-center">
        <div className="text-xl font-semibold">Trip: {trip.name}</div>
      </div>

      {/* Balances */}
      <section className="card p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Balances</h3>
          <div className="flex items-center gap-4">
            <ShareLinkButton slug={trip.publicSlug} />
            <EndTripClient tripId={id} isClosed={!!trip.isClosed} />
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 underline">
              Back to Trips
            </Link>
          </div>
        </div>

        {!trip.isClosed && (
          <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
            Trip in progress — settlement will be available after you end the trip.
          </div>
        )}

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

      {/* Final Settlement (only when closed) */}
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

      {/* Transactions with actions */}
      <div className="space-y-4">
        {txns.length ? (
          txns.map((txn) => (
            <TxnCardWithActions key={txn._id} txn={txn} disabled={!!trip.isClosed} />
          ))
        ) : (
          <div className="card p-5 text-sm text-gray-500">No transactions yet.</div>
        )}
      </div>

      {/* Add transactions only while trip is open */}
      {!trip.isClosed && <AddTxnClient tripId={id} />}
    </div>
  );
}
