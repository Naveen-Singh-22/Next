import { NextResponse } from "next/server";
import { AUTH_EMAIL_COOKIE, AUTH_ROLE_COOKIE, AUTH_SESSION_MAX_AGE } from "@/lib/auth";
import { LoginSchema } from "@/lib/validation";
import { handleError, AuthenticationError } from "@/lib/apiErrors";
import { verifyPassword } from "@/lib/password";
import { findUserByEmail } from "@/lib/usersStore";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, rememberMe } = LoginSchema.parse(body);

    // Find user by email
    const user = await findUserByEmail(email);
    
    if (!user) {
      throw new AuthenticationError("Invalid email or password.");
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    
    if (!isPasswordValid) {
      throw new AuthenticationError("Invalid email or password.");
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AuthenticationError("This account has been deactivated. Please contact support.");
    }

    const response = NextResponse.json({ 
      ok: true, 
      role: user.role,
      email: user.email,
      name: user.name,
    });

    response.cookies.set({
      name: AUTH_ROLE_COOKIE,
      value: user.role,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: rememberMe ? AUTH_SESSION_MAX_AGE * 7 : AUTH_SESSION_MAX_AGE,
    });

    response.cookies.set({
      name: AUTH_EMAIL_COOKIE,
      value: user.email,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: rememberMe ? AUTH_SESSION_MAX_AGE * 7 : AUTH_SESSION_MAX_AGE,
    });

    return response;
  } catch (error) {
    return handleError(error);
  }
}
