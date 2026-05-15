import { NextResponse } from "next/server";
import { listVolunteerApplications } from "@/lib/volunteerApplicationsStore";
import { requireAdmin } from "@/lib/authContext";
import { handleError } from "@/lib/apiErrors";

export async function GET() {
  try {
    await requireAdmin();
    const applications = await listVolunteerApplications();
    return NextResponse.json({ applications });
  } catch (error) {
    return handleError(error);
  }
}
