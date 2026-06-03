import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { createInquiry } from "@/lib/inquiryStore";
import { createDonation } from "@/lib/donationsStore";
import { paiseToRupees, verifyRazorpaySignature } from "@/lib/razorpay";
import { RazorpayVerifyPaymentSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payload = RazorpayVerifyPaymentSchema.parse(body);

    const isSignatureValid = verifyRazorpaySignature(
      payload.razorpay_order_id,
      payload.razorpay_payment_id,
      payload.razorpay_signature,
    );

    if (!isSignatureValid) {
      return NextResponse.json(
        {
          ok: false,
          message: "Payment signature verification failed.",
        },
        { status: 400 },
      );
    }

    const donation = await createDonation({
      donorName: payload.donorName,
      email: payload.email,
      phone: payload.phone ?? "",
      amount: paiseToRupees(payload.amount),
      coverFees: Boolean(payload.coverFees),
    });

    await createInquiry({
      type: "donation",
      referenceId: donation.id,
      title: `Razorpay donation from ${payload.donorName}`,
      preview: `${donation.donationId} • ${paiseToRupees(payload.amount)} INR`,
    });

    return NextResponse.json(
      {
        ok: true,
        message: "Payment verified successfully.",
        donation,
        payment_id: payload.razorpay_payment_id,
        order_id: payload.razorpay_order_id,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          message: "Validation failed",
          error: error.issues?.[0]?.message ?? "Invalid request body",
        },
        { status: 400 },
      );
    }

    console.error("[verify-payment] Razorpay verification failed", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to verify payment.",
      },
      { status: 500 },
    );
  }
}