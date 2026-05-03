import { NextResponse } from "next/server";
import { AUTH_EMAIL_COOKIE, AUTH_ROLE_COOKIE, AUTH_SESSION_MAX_AGE, normalizeAuthRole, type AuthRole } from "@/lib/auth";

type LoginRequestBody = {
  email?: string;
  password?: string;
  role?: AuthRole | string;
  rememberMe?: boolean;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: LoginRequestBody;

  try {
    body = (await request.json()) as LoginRequestBody;
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request payload." }, { status: 400 });
  }

  const role = normalizeAuthRole(body.role) ?? "donor";
  const email = body.email?.trim() ?? "";
  const password = body.password?.trim() ?? "";
  const rememberMe = Boolean(body.rememberMe);

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ ok: false, message: "Please enter a valid email address." }, { status: 400 });
  }

  if (password.length < 4) {
    return NextResponse.json({ ok: false, message: "Password must be at least 4 characters long." }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true, role });

  response.cookies.set({
    name: AUTH_ROLE_COOKIE,
    value: role,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: rememberMe ? AUTH_SESSION_MAX_AGE * 7 : AUTH_SESSION_MAX_AGE,
  });

  response.cookies.set({
    name: AUTH_EMAIL_COOKIE,
    value: email,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: rememberMe ? AUTH_SESSION_MAX_AGE * 7 : AUTH_SESSION_MAX_AGE,
  });

  return response;
}
