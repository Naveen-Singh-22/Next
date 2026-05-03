import { NextResponse } from "next/server";
import {
  ADMIN_AUTH_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  isValidAdminCredentials,
} from "@/lib/adminAuth";
import { AUTH_EMAIL_COOKIE, AUTH_ROLE_COOKIE } from "@/lib/auth";

type LoginRequestBody = {
  email?: string;
  password?: string;
  rememberMe?: boolean;
};

export async function POST(request: Request) {
  let body: LoginRequestBody;

  try {
    body = (await request.json()) as LoginRequestBody;
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request payload." }, { status: 400 });
  }

  const email = body.email ?? "";
  const password = body.password ?? "";
  const rememberMe = Boolean(body.rememberMe);

  if (!isValidAdminCredentials(email, password)) {
    return NextResponse.json({ ok: false, message: "Invalid email or password." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });

  response.cookies.set({
    name: ADMIN_AUTH_COOKIE,
    value: "1",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: rememberMe ? ADMIN_SESSION_MAX_AGE * 7 : ADMIN_SESSION_MAX_AGE,
  });

  response.cookies.set({
    name: AUTH_ROLE_COOKIE,
    value: "admin",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: rememberMe ? ADMIN_SESSION_MAX_AGE * 7 : ADMIN_SESSION_MAX_AGE,
  });

  response.cookies.set({
    name: AUTH_EMAIL_COOKIE,
    value: email.trim(),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: rememberMe ? ADMIN_SESSION_MAX_AGE * 7 : ADMIN_SESSION_MAX_AGE,
  });

  return response;
}
