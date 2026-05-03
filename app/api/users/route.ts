import { NextResponse } from "next/server";
import { listUsers, updateUserRole, updateUserStatus } from "@/lib/usersStore";
import type { UserRole } from "@/lib/usersStore";

type UpdateUserBody = {
  role?: UserRole;
  isActive?: boolean;
};

export const runtime = "nodejs";

export async function GET() {
  const users = await listUsers();
  return NextResponse.json({ users });
}

export async function PATCH(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("id");

  if (!userId) {
    return NextResponse.json({ message: "User ID is required" }, { status: 400 });
  }

  let body: UpdateUserBody;

  try {
    body = (await request.json()) as UpdateUserBody;
  } catch {
    return NextResponse.json({ message: "Invalid JSON payload" }, { status: 400 });
  }

  try {
    let user = null;

    if (body.role !== undefined) {
      user = await updateUserRole(userId, body.role);
    }

    if (body.isActive !== undefined) {
      user = await updateUserStatus(userId, body.isActive);
    }

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Failed to update user" }, { status: 500 });
  }
}
