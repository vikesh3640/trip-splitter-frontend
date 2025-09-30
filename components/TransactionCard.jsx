export default function TransactionCard({ txn }) {
  const total = Number(txn.totalAmount || 0);
  const payers = (txn.payers || []).map((p) => p.name).join(", ") || "—";
  const participants = (txn.participants || []).join(", ") || "—";
  const splitInfo = txn.splitType === "custom" ? "Custom" : "Equal";

  return (
    <section className="card p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">{txn.title}</h3>
          <div className="text-sm text-gray-600">
            Paid by: <span className="font-medium">{payers}</span>
          </div>
          <div className="text-sm text-gray-600">
            Paid for: <span className="font-medium">{participants}</span>
          </div>
          <div className="text-xs text-gray-500">Split: {splitInfo}</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Total</div>
          <div className="text-xl font-semibold">
            ₹{total.toLocaleString("en-IN")}
          </div>
        </div>
      </div>
    </section>
  );
}
