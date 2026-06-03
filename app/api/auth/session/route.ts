import { NextResponse } from "next/server";
import { AUTH_TOKEN_COOKIE, validateAuthFromRequest } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const authResult = await validateAuthFromRequest(request);
  const user = authResult.user;

  if (!user) {
    const response = NextResponse.json({
      authenticated: false,
      role: null,
      expired: authResult.expired,
      expiresAt: authResult.expiresAt,
      expiresInSeconds: authResult.expiresInSeconds,
    });

    // Expired cookie-backed JWTs are proactively cleared so clients stop sending stale tokens.
    if (authResult.expired && authResult.source === "cookie") {
      response.cookies.set({
        name: AUTH_TOKEN_COOKIE,
        value: "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 0,
      });
    }

    return response;
  }

  return NextResponse.json({
    authenticated: true,
    role: user.role,
    email: user.email,
    user: {
      id: user.userId,
      name: user.fullName,
      email: user.email,
      role: user.role,
    },
    session: {
      expiresAt: authResult.expiresAt,
      expiresInSeconds: authResult.expiresInSeconds,
    },
  });
}
