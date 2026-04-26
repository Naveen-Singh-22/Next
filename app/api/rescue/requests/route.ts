import { NextResponse } from "next/server";
import { sendRescueChecklistCompletionEmail } from "@/lib/rescueEmailNotifier";
import {
  listRescueReports,
  saveRescueReport,
  updateRescueReportAdmin,
  type RescueAdminChecklist,
  type RescueCaseStatus,
} from "@/lib/rescueReportsDb";

type RescueRequestBody = {
  fullName?: string;
  email?: string;
  phone?: string;
  species?: string;
  breed?: string;
  healthConditions?: string[];
  notes?: string;
  lastSeenAddress?: string;
  urgency?: "critical" | "urgent" | "standard";
  location?: {
    latitude?: number;
    longitude?: number;
  };
  animalImageDataUrl?: string;
};

type RescueAdminUpdateBody = {
  reportId?: string;
  caseStatus?: RescueCaseStatus;
  adminChecklist?: Partial<RescueAdminChecklist>;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const IMAGE_DATA_URL_REGEX = /^data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/=]+$/;
const MAX_IMAGE_DATA_URL_LENGTH = 4_000_000;
const VALID_URGENCY = new Set(["critical", "urgent", "standard"]);
const VALID_SPECIES = new Set(["Dog", "Cat", "Bird", "Other"]);
const VALID_CASE_STATUS = new Set<RescueCaseStatus>(["reported", "in_progress", "monitored", "rescued", "closed"]);

function isChecklistComplete(checklist: RescueAdminChecklist) {
  return checklist.rescued && checklist.monitored && checklist.medicalCompleted && checklist.shelterAssigned && checklist.reporterNotified;
}

export const runtime = "nodejs";

export async function GET() {
  const reports = await listRescueReports();
  return NextResponse.json({ ok: true, count: reports.length, reports });
}

export async function POST(request: Request) {
  let body: RescueRequestBody;

  try {
    body = (await request.json()) as RescueRequestBody;
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request payload." }, { status: 400 });
  }

  const fullName = body.fullName?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";
  const species = body.species?.trim() ?? "";
  const lastSeenAddress = body.lastSeenAddress?.trim() ?? "";
  const urgency = body.urgency;
  const latitude = Number(body.location?.latitude);
  const longitude = Number(body.location?.longitude);
  const animalImageDataUrl = body.animalImageDataUrl?.trim() ?? "";

  if (fullName.length < 2) {
    return NextResponse.json({ ok: false, message: "Please provide your full name." }, { status: 400 });
  }

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ ok: false, message: "Please provide a valid email address." }, { status: 400 });
  }

  if (phone.length < 7) {
    return NextResponse.json({ ok: false, message: "Please provide a valid phone number." }, { status: 400 });
  }

  if (!VALID_SPECIES.has(species)) {
    return NextResponse.json({ ok: false, message: "Please select a valid species." }, { status: 400 });
  }

  if (!lastSeenAddress) {
    return NextResponse.json({ ok: false, message: "Please provide the last seen address." }, { status: 400 });
  }

  if (!urgency || !VALID_URGENCY.has(urgency)) {
    return NextResponse.json({ ok: false, message: "Please select a valid urgency level." }, { status: 400 });
  }

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return NextResponse.json({ ok: false, message: "Please pin a valid location on the map." }, { status: 400 });
  }

  if (animalImageDataUrl) {
    if (animalImageDataUrl.length > MAX_IMAGE_DATA_URL_LENGTH || !IMAGE_DATA_URL_REGEX.test(animalImageDataUrl)) {
      return NextResponse.json({ ok: false, message: "Please upload a valid image under 4MB." }, { status: 400 });
    }
  }

  const reportId = `RR-${Math.floor(Date.now() / 1000).toString(36).toUpperCase()}`;

  await saveRescueReport({
    reportId,
    fullName,
    email,
    phone,
    species,
    breed: body.breed?.trim() ?? "",
    healthConditions: Array.isArray(body.healthConditions) ? body.healthConditions : [],
    notes: body.notes?.trim() ?? "",
    lastSeenAddress,
    urgency,
    location: {
      latitude,
      longitude,
    },
    animalImageDataUrl: animalImageDataUrl || undefined,
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

  return NextResponse.json({
    ok: true,
    reportId,
    message: `Report submitted successfully. Reference ID: ${reportId}`,
  });
}

export async function PUT(request: Request) {
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

  const updated = await updateRescueReportAdmin(reportId, {
    caseStatus,
    adminChecklist,
  });

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
