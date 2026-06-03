import bcrypt from "bcryptjs";
import jwt, { TokenExpiredError, type SignOptions } from "jsonwebtoken";

export type AuthRole = "admin" | "staff" | "donor" | "volunteer" | "adopter" | "general";

export const AUTH_TOKEN_COOKIE = "tch_auth_token";
export const AUTH_SESSION_MAX_AGE = 60 * 60 * 8;
const PASSWORD_SALT_ROUNDS = 10;

export type TokenPayload = {
  userId: number;
  email: string;
  fullName: string;
  role: AuthRole;
};

export type AuthenticatedUser = TokenPayload;

export type AuthTokenSource = "bearer" | "cookie";

export type AuthValidationResult = {
  user: AuthenticatedUser | null;
  source: AuthTokenSource | null;
  expired: boolean;
  expiresAt: string | null;
  expiresInSeconds: number | null;
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.trim().length < 32) {
    throw new Error("JWT_SECRET must be set and at least 32 characters long.");
  }

  return secret;
}

export function normalizeAuthRole(value: string | null | undefined): AuthRole | null {
  if (value === "admin" || value === "staff" || value === "donor" || value === "volunteer" || value === "adopter" || value === "general") {
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

export function calculateSessionExpiresAt(maxAgeSeconds: number): string {
  return new Date(Date.now() + maxAgeSeconds * 1000).toISOString();
}

function parseVerifiedTokenPayload(decoded: unknown): {
  user: TokenPayload;
  exp: number | null;
} {
  if (!decoded || typeof decoded !== "object") {
    throw new Error("Invalid authentication token payload.");
  }

  const payload = decoded as Partial<TokenPayload> & { exp?: unknown };

  if (
    typeof payload.userId !== "number" ||
    typeof payload.email !== "string" ||
    typeof payload.fullName !== "string" ||
    normalizeAuthRole(payload.role) === null
  ) {
    throw new Error("Invalid authentication token payload.");
  }

  const exp = typeof payload.exp === "number" ? payload.exp : null;

  return {
    user: {
      userId: payload.userId,
      email: payload.email,
      fullName: payload.fullName,
      role: payload.role,
    } as TokenPayload,
    exp,
  };
}

export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, getJwtSecret());
  return parseVerifiedTokenPayload(decoded).user;
}

// Password hashing: plaintext passwords are never stored in DB.
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function isBcryptHash(value: string) {
  return /^\$2[aby]?\$\d{2}\$/.test(value);
}

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  return getUserFromRequest();
}

async function getTokenFromRequest(request?: Request): Promise<{ token: string | null; source: AuthTokenSource | null }> {
  if (request) {
    const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.slice(7).trim();
      if (token) {
        return { token, source: "bearer" };
      }
    }
  }

  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value ?? null;
    return { token, source: token ? "cookie" : null };
  } catch {
    return { token: null, source: null };
  }
}

export async function validateAuthFromRequest(request?: Request): Promise<AuthValidationResult> {
  const { token, source } = await getTokenFromRequest(request);

  if (!token) {
    return {
      user: null,
      source,
      expired: false,
      expiresAt: null,
      expiresInSeconds: null,
    };
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    const { user, exp } = parseVerifiedTokenPayload(decoded);

    const expiresAt = exp ? new Date(exp * 1000).toISOString() : null;
    const expiresInSeconds = exp ? Math.max(0, exp - Math.floor(Date.now() / 1000)) : null;

    return {
      user,
      source,
      expired: false,
      expiresAt,
      expiresInSeconds,
    };
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return {
        user: null,
        source,
        expired: true,
        expiresAt: error.expiredAt.toISOString(),
        expiresInSeconds: 0,
      };
    }

    return {
      user: null,
      source,
      expired: false,
      expiresAt: null,
      expiresInSeconds: null,
    };
  }
}

export async function getUserFromRequest(request?: Request): Promise<AuthenticatedUser | null> {
  const result = await validateAuthFromRequest(request);
  return result.user;
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
