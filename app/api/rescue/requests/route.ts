import { NextResponse } from "next/server";
import { createInquiry } from "@/lib/inquiryStore";
import { sendRescueChecklistCompletionEmail } from "@/lib/rescueEmailNotifier";
import {
  listRescueReports,
  saveRescueReport,
  updateRescueReportAdmin,
  type RescueAdminChecklist,
  type RescueCaseStatus,
} from "@/lib/rescueReportsDb";
import { requireAdmin } from "@/lib/authContext";
import { RescueReportSchema } from "@/lib/validation";
import { handleError } from "@/lib/apiErrors";

type RescueAdminUpdateBody = {
  reportId?: string;
  caseStatus?: RescueCaseStatus;
  adminChecklist?: Partial<RescueAdminChecklist>;
};

const VALID_CASE_STATUS = new Set<RescueCaseStatus>(["reported", "in_progress", "monitored", "rescued", "closed"]);

function isChecklistComplete(checklist: RescueAdminChecklist) {
  return checklist.rescued && checklist.monitored && checklist.medicalCompleted && checklist.shelterAssigned && checklist.reporterNotified;
}

export const runtime = "nodejs";

function toMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export async function GET() {
  try {
    await requireAdmin();
    const reports = await listRescueReports();
    return NextResponse.json({ ok: true, count: reports.length, reports });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: toMessage(error, "Failed to load rescue reports.") },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate request body against schema
    const validated = RescueReportSchema.parse(body);

    const reportId = `RR-${Math.floor(Date.now() / 1000).toString(36).toUpperCase()}`;

    try {
      const report = await saveRescueReport({
        reportId,
        fullName: validated.fullName,
        email: validated.email,
        phone: validated.phone,
        species: validated.species,
        breed: validated.breed ?? "",
        healthConditions: validated.healthConditions ?? [],
        notes: validated.notes ?? "",
        lastSeenAddress: validated.lastSeenAddress,
        urgency: validated.urgency,
        location: validated.location,
        animalImageDataUrl: validated.animalImageDataUrl,
        caseStatus: "reported",
        adminChecklist: {
          rescued: false,
          monitored: false,
          medicalCompleted: false,
          shelterAssigned: false,
          reporterNotified: false,
        },
        createdAt: new Date().toISOString(),
      });

      await createInquiry({
        type: "rescue",
        referenceId: report.id,
        title: `Rescue report for ${report.species} from ${report.fullName}`,
        preview: `${report.species} • ${report.lastSeenAddress} • Urgency: ${report.urgency}`,
      });

      return NextResponse.json({
        ok: true,
        reportId,
        message: `Thank you for reporting. Your report ID is ${reportId}. Our rescue team will contact you shortly.`,
      }, { status: 201 });
    } catch (error) {
      return NextResponse.json(
        { ok: false, message: toMessage(error, "Failed to save rescue report.") },
        { status: 500 },
      );
    }
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: Request) {
  await requireAdmin();

  let body: RescueAdminUpdateBody;

  try {
    body = (await request.json()) as RescueAdminUpdateBody;
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request payload." }, { status: 400 });
  }

  const reportId = body.reportId?.trim() ?? "";

  if (!reportId) {
    return NextResponse.json({ ok: false, message: "Report ID is required." }, { status: 400 });
  }

  const caseStatus = body.caseStatus;

  if (!caseStatus || !VALID_CASE_STATUS.has(caseStatus)) {
    return NextResponse.json({ ok: false, message: "Please select a valid case status." }, { status: 400 });
  }

  const adminChecklist: RescueAdminChecklist = {
    rescued: Boolean(body.adminChecklist?.rescued),
    monitored: Boolean(body.adminChecklist?.monitored),
    medicalCompleted: Boolean(body.adminChecklist?.medicalCompleted),
    shelterAssigned: Boolean(body.adminChecklist?.shelterAssigned),
    reporterNotified: Boolean(body.adminChecklist?.reporterNotified),
  };

  let updated;

  try {
    updated = await updateRescueReportAdmin(reportId, {
      caseStatus,
      adminChecklist,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: toMessage(error, "Failed to update rescue report.") },
      { status: 500 },
    );
  }

  if (!updated) {
    return NextResponse.json({ ok: false, message: "Rescue report not found." }, { status: 404 });
  }

  const previousComplete = isChecklistComplete(updated.previous.adminChecklist);
  const nextComplete = isChecklistComplete(updated.updated.adminChecklist);
  let mailInfo: { sent: boolean; reason?: string } = { sent: false };

  if (!previousComplete && nextComplete) {
    try {
      mailInfo = await sendRescueChecklistCompletionEmail(updated.updated);
    } catch (error) {
      mailInfo = {
        sent: false,
        reason: error instanceof Error ? error.message : "Failed to send reporter email.",
      };
    }
  }

  return NextResponse.json({
    ok: true,
    report: updated.updated,
    mail: mailInfo,
    message: mailInfo.sent
      ? "Case checklist saved and reporter email sent automatically."
      : "Case checklist saved successfully.",
  });
}
