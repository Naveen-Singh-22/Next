import { NextResponse } from "next/server";
import { updateInquiryStatus, type InquiryStatus } from "@/lib/inquiryStore";

const VALID_STATUSES = new Set<InquiryStatus>(["new", "assigned", "resolved"]);

type UpdateInquiryBody = {
  status?: InquiryStatus;
};

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export const runtime = "nodejs";

export async function PUT(request: Request, { params }: RouteParams) {
  let body: UpdateInquiryBody;

  try {
    body = (await request.json()) as UpdateInquiryBody;
  } catch {
    return NextResponse.json({ message: "Invalid JSON payload." }, { status: 400 });
  }

  const { id: idParam } = await params;
  const id = Number(idParam);

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ message: "A valid inquiry ID is required." }, { status: 400 });
  }

  if (!body.status || !VALID_STATUSES.has(body.status)) {
    return NextResponse.json({ message: "Please choose a valid inquiry status." }, { status: 400 });
  }

  const inquiry = await updateInquiryStatus(id, body.status);

  if (!inquiry) {
    return NextResponse.json({ message: "Inquiry not found." }, { status: 404 });
  }

  return NextResponse.json({ inquiry });
}