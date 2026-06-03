import { NextRequest, NextResponse } from "next/server";
import { generateOTP, createOtpRecord } from "@/lib/otp";
import { saveOtpRecord, getOtpRecord } from "@/lib/otpStore";
import { sendOtpEmail } from "@/lib/emailService";
import { handleError } from "@/lib/apiErrors";
import { ResendOtpSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

interface ResendOtpRequest {
  email: string;
}

/**
 * POST /api/auth/resend-otp
 * Resend OTP if the previous one expired or user didn't receive it
 * 
 * Request body:
 * {
 *   "email": "john@example.com"
 * }
 * 
 * Response (200):
 * 
 * {
 *   "ok": true,
 *   "message": "Verification code resent to your email."
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ResendOtpRequest;
    const { email } = ResendOtpSchema.parse(body);
    const normalizedEmail = email.toLowerCase().trim();

    const rateLimit = checkRateLimit(`resend-otp:${normalizedEmail}`, 1, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          ok: false,
          message: `Please wait ${rateLimit.retryAfterSeconds} seconds before requesting a new code.`,
          waitSeconds: rateLimit.retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    // Check if there's already a recent OTP
    const existingRecord = await getOtpRecord(normalizedEmail);

    if (existingRecord) {
      const timeSinceCreation = Date.now() - existingRecord.createdAt;
      const oneMinute = 60 * 1000;

      // Rate limit: Allow resend only after 1 minute
      if (timeSinceCreation < oneMinute) {
        const secondsToWait = Math.ceil((oneMinute - timeSinceCreation) / 1000);
        return NextResponse.json(
          { 
            ok: false, 
            message: `Please wait ${secondsToWait} seconds before requesting a new code.`,
            waitSeconds: secondsToWait
          },
          { status: 429 }
        );
      }
    }

    // Generate new OTP
    const newOtp = generateOTP();
    const otpRecord = createOtpRecord(normalizedEmail, newOtp);
    await saveOtpRecord(otpRecord);

    // Send OTP email
    const emailResult = await sendOtpEmail(normalizedEmail, newOtp);

    if (!emailResult.sent) {
      if (process.env.NODE_ENV !== "production") {
        return NextResponse.json(
          {
            ok: true,
            message: "Verification code resent to your email.",
            verificationCode: newOtp,
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { 
          ok: false, 
          message: "Failed to send verification email. Please try again later.",
          reason: emailResult.reason
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        message: "Verification code resent to your email.",
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
