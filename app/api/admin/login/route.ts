import { NextResponse } from "next/server";
import { ADMIN_AUTH_COOKIE, ADMIN_SESSION_MAX_AGE, isValidAdminCredentials } from "@/lib/adminAuth";
import { AUTH_EMAIL_COOKIE, AUTH_ROLE_COOKIE } from "@/lib/auth";
import { AdminLoginSchema } from "@/lib/validation";
import { handleError, AuthenticationError } from "@/lib/apiErrors";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = AdminLoginSchema.parse(body);

    if (!isValidAdminCredentials(email, password)) {
      throw new AuthenticationError("Invalid email or password.");
    }

    const response = NextResponse.json({ ok: true, message: "Admin login successful" });

    response.cookies.set({
      name: ADMIN_AUTH_COOKIE,
      value: "1",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ADMIN_SESSION_MAX_AGE,
    });

    response.cookies.set({
      name: AUTH_ROLE_COOKIE,
      value: "admin",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ADMIN_SESSION_MAX_AGE,
    });

    response.cookies.set({
      name: AUTH_EMAIL_COOKIE,
      value: email.trim(),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ADMIN_SESSION_MAX_AGE,
    });

    return response;
  } catch (error) {
    return handleError(error);
  }
}
