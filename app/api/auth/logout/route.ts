import { NextResponse } from "next/server";
import { AUTH_EMAIL_COOKIE, AUTH_ROLE_COOKIE } from "@/lib/auth";
import { ADMIN_AUTH_COOKIE } from "@/lib/adminAuth";

export function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/login", request.url));

  response.cookies.set({
    name: AUTH_EMAIL_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  response.cookies.set({
    name: AUTH_ROLE_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  response.cookies.set({
    name: ADMIN_AUTH_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}