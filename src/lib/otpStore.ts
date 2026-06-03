import { prisma } from "@/lib/prisma";
import type { OtpRecord } from "./otp";

function toDate(value: number) {
  return new Date(value);
}

/**
 * Save OTP record for an email
 * Replaces any existing OTP for the same email
 */
export async function saveOtpRecord(record: OtpRecord): Promise<OtpRecord> {
  const row = await prisma.otpRecord.upsert({
    where: { email: record.email },
    update: {
      otp: record.otp,
      createdAt: toDate(record.createdAt),
      expiresAt: toDate(record.expiresAt),
      attempts: record.attempts,
      maxAttempts: record.maxAttempts,
    },
    create: {
      email: record.email,
      otp: record.otp,
      createdAt: toDate(record.createdAt),
      expiresAt: toDate(record.expiresAt),
      attempts: record.attempts,
      maxAttempts: record.maxAttempts,
    },
  });

  return {
    email: row.email,
    otp: row.otp,
    createdAt: row.createdAt.getTime(),
    expiresAt: row.expiresAt.getTime(),
    attempts: row.attempts,
    maxAttempts: row.maxAttempts,
  };
}

/**
 * Get OTP record by email
 */
export async function getOtpRecord(email: string): Promise<OtpRecord | null> {
  const row = await prisma.otpRecord.findUnique({ where: { email } });

  if (!row) {
    return null;
  }

  return {
    email: row.email,
    otp: row.otp,
    createdAt: row.createdAt.getTime(),
    expiresAt: row.expiresAt.getTime(),
    attempts: row.attempts,
    maxAttempts: row.maxAttempts,
  };
}

/**
 * Delete OTP record after verification
 */
export async function deleteOtpRecord(email: string): Promise<void> {
  await prisma.otpRecord.delete({ where: { email } }).catch((error: { code?: string }) => {
    if (error.code === "P2025") {
      return null;
    }

    throw error;
  });
}

/**
 * Clean up expired OTP records (runs periodically)
 */
export async function cleanupExpiredOtps(): Promise<number> {
  const deleted = await prisma.otpRecord.deleteMany({
    where: { expiresAt: { lte: new Date() } },
  });

  return deleted.count;
}
