import { forwardNoBody } from "../../../_utils";
export async function PUT(_req, { params }) {
  return forwardNoBody(`/api/trips/${params.id}/reopen`, "PUT");
}
