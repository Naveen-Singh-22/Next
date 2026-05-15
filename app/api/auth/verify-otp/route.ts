import { NextRequest, NextResponse } from "next/server";
import { getOtpRecord, deleteOtpRecord } from "@/lib/otpStore";
import { isOtpValid, verifyOtp, canAttemptVerification, incrementAttempts, createOtpRecord } from "@/lib/otp";
import { handleError, ValidationError } from "@/lib/apiErrors";
import { createUser } from "@/lib/usersStore";
import { saveOtpRecord } from "@/lib/otpStore";

export const runtime = "nodejs";

interface VerifyOtpRequest {
  email: string;
  otp: string;
}

/**
 * POST /api/auth/verify-otp
 * Verify OTP and complete user account creation
 * 
 * Request body:
 * {
 *   "email": "john@example.com",
 *   "otp": "1234"
 * }
 * 
 * Response (200):
 * {
 *   "ok": true,
 *   "message": "Email verified successfully. Your account is now active.",
 *   "role": "donor",
 *   "email": "john@example.com"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as VerifyOtpRequest;

    // Validate input
    if (!body.email || !body.otp) {
      throw new ValidationError("Email and OTP are required");
    }

    const email = body.email.toLowerCase().trim();
    const providedOtp = body.otp.trim();

    // Get OTP record
    const otpRecord = await getOtpRecord(email);

    if (!otpRecord) {
      return NextResponse.json(
        { ok: false, message: "No verification code found for this email. Please sign up again." },
        { status: 404 }
      );
    }

    // Check if OTP is still valid
    if (!isOtpValid(otpRecord)) {
      await deleteOtpRecord(email);
      return NextResponse.json(
        { ok: false, message: "Verification code has expired. Please sign up again." },
        { status: 410 }
      );
    }

    // Check if user can attempt verification
    if (!canAttemptVerification(otpRecord)) {
      await deleteOtpRecord(email);
      return NextResponse.json(
        { ok: false, message: "Too many incorrect attempts. Please sign up again." },
        { status: 429 }
      );
    }

    // Verify OTP
    if (!verifyOtp(otpRecord, providedOtp)) {
      // Increment attempts
      const updatedRecord = incrementAttempts(otpRecord);
      await saveOtpRecord(updatedRecord);

      const remaining = updatedRecord.maxAttempts - updatedRecord.attempts;
      return NextResponse.json(
        { 
          ok: false, 
          message: `Invalid verification code. ${remaining} attempts remaining.`,
          attemptsRemaining: remaining
        },
        { status: 401 }
      );
    }

    // OTP is valid - get signup data from cookie
    const signupDataCookie = request.cookies.get("tch_signup_data")?.value;

    if (!signupDataCookie) {
      return NextResponse.json(
        { ok: false, message: "Session expired. Please sign up again." },
        { status: 401 }
      );
    }

    let signupData: any;
    try {
      signupData = JSON.parse(signupDataCookie);
    } catch {
      return NextResponse.json(
        { ok: false, message: "Invalid session data. Please sign up again." },
        { status: 400 }
      );
    }

    // Create user account
    try {
      const newUser = await createUser({
        name: signupData.name,
        email: signupData.email,
        password: signupData.passwordHash,
        role: "donor",
      });

      // Delete OTP record after successful verification
      await deleteOtpRecord(email);

      // Clear signup cookie
      const response = NextResponse.json(
        {
          ok: true,
          message: "Email verified successfully. Your account is now active.",
          role: newUser.role || "donor",
          email: newUser.email,
          name: newUser.name,
        },
        { status: 200 }
      );

      response.cookies.delete("tch_signup_data");

      return response;
    } catch (createError) {
      const errorMsg = createError instanceof Error ? createError.message : "Failed to create account";
      return NextResponse.json(
        { ok: false, message: errorMsg },
        { status: 500 }
      );
    }
  } catch (error) {
    return handleError(error);
  }
}
