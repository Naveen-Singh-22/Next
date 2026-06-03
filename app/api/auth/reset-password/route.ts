import { NextRequest, NextResponse } from "next/server";
import { ResetPasswordSchema } from "@/lib/validation";
import { handleError, AuthenticationError, ValidationError } from "@/lib/apiErrors";
import { getPasswordResetRecord, deletePasswordResetRecord, savePasswordResetRecord } from "@/lib/passwordResetStore";
import { hashPasswordResetToken } from "@/lib/passwordReset";
import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, token, password } = ResetPasswordSchema.parse(body);
    const normalizedEmail = email.toLowerCase().trim();

    const record = await getPasswordResetRecord(normalizedEmail);
    if (!record) {
      throw new AuthenticationError("Password reset link is invalid or has expired.");
    }

    if (record.expiresAt <= Date.now() || record.usedAt !== null) {
      await deletePasswordResetRecord(normalizedEmail);
      throw new AuthenticationError("Password reset link is invalid or has expired.");
    }

    if (record.attempts >= record.maxAttempts) {
      await deletePasswordResetRecord(normalizedEmail);
      throw new AuthenticationError("Too many attempts. Please request a new password reset link.");
    }

    const tokenHash = hashPasswordResetToken(token.trim());
    if (tokenHash !== record.tokenHash) {
      await savePasswordResetRecord({
        ...record,
        attempts: record.attempts + 1,
      });

      throw new AuthenticationError("Password reset link is invalid or has expired.");
    }

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      throw new ValidationError("No account found for that email address.");
    }

    const hashedPassword = await hashPassword(password);
    await prisma.user.update({
      where: { email: normalizedEmail },
      data: {
        password: hashedPassword,
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    await deletePasswordResetRecord(normalizedEmail);

    return NextResponse.json(
      {
        ok: true,
        message: "Password reset successfully. You can now sign in with your new password.",
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}