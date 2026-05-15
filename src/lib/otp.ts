/**
 * OTP (One-Time Password) generation and verification utilities
 * Generates 4-digit OTPs for email verification
 */

export type OtpRecord = {
  email: string;
  otp: string;
  createdAt: number; // timestamp
  expiresAt: number; // timestamp
  attempts: number;
  maxAttempts: number;
};

const OTP_LENGTH = 4;
const OTP_EXPIRY_MINUTES = 10; // OTP valid for 10 minutes
const MAX_ATTEMPTS = 3; // Max verification attempts

/**
 * Generate a random 4-digit OTP
 */
export function generateOTP(): string {
  const otp = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(OTP_LENGTH, "0");
  return otp;
}

/**
 * Create an OTP record with expiry time
 */
export function createOtpRecord(email: string, otp: string): OtpRecord {
  const now = Date.now();
  return {
    email,
    otp,
    createdAt: now,
    expiresAt: now + OTP_EXPIRY_MINUTES * 60 * 1000,
    attempts: 0,
    maxAttempts: MAX_ATTEMPTS,
  };
}

/**
 * Check if OTP is still valid (not expired)
 */
export function isOtpValid(record: OtpRecord): boolean {
  const now = Date.now();
  return now <= record.expiresAt;
}

/**
 * Check if OTP matches (constant-time comparison to prevent timing attacks)
 */
export function verifyOtp(record: OtpRecord, providedOtp: string): boolean {
  // Constant-time comparison
  return constantTimeCompare(record.otp, providedOtp);
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Check if verification attempts exceeded
 */
export function canAttemptVerification(record: OtpRecord): boolean {
  return record.attempts < record.maxAttempts;
}

/**
 * Increment verification attempt count
 */
export function incrementAttempts(record: OtpRecord): OtpRecord {
  return {
    ...record,
    attempts: record.attempts + 1,
  };
}
