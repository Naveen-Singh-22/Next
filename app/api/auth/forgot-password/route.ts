import { NextRequest, NextResponse } from "next/server";
import { ForgotPasswordSchema } from "@/lib/validation";
import { handleError } from "@/lib/apiErrors";
import { findUserByEmail } from "@/lib/usersStore";
import { generatePasswordResetToken, hashPasswordResetToken, createPasswordResetLink } from "@/lib/passwordReset";
import { savePasswordResetRecord } from "@/lib/passwordResetStore";
import { sendPasswordResetEmail } from "@/lib/emailService";
import { checkRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

const RESET_TOKEN_EXPIRY_MINUTES = 15;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = ForgotPasswordSchema.parse(body);
    const normalizedEmail = email.toLowerCase().trim();

    const rateLimit = checkRateLimit(`forgot-password:${normalizedEmail}`, 3, 60 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          ok: false,
          message: `Please wait ${rateLimit.retryAfterSeconds} seconds before requesting another reset link.`,
          waitSeconds: rateLimit.retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    const user = await findUserByEmail(normalizedEmail);
    if (!user || !user.password) {
      return NextResponse.json(
        {
          ok: true,
          message: "If an account exists for that email, we sent a password reset link.",
        },
        { status: 200 }
      );
    }

    const resetToken = generatePasswordResetToken();
    const tokenHash = hashPasswordResetToken(resetToken);
    const now = Date.now();
    const expiresAt = now + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    const resetUrl = createPasswordResetLink(baseUrl, normalizedEmail, resetToken);

    await savePasswordResetRecord({
      email: normalizedEmail,
      tokenHash,
      createdAt: now,
      expiresAt,
      usedAt: null,
      attempts: 0,
      maxAttempts: 5,
    });

    const emailResult = await sendPasswordResetEmail(normalizedEmail, resetUrl);

    if (!emailResult.sent) {
      if (process.env.NODE_ENV !== "production") {
        return NextResponse.json(
          {
            ok: true,
            message: "If an account exists for that email, we sent a password reset link.",
            resetUrl,
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        {
          ok: false,
          message: "Failed to send password reset email. Please try again later.",
          reason: emailResult.reason,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        message: "If an account exists for that email, we sent a password reset link.",
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}