import { NextResponse } from "next/server";
import { createAdoption, listAdoptions } from "@/lib/adoptionsStore";
import { createInquiry } from "@/lib/inquiryStore";

type CreateAdoptionBody = {
  applicantName?: string;
  email?: string;
  phone?: string;
  city?: string;
  housing?: string;
  petExperience?: string;
  whyAdopt?: string;
  animalId?: number;
  animalName?: string;
  animalCode?: string;
};

export const runtime = "nodejs";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET() {
  return NextResponse.json({ applications: await listAdoptions() });
}

export async function POST(request: Request) {
  let body: CreateAdoptionBody;

  try {
    body = (await request.json()) as CreateAdoptionBody;
  } catch {
    return NextResponse.json({ message: "Invalid JSON payload." }, { status: 400 });
  }

  const applicantName = body.applicantName?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";
  const city = body.city?.trim() ?? "";
  const housing = body.housing?.trim() ?? "";
  const petExperience = body.petExperience?.trim() ?? "";
  const whyAdopt = body.whyAdopt?.trim() ?? "";
  const animalId = Number(body.animalId);
  const animalName = body.animalName?.trim() ?? "";
  const animalCode = body.animalCode?.trim() ?? "";

  if (!applicantName || !email || !phone || !city || !housing || !petExperience || !whyAdopt) {
    return NextResponse.json({ message: "Please complete all required fields." }, { status: 400 });
  }

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ message: "Please provide a valid email." }, { status: 400 });
  }

  if (!Number.isInteger(animalId) || animalId <= 0) {
    return NextResponse.json({ message: "A valid animal ID is required." }, { status: 400 });
  }

  if (!animalName) {
    return NextResponse.json({ message: "Animal name is required." }, { status: 400 });
  }

  const application = await createAdoption({
    applicantName,
    email,
    phone,
    city,
    housing,
    petExperience,
    whyAdopt,
    animalId,
    animalName,
    animalCode: animalCode || undefined,
    adminNotes: "",
  });

  await createInquiry({
    type: "adoption",
    referenceId: application.id,
    title: `Adoption application from ${application.applicantName}`,
    preview: `${application.animalName} • ${application.city}`,
  });

  return NextResponse.json({ application }, { status: 201 });
}
