import { NextResponse } from "next/server";
import { createInquiry } from "@/lib/inquiryStore";
import { createDonation, listDonations } from "@/lib/donationsStore";

type CreateDonationBody = {
  donorName?: string;
  email?: string;
  phone?: string;
  amount?: number;
  coverFees?: boolean;
};

export const runtime = "nodejs";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET() {
  return NextResponse.json({ donations: await listDonations() });
}

export async function POST(request: Request) {
  let body: CreateDonationBody;

  try {
    body = (await request.json()) as CreateDonationBody;
  } catch {
    return NextResponse.json({ message: "Invalid JSON payload." }, { status: 400 });
  }

  const donorName = body.donorName?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";
  const amount = Number(body.amount);
  const coverFees = body.coverFees ?? false;

  if (!donorName || donorName.length < 2) {
    return NextResponse.json({ message: "Please enter your full name." }, { status: 400 });
  }

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ message: "Please provide a valid email address." }, { status: 400 });
  }

  if (phone && phone.length < 7) {
    return NextResponse.json({ message: "Please provide a valid phone number." }, { status: 400 });
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ message: "Please select a valid donation amount." }, { status: 400 });
  }

  const donation = await createDonation({
    donorName,
    email,
    phone,
    amount: Math.round(amount),
    coverFees: Boolean(coverFees),
  });

  await createInquiry({
    type: "donation",
    referenceId: donation.id,
    title: `Donation from ${donorName}`,
    preview: `${donation.donationId} • ${Math.round(amount)} INR`,
  });

  return NextResponse.json({ donation, message: `Donation recorded successfully. Reference ${donation.donationId}.` }, { status: 201 });
}