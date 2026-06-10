import { NextRequest, NextResponse } from "next/server";
import { getOtpRecord, deleteOtpRecord } from "@/lib/otpStore";
import { isOtpValid, verifyOtp, canAttemptVerification, incrementAttempts } from "@/lib/otp";
import { handleError } from "@/lib/apiErrors";
import { createUser } from "@/lib/usersStore";
import { AUTH_SESSION_MAX_AGE, calculateSessionExpiresAt, normalizeAuthRole } from "@/lib/auth";
import { saveOtpRecord } from "@/lib/otpStore";
import { VerifyOtpSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

interface VerifyOtpRequest {
  email: string;
  otp: string;
}

interface SignupSessionData {
  name: string;
  email: string;
  passwordHash: string;
  role?: "donor" | "volunteer" | "adopter" | "general";
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
    const { email, otp: providedOtpInput } = VerifyOtpSchema.parse(body);
    const normalizedEmail = email.toLowerCase().trim();
    const providedOtp = providedOtpInput.trim();

    const rateLimit = checkRateLimit(`verify-otp:${normalizedEmail}`, 5, 15 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          ok: false,
          message: `Too many verification attempts. Please try again in ${rateLimit.retryAfterSeconds} seconds.`,
          waitSeconds: rateLimit.retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    // Get OTP record
    const otpRecord = await getOtpRecord(normalizedEmail);

    if (!otpRecord) {
      return NextResponse.json(
        { ok: false, message: "No verification code found for this email. Please sign up again." },
        { status: 404 }
      );
    }

    // Check if OTP is still valid
    if (!isOtpValid(otpRecord)) {
      await deleteOtpRecord(normalizedEmail);
      return NextResponse.json(
        { ok: false, message: "Verification code has expired. Please sign up again." },
        { status: 410 }
      );
    }

    // Check if user can attempt verification
    if (!canAttemptVerification(otpRecord)) {
      await deleteOtpRecord(normalizedEmail);
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

    let signupData: SignupSessionData;
    try {
      const parsedSignupData = JSON.parse(signupDataCookie) as Partial<SignupSessionData>;

      if (!parsedSignupData.name || !parsedSignupData.email || !parsedSignupData.passwordHash) {
        return NextResponse.json(
          { ok: false, message: "Invalid session data. Please sign up again." },
          { status: 400 }
        );
      }

      signupData = {
        name: parsedSignupData.name,
        email: parsedSignupData.email,
        passwordHash: parsedSignupData.passwordHash,
        role: parsedSignupData.role,
      };
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
        role: signupData.role ?? "adopter",
        // mark as verified since OTP matched
        emailVerified: true,
        emailVerifiedAt: new Date().toISOString(),
      });

      // Delete OTP record after successful verification
      await deleteOtpRecord(normalizedEmail);

      // Create session token and set auth cookie so user is logged in immediately
      const { generateToken } = await import("@/lib/auth");
      const maxAge = AUTH_SESSION_MAX_AGE;
      const expiresAt = calculateSessionExpiresAt(maxAge);
      const tokenRole = normalizeAuthRole(newUser.role) ?? "general";
      const token = generateToken({ userId: newUser.id, email: newUser.email, fullName: newUser.name, role: tokenRole }, maxAge);

      const response = NextResponse.json(
        {
          ok: true,
          message: "Email verified successfully. Your account is now active.",
          role: newUser.role || "general",
          email: newUser.email,
          name: newUser.name,
          expiresIn: maxAge,
          expiresAt,
          token,
        },
        { status: 200 }
      );

      response.cookies.set({ name: "tch_auth_token", value: token, httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge });

      // Clear signup cookie
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
