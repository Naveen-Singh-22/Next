import { NextResponse } from "next/server";
import { listAdoptionRequests, saveAdoptionRequest } from "@/lib/adoptionRequestsDb";
import { createInquiry } from "@/lib/inquiryStore";

type AdoptionRequestBody = {
  animalSlug?: string;
  animalName?: string;
  animalSpecies?: string;
  animalImage?: string;
  applicantName?: string;
  applicantEmail?: string;
  applicantPhone?: string;
  city?: string;
  homeType?: "apartment" | "house" | "farm" | "other";
  message?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_HOME_TYPES = new Set(["apartment", "house", "farm", "other"]);

export const runtime = "nodejs";

export async function GET() {
  const requests = await listAdoptionRequests();
  return NextResponse.json({ ok: true, count: requests.length, requests });
}

export async function POST(request: Request) {
  let body: AdoptionRequestBody;

  try {
    body = (await request.json()) as AdoptionRequestBody;
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request payload." }, { status: 400 });
  }

  const animalSlug = body.animalSlug?.trim() ?? "";
  const animalName = body.animalName?.trim() ?? "";
  const animalSpecies = body.animalSpecies?.trim() ?? "";
  const animalImage = body.animalImage?.trim() ?? "";
  const applicantName = body.applicantName?.trim() ?? "";
  const applicantEmail = body.applicantEmail?.trim() ?? "";
  const applicantPhone = body.applicantPhone?.trim() ?? "";
  const city = body.city?.trim() ?? "";
  const homeType = body.homeType;
  const message = body.message?.trim() ?? "";

  if (!animalSlug || !animalName || !animalSpecies) {
    return NextResponse.json({ ok: false, message: "Animal information is missing." }, { status: 400 });
  }

  if (!applicantName || applicantName.length < 2) {
    return NextResponse.json({ ok: false, message: "Please enter your full name." }, { status: 400 });
  }

  if (!EMAIL_REGEX.test(applicantEmail)) {
    return NextResponse.json({ ok: false, message: "Please enter a valid email address." }, { status: 400 });
  }

  if (!applicantPhone || applicantPhone.length < 7) {
    return NextResponse.json({ ok: false, message: "Please enter a valid phone number." }, { status: 400 });
  }

  if (!city) {
    return NextResponse.json({ ok: false, message: "Please enter your city." }, { status: 400 });
  }

  if (!homeType || !VALID_HOME_TYPES.has(homeType)) {
    return NextResponse.json({ ok: false, message: "Please select your home type." }, { status: 400 });
  }

  if (message.length < 10) {
    return NextResponse.json({ ok: false, message: "Please share a short note about your adoption interest." }, { status: 400 });
  }

  const requestId = `AR-${Math.floor(Date.now() / 1000).toString(36).toUpperCase()}`;

  const savedRequest = await saveAdoptionRequest({
    requestId,
    animalSlug,
    animalName,
    animalSpecies,
    animalImage,
    applicantName,
    applicantEmail,
    applicantPhone,
    city,
    homeType,
    message,
    status: "pending",
    createdAt: new Date().toISOString(),
  });

  await createInquiry({
    type: "adoption",
    referenceId: savedRequest.id,
    title: `Adoption request from ${savedRequest.applicantName}`,
    preview: `${savedRequest.animalName} • ${savedRequest.city}`,
  });

  return NextResponse.json({
    ok: true,
    requestId,
    message: `Application submitted. Your request ID is ${requestId}.`,
  });
}
