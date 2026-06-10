import { NextRequest, NextResponse } from "next/server";
import { SignupSchema } from "@/lib/validation";
import { handleError } from "@/lib/apiErrors";
import { checkRateLimit } from "@/lib/rateLimit";
import { generateOTP, createOtpRecord } from "@/lib/otp";
import { saveOtpRecord } from "@/lib/otpStore";
import { sendOtpEmail } from "@/lib/emailService";
import { findUserByEmail } from "@/lib/usersStore";

export const runtime = "nodejs";

function normalizeSignupRole(value: string | undefined | null) {
  // Accept only the explicit application roles. If none match, use a general account.
  if (value === "volunteer" || value === "adopter" || value === "donor") {
    return value;
  }

  return "general";
}

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

    const normalizedEmail = validated.email.trim().toLowerCase();
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";

    // Rate limit signups per email and per IP
    const emailLimit = checkRateLimit(`signup:email:${normalizedEmail}`, 3, 60 * 60 * 1000); // 3 per hour per email
    if (!emailLimit.allowed) {
      return NextResponse.json({ ok: false, message: `Too many signup attempts for this email. Try again in ${emailLimit.retryAfterSeconds} seconds.` }, { status: 429 });
    }

    const ipLimit = checkRateLimit(`signup:ip:${ip}`, 20, 60 * 60 * 1000); // 20 per hour per IP
    if (!ipLimit.allowed) {
      return NextResponse.json({ ok: false, message: `Too many signup attempts from this IP. Try again in ${ipLimit.retryAfterSeconds} seconds.` }, { status: 429 });
    }

    // Generate 4-digit OTP
    const otp = generateOTP();

    // Create OTP record with 10-minute expiry
    const otpRecord = createOtpRecord(validated.email, otp);
    await saveOtpRecord(otpRecord);

    // Determine role on the server side (infer from referer or default to general)
    const referer = request.headers.get("referer") || request.headers.get("referrer") || "";
    let inferredRole: string | undefined = undefined;
    try {
      if (referer) {
        const url = new URL(referer);
        const q = url.searchParams.get("role");
        if (q === "volunteer" || q === "adopter" || q === "donor") {
          inferredRole = q;
        } else {
          const path = url.pathname.toLowerCase();
          if (path.includes("/volunteer")) inferredRole = "volunteer";
          else if (path.includes("/adopt") || path.includes("/adoptions") || path.includes("/adopt/")) inferredRole = "adopter";
        }
      }
    } catch (e) {
      // ignore referer parse errors
    }

    const finalRole = normalizeSignupRole(inferredRole);

    // Send OTP email
    const emailResult = await sendOtpEmail(validated.email, otp);

    if (!emailResult.sent) {
      console.error("OTP email delivery failed", {
        email: normalizedEmail,
        reason: emailResult.reason,
        smtpConfigured: Boolean(
          process.env.EMAIL_SMTP_HOST &&
          process.env.EMAIL_SMTP_PORT &&
          process.env.EMAIL_SMTP_USER &&
          process.env.EMAIL_SMTP_PASS &&
          process.env.EMAIL_FROM
        ),
      });

      if (process.env.NODE_ENV !== "production") {
        const response = NextResponse.json(
          {
            ok: true,
            message: "Account created. Check your email for a 4-digit verification code.",
            email: validated.email,
            verificationCode: otp,
          },
          { status: 201 }
        );

        response.cookies.set("tch_signup_data", JSON.stringify({
          name: validated.name,
          email: validated.email,
          passwordHash: validated.password,
          role: finalRole,
        }), {
          httpOnly: true,
          secure: (process.env.NODE_ENV as string) === "production",
          sameSite: "strict",
          maxAge: 10 * 60,
        });

        return response;
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
      role: finalRole,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 10 * 60, // 10 minutes to match OTP expiry
    });

    return response;
  } catch (error) {
    return handleError(error);
  }
}

