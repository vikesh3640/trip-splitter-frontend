// app/api/proxy/trips/[id]/transactions/[txnid]/route.js
import { forwardJSON, forwardNoBody } from "../../../_utils";

export async function PUT(req, { params }) {
  // forward correctly as PUT
  return forwardJSON(req, `/api/transactions/${params.txnid}`, "PUT");
}

export async function DELETE(req, { params }) {
  return forwardNoBody(`/api/transactions/${params.txnid}`, "DELETE");
}
