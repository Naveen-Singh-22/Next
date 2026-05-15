import { NextResponse } from "next/server";
import {
  AUTH_EMAIL_COOKIE,
  AUTH_ROLE_COOKIE,
  AUTH_SESSION_MAX_AGE,
  AUTH_TOKEN_COOKIE,
  comparePassword,
  generateToken,
  hashPassword,
  normalizeAuthRole,
  type AuthRole,
} from "@/lib/auth";
import { LoginSchema } from "@/lib/validation";
import { handleError, AuthenticationError } from "@/lib/apiErrors";
import { prisma } from "@/lib/prisma";

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
    const { email, password, rememberMe } = LoginSchema.parse(body);
    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    
    if (!user) {
      throw new AuthenticationError("Invalid email or password.");
    }

    const isPasswordValid = await comparePassword(password, user.password);
    
    if (!isPasswordValid) {
      throw new AuthenticationError("Invalid email or password.");
    }

    const role = normalizeAuthRole(user.role) as AuthRole | null;

    if (!role || role !== "admin") {
      throw new AuthenticationError("Unauthorized role for admin access.");
    }

    const maxAge = rememberMe ? AUTH_SESSION_MAX_AGE * 7 : AUTH_SESSION_MAX_AGE;
    const token = generateToken(
      {
        userId: user.id,
        email: user.email,
        fullName: user.fullName,
        role,
      },
      maxAge,
    );

    const response = NextResponse.json({ 
      ok: true, 
      role,
      email: user.email,
      name: user.fullName,
      expiresIn: maxAge,
    });

    // Cookie security: httpOnly prevents JS access and secure/sameSite reduce token theft risk.
    response.cookies.set({
      name: AUTH_TOKEN_COOKIE,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge,
    });

    response.cookies.set({
      name: AUTH_ROLE_COOKIE,
      value: role,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge,
    });

    response.cookies.set({
      name: AUTH_EMAIL_COOKIE,
      value: user.email,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge,
    });

    return response;
  } catch (error) {
    return handleError(error);
  }
}
