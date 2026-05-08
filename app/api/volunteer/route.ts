import { NextResponse } from "next/server";
import { listVolunteerApplications } from "@/lib/volunteerApplicationsStore";

export async function GET() {
  try {
    const applications = await listVolunteerApplications();
    return NextResponse.json({ applications });
  } catch (error) {
    console.error("Failed to fetch volunteer applications:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to fetch applications" },
      { status: 500 },
    );
  }
}
