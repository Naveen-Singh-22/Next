import { NextRequest, NextResponse } from "next/server";
import { AUTH_EMAIL_COOKIE, AUTH_ROLE_COOKIE, AUTH_SESSION_MAX_AGE } from "@/lib/auth";
import { SignupSchema } from "@/lib/validation";
import { hashPassword } from "@/lib/password";
import { handleError, ConflictError } from "@/lib/apiErrors";
import { findUserByEmail, listUsers } from "@/lib/usersStore";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";
import { mkdir } from "fs/promises";

interface UsersStore {
  users: Array<{
    id: string;
    name: string;
    email: string;
    password: string;
    role: string;
    createdAt: string;
    isActive: boolean;
  }>;
}

export const runtime = "nodejs";

async function getDb() {
  const dataDir = path.join(process.cwd(), "data");
  const dbPath = path.join(dataDir, "users.json");
  
  await mkdir(dataDir, { recursive: true });
  
  const adapter = new JSONFile<UsersStore>(dbPath);
  const db = new Low<UsersStore>(adapter, { users: [] });
  await db.read();
  
  return db;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = SignupSchema.parse(body);

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      throw new ConflictError("Email already registered");
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const db = await getDb();
    const newUser = {
      id: `user_${Date.now()}`,
      name,
      email,
      password: hashedPassword,
      role: "donor" as const,
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    db.data.users.push(newUser);
    await db.write();

    // Set cookies and return
    const response = NextResponse.json({
      ok: true,
      message: "Account created successfully",
      role: newUser.role,
      email: newUser.email,
      name: newUser.name,
    });

    response.cookies.set({
      name: AUTH_ROLE_COOKIE,
      value: newUser.role,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: AUTH_SESSION_MAX_AGE,
    });

    response.cookies.set({
      name: AUTH_EMAIL_COOKIE,
      value: newUser.email,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: AUTH_SESSION_MAX_AGE,
    });

    return response;
  } catch (error) {
    return handleError(error);
  }
}
