import { NextResponse } from "next/server";
import { createInquiry } from "@/lib/inquiryStore";
import { createDonation, listDonations } from "@/lib/donationsStore";
import { DonationSchema } from "@/lib/validation";
import { handleError } from "@/lib/apiErrors";
import { requireAdmin } from "@/lib/authContext";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    // Check admin authorization
    await requireAdmin();

    const donations = await listDonations();
    return NextResponse.json({ ok: true, donations });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { donorName, email, amount, coverFees, phone } = DonationSchema.parse(body);

    const donation = await createDonation({
      donorName,
      email,
      phone: phone ?? "",
      amount: Math.round(amount),
      coverFees: Boolean(coverFees),
    });

    await createInquiry({
      type: "donation",
      referenceId: donation.id,
      title: `Donation from ${donorName}`,
      preview: `${donation.donationId} • ${Math.round(amount)} INR`,
    });

    return NextResponse.json(
      {
        ok: true,
        donation,
        message: `Donation recorded successfully. Reference: ${donation.donationId}.`,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}