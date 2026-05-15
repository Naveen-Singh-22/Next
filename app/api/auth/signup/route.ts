import { NextRequest, NextResponse } from "next/server";
import { SignupSchema } from "@/lib/validation";
import { handleError, ValidationError } from "@/lib/apiErrors";
import { generateOTP, createOtpRecord } from "@/lib/otp";
import { saveOtpRecord } from "@/lib/otpStore";
import { sendOtpEmail } from "@/lib/emailService";
import { findUserByEmail } from "@/lib/usersStore";

export const runtime = "nodejs";

/**
 * POST /api/auth/signup
 * Create a new user account and send OTP for email verification
 * 
 * Request body:
 * {
 *   "name": "John Doe",
 *   "email": "john@example.com",
 *   "password": "SecurePass123!",
 *   "confirmPassword": "SecurePass123!"
 * }
 * 
 * Response (201):
 * {
 *   "ok": true,
 *   "message": "Account created. Check your email for verification code.",
 *   "email": "john@example.com"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validated = SignupSchema.parse(body);

    // Check if user already exists
    const existing = await findUserByEmail(validated.email);
    if (existing) {
      return NextResponse.json(
        { ok: false, message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // Generate 4-digit OTP
    const otp = generateOTP();

    // Create OTP record with 10-minute expiry
    const otpRecord = createOtpRecord(validated.email, otp);
    await saveOtpRecord(otpRecord);

    // Send OTP email
    const emailResult = await sendOtpEmail(validated.email, otp);

    if (!emailResult.sent) {
      return NextResponse.json(
        { 
          ok: false, 
          message: "Failed to send verification email. Please try again later.",
          reason: emailResult.reason 
        },
        { status: 500 }
      );
    }

    // Store signup data temporarily (will be completed after OTP verification)
    // For now, we'll store it in a session cookie
    const response = NextResponse.json(
      {
        ok: true,
        message: "Account created. Check your email for a 4-digit verification code.",
        email: validated.email,
      },
      { status: 201 }
    );

    // Set a temporary signup cookie with user data (for OTP verification)
    response.cookies.set("tch_signup_data", JSON.stringify({
      name: validated.name,
      email: validated.email,
      passwordHash: validated.password, // Will be hashed on verification
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 10 * 60, // 10 minutes to match OTP expiry
    });

    return response;
  } catch (error) {
    return handleError(error);
  }
}

