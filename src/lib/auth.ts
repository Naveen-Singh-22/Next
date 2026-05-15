import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";

export type AuthRole = "admin" | "staff" | "donor" | "volunteer" | "adopter";

export const AUTH_TOKEN_COOKIE = "tch_auth_token";
export const AUTH_ROLE_COOKIE = "tch_auth_role";
export const AUTH_EMAIL_COOKIE = "tch_auth_email";
export const AUTH_SESSION_MAX_AGE = 60 * 60 * 8;
const PASSWORD_SALT_ROUNDS = 10;

export type TokenPayload = {
  userId: number;
  email: string;
  fullName: string;
  role: AuthRole;
};

export type AuthenticatedUser = TokenPayload;

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.trim().length < 32) {
    throw new Error("JWT_SECRET must be set and at least 32 characters long.");
  }

  return secret;
}

export function normalizeAuthRole(value: string | null | undefined): AuthRole | null {
  if (value === "admin" || value === "staff" || value === "donor" || value === "volunteer" || value === "adopter") {
    return value;
  }

  return null;
}

// JWT flow: user logs in with email/password, server signs a short-lived token,
// and stores it in an httpOnly cookie so browser scripts cannot read it.
export function generateToken(payload: TokenPayload, expiresInSeconds: number = AUTH_SESSION_MAX_AGE) {
  const options: SignOptions = {
    expiresIn: expiresInSeconds,
  };

  return jwt.sign(payload, getJwtSecret(), options);
}

export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, getJwtSecret());

  if (!decoded || typeof decoded !== "object") {
    throw new Error("Invalid authentication token payload.");
  }

  const payload = decoded as Partial<TokenPayload>;

  if (
    typeof payload.userId !== "number" ||
    typeof payload.email !== "string" ||
    typeof payload.fullName !== "string" ||
    normalizeAuthRole(payload.role) === null
  ) {
    throw new Error("Invalid authentication token payload.");
  }

  return {
    userId: payload.userId,
    email: payload.email,
    fullName: payload.fullName,
    role: payload.role,
  } as TokenPayload;
}

// Password hashing: plaintext passwords are never stored in DB.
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

export function sanitizeAuthNextPath(nextPath: string | null, fallbackPath: string) {
  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("/login") || nextPath.startsWith("/admin/login")) {
    return fallbackPath;
  }

  return nextPath;
}

export function resolveLoginDestination(role: AuthRole, nextPath: string | null) {
  const fallbackPath = role === "admin" ? "/admin" : "/";
  const sanitizedPath = sanitizeAuthNextPath(nextPath, fallbackPath);

  if (role !== "admin") {
    if (sanitizedPath.startsWith("/admin")) {
      return "/";
    }

    return sanitizedPath;
  }

  if (!sanitizedPath.startsWith("/admin")) {
    return "/admin";
  }

  return sanitizedPath;
}
