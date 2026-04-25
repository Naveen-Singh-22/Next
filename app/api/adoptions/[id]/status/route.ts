import { NextResponse } from "next/server";
import { updateAdoptionStatus } from "@/lib/adoptionsStore";
import type { AdoptionStatus } from "@/lib/adoptionApplicationTypes";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

type UpdateStatusBody = {
  status?: AdoptionStatus;
};

const ALLOWED_STATUSES = new Set<AdoptionStatus>([
  "applied",
  "shortlisted",
  "home_visit",
  "approved",
  "rejected",
  "adopted",
]);

function parseId(rawId: string) {
  const parsed = Number(rawId);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export const runtime = "nodejs";

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const parsedId = parseId(id);

  if (!parsedId) {
    return NextResponse.json({ message: "Invalid adoption application ID." }, { status: 400 });
  }

  let body: UpdateStatusBody;

  try {
    body = (await request.json()) as UpdateStatusBody;
  } catch {
    return NextResponse.json({ message: "Invalid JSON payload." }, { status: 400 });
  }

  if (!body.status || !ALLOWED_STATUSES.has(body.status)) {
    return NextResponse.json({ message: "Invalid status update." }, { status: 400 });
  }

  const application = updateAdoptionStatus(parsedId, body.status);

  if (!application) {
    return NextResponse.json({ message: "Adoption application not found." }, { status: 404 });
  }

  return NextResponse.json({ application });
}
