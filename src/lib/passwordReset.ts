import crypto from "crypto";

const RESET_TOKEN_BYTES = 32;

export function generatePasswordResetToken(): string {
  return crypto.randomBytes(RESET_TOKEN_BYTES).toString("hex");
}

export function hashPasswordResetToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function createPasswordResetLink(baseUrl: string, email: string, token: string): string {
  const url = new URL("/reset-password", baseUrl);
  url.searchParams.set("email", email);
  url.searchParams.set("token", token);
  return url.toString();
}