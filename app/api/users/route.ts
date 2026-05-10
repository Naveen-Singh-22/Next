import { NextResponse } from "next/server";
import { listUsers, updateUserRole, updateUserStatus } from "@/lib/usersStore";
import type { UserRole } from "@/lib/usersStore";
import { requireAdmin } from "@/lib/authContext";
import { handleError, NotFoundError, ValidationError } from "@/lib/apiErrors";

type UpdateUserBody = {
  role?: UserRole;
  isActive?: boolean;
};

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    // Check admin authorization
    await requireAdmin();

    const users = await listUsers();
    return NextResponse.json({ ok: true, users });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    // Check admin authorization
    await requireAdmin();

    const url = new URL(request.url);
    const userId = url.searchParams.get("id");

    if (!userId) {
      throw new ValidationError("User ID is required", { id: "Missing user ID" });
    }

    const body = (await request.json()) as UpdateUserBody;

    let user = null;

    if (body.role !== undefined) {
      user = await updateUserRole(userId, body.role);
    }

    if (body.isActive !== undefined) {
      user = await updateUserStatus(userId, body.isActive);
    }

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return NextResponse.json({ ok: true, user });
  } catch (error) {
    return handleError(error);
  }
}
