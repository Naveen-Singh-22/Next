import { NextResponse } from "next/server";
import type { StoredVolunteerApplication } from "@/lib/volunteerApplicationsStore";
import { updateVolunteerApplicationStatus } from "@/lib/volunteerApplicationsStore";
import { requireAdmin } from "@/lib/authContext";
import { recordAdminAuditEvent } from "@/lib/adminAudit";
import { handleError } from "@/lib/apiErrors";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const actor = await requireAdmin();
    
    const { id: applicationId } = await params;

    let body: { status?: string };

    try {
      body = (await request.json()) as { status?: string };
    } catch {
      return NextResponse.json(
        { ok: false, message: "Invalid request payload." },
        { status: 400 },
      );
    }

    const { status } = body;

    if (!status || !["pending", "reviewing", "approved", "declined"].includes(status)) {
      return NextResponse.json(
        { ok: false, message: "Invalid status." },
        { status: 400 },
      );
    }

    try {
      const application = await updateVolunteerApplicationStatus(
        applicationId,
        status as StoredVolunteerApplication["status"],
      );

      if (!application) {
        return NextResponse.json(
          { ok: false, message: "Application not found." },
          { status: 404 },
        );
      }

      await recordAdminAuditEvent({
        actor,
        action: "update_status",
        resource: "volunteer_application",
        request,
        subjectId: applicationId,
        details: {
          status,
        },
      });

      return NextResponse.json({
        ok: true,
        message: "Application status updated successfully.",
        application,
      });
    } catch (error) {
      console.error("Failed to update application status:", error);
      return NextResponse.json(
        { ok: false, message: "Failed to update application status." },
        { status: 500 },
      );
    }
  } catch (error) {
    return handleError(error);
  }
}
