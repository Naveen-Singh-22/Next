import { writeFileSync, readFileSync } from "fs";
import { join } from "path";
import { NextRequest, NextResponse } from "next/server";
import { AUTH_EMAIL_COOKIE, AUTH_ROLE_COOKIE, AUTH_SESSION_MAX_AGE } from "@/lib/auth";

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  createdAt: string;
}

const DATA_DIR = join(process.cwd(), "data");
const USERS_FILE = join(DATA_DIR, "users.json");

function getUsersData(): User[] {
  try {
    const data = readFileSync(USERS_FILE, "utf-8");
    const parsed = JSON.parse(data) as { users: User[] };
    return Array.isArray(parsed.users) ? parsed.users : [];
  } catch {
    return [];
  }
}

function saveUsersData(users: User[]) {
  writeFileSync(USERS_FILE, JSON.stringify({ users }, null, 2));
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { ok: false, message: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { ok: false, message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const users = getUsersData();
    const existingUser = users.find((u) => u.email === email);

    if (existingUser) {
      return NextResponse.json(
        { ok: false, message: "Email already registered" },
        { status: 409 }
      );
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      name,
      email,
      password, // In production, hash this!
      role: "donor",
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsersData(users);

    const response = NextResponse.json({
      ok: true,
      message: "Account created successfully",
      role: newUser.role,
      email: newUser.email,
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
    console.error("Signup error:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
