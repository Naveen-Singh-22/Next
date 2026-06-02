import { NextResponse } from "next/server";
import {
  AUTH_SESSION_MAX_AGE,
  AUTH_TOKEN_COOKIE,
  calculateSessionExpiresAt,
  comparePassword,
  generateToken,
  hashPassword,
  isBcryptHash,
  normalizeAuthRole,
  type AuthRole,
} from "@/lib/auth";
import { LoginSchema } from "@/lib/validation";
import { handleError, AuthenticationError } from "@/lib/apiErrors";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

async function seedInitialAdminIfNeeded() {
  const userCount = await prisma.user.count();

  if (userCount > 0) {
    return;
  }

  const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "";
  const fullName = (process.env.ADMIN_FULL_NAME ?? "Platform Admin").trim();

  if (!email || !password || password.length < 8) {
    return;
  }

  const passwordHash = await hashPassword(password);
  await prisma.user.create({
    data: {
      email,
      password: passwordHash,
      fullName,
      role: "admin",
    },
  });
}

export async function POST(request: Request) {
  try {
    await seedInitialAdminIfNeeded();

    const body = await request.json();
    const requestedRole = normalizeAuthRole(body?.role);
    const { email, password, rememberMe } = LoginSchema.parse(body);
    const normalizedEmail = email.trim().toLowerCase();
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    
    if (!user) {
      // increment per-email and per-IP counters for non-existent account
      const emailKey = `login:email:${normalizedEmail}`;
      const ipKey = `login:ip:${ip}`;
      const emailLimit = checkRateLimit(emailKey, 5, 15 * 60 * 1000);
      const ipLimit = checkRateLimit(ipKey, 100, 15 * 60 * 1000);
      if (!emailLimit.allowed || !ipLimit.allowed) {
        return NextResponse.json({ ok: false, message: `Too many login attempts. Try again in ${Math.max(emailLimit.retryAfterSeconds, ipLimit.retryAfterSeconds)} seconds.` }, { status: 429 });
      }

      throw new AuthenticationError("Invalid email or password.");
    }

    let isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid && (!isBcryptHash(user.password) && user.password === password)) {
      const upgradedPassword = await hashPassword(password);
      await prisma.user.update({ where: { id: user.id }, data: { password: upgradedPassword } });
      isPasswordValid = true;
    }

    if (!isPasswordValid) {
      // increment rate limits on failed password
      const emailKey = `login:email:${normalizedEmail}`;
      const ipKey = `login:ip:${ip}`;
      const emailLimit = checkRateLimit(emailKey, 5, 15 * 60 * 1000);
      const ipLimit = checkRateLimit(ipKey, 100, 15 * 60 * 1000);
      if (!emailLimit.allowed || !ipLimit.allowed) {
        return NextResponse.json({ ok: false, message: `Too many login attempts. Try again in ${Math.max(emailLimit.retryAfterSeconds, ipLimit.retryAfterSeconds)} seconds.` }, { status: 429 });
      }

      throw new AuthenticationError("Invalid email or password.");
    }

    const role = normalizeAuthRole(user.role) as AuthRole | null;

    if (!role || role !== "admin") {
      // Require email verification for non-admin users
      if (user.emailVerified === false) {
        throw new AuthenticationError("Email not verified. Please verify your email before logging in.");
      }

      if (requestedRole === "admin") {
        throw new AuthenticationError("Unauthorized role for admin access.");
      }
    }

    const maxAge = rememberMe ? AUTH_SESSION_MAX_AGE * 7 : AUTH_SESSION_MAX_AGE;
    const expiresAt = calculateSessionExpiresAt(maxAge);
    const tokenRole: AuthRole = role ?? "donor";
    const token = generateToken(
      {
        userId: user.id,
        email: user.email,
        fullName: user.fullName,
        role: tokenRole,
      },
      maxAge,
    );

    const response = NextResponse.json({ 
      ok: true, 
      role,
      email: user.email,
      name: user.fullName,
      expiresIn: maxAge,
      expiresAt,
      token,
    });

    // Cookie security: httpOnly prevents JS access and secure/sameSite reduce token theft risk.
    response.cookies.set({
      name: AUTH_TOKEN_COOKIE,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge,
    });

    return response;
  } catch (error) {
    return handleError(error);
  }
}
