import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authContext";
import { hashPassword } from "@/lib/auth";
import { AdminCreateUserSchema } from "@/lib/validation";
import { handleError, ConflictError, NotFoundError, ValidationError } from "@/lib/apiErrors";

type AdminRole = "admin" | "staff";

type UpdateUserBody = {
  role?: AdminRole;
  password?: string;
};

export const runtime = "nodejs";

function toRole(value: string): AdminRole {
  return value === "staff" ? "staff" : "admin";
}

function serializeUser(user: {
  id: number;
  fullName: string;
  email: string;
  role: string;
  createdAt: Date;
}) {
  return {
    id: String(user.id),
    name: user.fullName,
    email: user.email,
    role: toRole(user.role),
    createdAt: user.createdAt.toISOString(),
    isActive: true,
  };
}

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ ok: true, users: users.map(serializeUser) });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { fullName, email, password, role } = AdminCreateUserSchema.parse(body);
    const normalizedEmail = email.trim().toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      throw new ConflictError("A user with this email already exists.");
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        fullName,
        email: normalizedEmail,
        password: passwordHash,
        role,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ ok: true, user: serializeUser(user) }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin();

    const url = new URL(request.url);
    const userId = url.searchParams.get("id");

    if (!userId) {
      throw new ValidationError("User ID is required", { id: "Missing user ID" });
    }

    const body = (await request.json()) as UpdateUserBody;
    const parsedUserId = Number(userId);
    if (!Number.isInteger(parsedUserId) || parsedUserId <= 0) {
      throw new ValidationError("User ID must be a positive integer.");
    }

    const data: { role?: AdminRole; password?: string } = {};
    if (body.role !== undefined) {
      data.role = body.role;
    }

    if (body.password !== undefined) {
      if (body.password.length < 8) {
        throw new ValidationError("Password must be at least 8 characters long.");
      }
      data.password = await hashPassword(body.password);
    }

    if (!data.role && !data.password) {
      throw new ValidationError("No valid fields provided for update.");
    }

    const user = await prisma.user.update({
      where: { id: parsedUserId },
      data,
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    }).catch((error: { code?: string }) => {
      if (error.code === "P2025") {
        return null;
      }
      throw error;
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return NextResponse.json({ ok: true, user: serializeUser(user) });
  } catch (error) {
    return handleError(error);
  }
}
