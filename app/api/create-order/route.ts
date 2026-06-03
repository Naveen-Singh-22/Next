import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { getRazorpayClient, getRazorpayConfig } from "@/lib/razorpay";
import { RazorpayCreateOrderSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payload = RazorpayCreateOrderSchema.parse(body);

    if (payload.amount < 100) {
      return NextResponse.json(
        {
          ok: false,
          message: "Amount must be at least 100 paise.",
        },
        { status: 400 },
      );
    }

    const razorpay = getRazorpayClient();
    const { keyId } = getRazorpayConfig();

    const order = await razorpay.orders.create({
      amount: payload.amount,
      currency: payload.currency,
      receipt: payload.receipt,
      notes: {
        donorName: payload.donorName,
        email: payload.email,
        phone: payload.phone ?? "",
        coverFees: String(payload.coverFees),
      },
    });

    return NextResponse.json(
      {
        ok: true,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        razorpay_key_id: keyId,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("Razorpay credentials are not configured.")) {
      return NextResponse.json(
        {
          ok: false,
          message: error.message,
        },
        { status: 500 },
      );
    }

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

    const maybeError = error as { statusCode?: number; status?: number } | null;

    if (maybeError?.statusCode === 401 || maybeError?.status === 401) {
      return NextResponse.json(
        {
          ok: false,
          message: "Razorpay authentication failed. Check your API keys.",
        },
        { status: 401 },
      );
    }

    console.error("[create-order] Razorpay order creation failed", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to create Razorpay order.",
      },
      { status: 500 },
    );
  }
}