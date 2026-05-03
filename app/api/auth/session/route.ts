import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_AUTH_COOKIE } from "@/lib/adminAuth";
import { AUTH_EMAIL_COOKIE, AUTH_ROLE_COOKIE, normalizeAuthRole } from "@/lib/auth";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const runtime = "nodejs";

function readUserName(email: string | null) {
  if (!email) {
    return null;
  }

  try {
    const usersPath = join(process.cwd(), "data", "users.json");
    const contents = readFileSync(usersPath, "utf-8");
    const parsed = JSON.parse(contents) as { users: Array<{ email?: string; name?: string; createdAt?: string }> };
    const users = Array.isArray(parsed.users) ? parsed.users : [];
    const user = users.find((entry) => entry.email?.toLowerCase() === email.toLowerCase());
    return user ? { name: user.name ?? null, createdAt: user.createdAt ?? null } : null;
  } catch {
    return null;
  }
}

export async function GET() {
  const cookieStore = await cookies();
  const rawRole = cookieStore.get(AUTH_ROLE_COOKIE)?.value ?? null;
  const adminCookie = cookieStore.get(ADMIN_AUTH_COOKIE)?.value === "1";
  const role = normalizeAuthRole(rawRole) ?? (adminCookie ? "admin" : null);

  if (!role) {
    return NextResponse.json({ authenticated: false, role: null });
  }

  return NextResponse.json({
    authenticated: true,
    role,
    email: cookieStore.get(AUTH_EMAIL_COOKIE)?.value ?? null,
    user: readUserName(cookieStore.get(AUTH_EMAIL_COOKIE)?.value ?? null),
  });
}
