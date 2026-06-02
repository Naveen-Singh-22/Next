import { NextResponse } from "next/server";
import { AUTH_TOKEN_COOKIE } from "@/lib/auth";

function clearAuthCookies(response: NextResponse) {
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

export function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  clearAuthCookies(response);
  return response;
}

export function POST() {
  const response = NextResponse.json({ ok: true, message: "Logged out" });
  clearAuthCookies(response);
  return response;
}