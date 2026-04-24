import { NextResponse } from "next/server";
import { listRescueReports, saveRescueReport } from "@/lib/rescueReportsDb";

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
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_URGENCY = new Set(["critical", "urgent", "standard"]);
const VALID_SPECIES = new Set(["Dog", "Cat", "Bird", "Other"]);

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
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({
    ok: true,
    reportId,
    message: `Report submitted successfully. Reference ID: ${reportId}`,
  });
}
