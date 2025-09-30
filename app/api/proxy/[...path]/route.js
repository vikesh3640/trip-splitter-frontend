import { forwardNoBody, forwardJSON } from "../_utils";

const upstream = (params) => `/api/${params.path.join("/")}`;

export async function GET(req, { params }) {
  return forwardNoBody(upstream(params), "GET");
}

export async function DELETE(req, { params }) {
  return forwardNoBody(upstream(params), "DELETE");
}

export async function PUT(req, { params }) {
  return forwardJSON(req, upstream(params), "PUT");
}

export async function POST(req, { params }) {
  return forwardJSON(req, upstream(params), "POST");
}

export async function PATCH(req, { params }) {
  return forwardJSON(req, upstream(params), "PATCH");
}
