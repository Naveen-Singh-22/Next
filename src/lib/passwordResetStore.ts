import { prisma } from "@/lib/prisma";

export type PasswordResetRecord = {
  email: string;
  tokenHash: string;
  createdAt: number;
  expiresAt: number;
  usedAt: number | null;
  attempts: number;
  maxAttempts: number;
};

function toDate(value: number) {
  return new Date(value);
}

export async function savePasswordResetRecord(record: PasswordResetRecord): Promise<PasswordResetRecord> {
  const row = await prisma.passwordResetToken.upsert({
    where: { email: record.email },
    update: {
      tokenHash: record.tokenHash,
      createdAt: toDate(record.createdAt),
      expiresAt: toDate(record.expiresAt),
      usedAt: record.usedAt ? toDate(record.usedAt) : null,
      attempts: record.attempts,
      maxAttempts: record.maxAttempts,
    },
    create: {
      email: record.email,
      tokenHash: record.tokenHash,
      createdAt: toDate(record.createdAt),
      expiresAt: toDate(record.expiresAt),
      usedAt: record.usedAt ? toDate(record.usedAt) : null,
      attempts: record.attempts,
      maxAttempts: record.maxAttempts,
    },
  });

  return {
    email: row.email,
    tokenHash: row.tokenHash,
    createdAt: row.createdAt.getTime(),
    expiresAt: row.expiresAt.getTime(),
    usedAt: row.usedAt ? row.usedAt.getTime() : null,
    attempts: row.attempts,
    maxAttempts: row.maxAttempts,
  };
}

export async function getPasswordResetRecord(email: string): Promise<PasswordResetRecord | null> {
  const row = await prisma.passwordResetToken.findUnique({ where: { email } });

  if (!row) {
    return null;
  }

  return {
    email: row.email,
    tokenHash: row.tokenHash,
    createdAt: row.createdAt.getTime(),
    expiresAt: row.expiresAt.getTime(),
    usedAt: row.usedAt ? row.usedAt.getTime() : null,
    attempts: row.attempts,
    maxAttempts: row.maxAttempts,
  };
}

export async function deletePasswordResetRecord(email: string): Promise<void> {
  await prisma.passwordResetToken.delete({ where: { email } }).catch((error: { code?: string }) => {
    if (error.code === "P2025") {
      return null;
    }

    throw error;
  });
}