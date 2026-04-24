import { NextResponse } from "next/server";

type VolunteerApplicationBody = {
  fullName?: string;
  email?: string;
  phone?: string;
  city?: string;
  interestArea?: string;
  availability?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_INTERESTS = new Set([
  "Shelter Assistant",
  "Rescue Dispatcher",
  "Event Support",
]);

export async function POST(request: Request) {
  let body: VolunteerApplicationBody;

  try {
    body = (await request.json()) as VolunteerApplicationBody;
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid request payload." },
      { status: 400 },
    );
  }

  const fullName = body.fullName?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";
  const city = body.city?.trim() ?? "";
  const interestArea = body.interestArea?.trim() ?? "";
  const availability = body.availability?.trim() ?? "";

  if (!fullName || fullName.length < 2) {
    return NextResponse.json(
      { ok: false, message: "Please provide your full name." },
      { status: 400 },
    );
  }

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      { ok: false, message: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  if (!phone || phone.length < 7) {
    return NextResponse.json(
      { ok: false, message: "Please provide a valid phone number." },
      { status: 400 },
    );
  }

  if (!city) {
    return NextResponse.json(
      { ok: false, message: "Please provide your city." },
      { status: 400 },
    );
  }

  if (!VALID_INTERESTS.has(interestArea)) {
    return NextResponse.json(
      { ok: false, message: "Please select a valid interest area." },
      { status: 400 },
    );
  }

  if (!availability || availability.length < 10) {
    return NextResponse.json(
      { ok: false, message: "Please share your availability details." },
      { status: 400 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Thanks for applying. Our volunteer team will contact you within 2-3 days.",
  });
}
