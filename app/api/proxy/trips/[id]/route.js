import { forwardNoBody } from "../../_utils";

export async function GET(_req, { params }) {
  return forwardNoBody(`/api/trips/${params.id}`, "GET");
}

export async function DELETE(_req, { params }) {
  return forwardNoBody(`/api/trips/${params.id}`, "DELETE");
}
