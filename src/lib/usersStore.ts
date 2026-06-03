import { prisma } from "./prisma";
import { hashPassword } from "./auth";

export type UserRole = "admin" | "staff" | "donor" | "volunteer" | "adopter";

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string | null;
  role?: UserRole;
  createdAt: string;
  lastLogin?: string | null;
  isActive?: boolean;
  emailVerified?: boolean;
  emailVerifiedAt?: string | null;
}

type AdminUserRow = {
  id: number;
  fullName?: string | null;
  email: string;
  password?: string | null;
  role?: string | null;
  createdAt?: Date | string | null;
  emailVerified?: boolean | null;
  emailVerifiedAt?: Date | string | null;
};

type LegacyUserRow = {
  id: string;
  name?: string | null;
  fullName?: string | null;
  email: string;
  createdAt?: Date | string | null;
};

function adminRowToUser(row: AdminUserRow): User {
  return {
    id: String(row.id),
    name: row.fullName ?? "",
    email: row.email,
    password: row.password ?? null,
    role: (row.role as UserRole) ?? "admin",
    createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : new Date().toISOString(),
    lastLogin: null,
    isActive: true,
    emailVerified: row.emailVerified ?? false,
    emailVerifiedAt: row.emailVerifiedAt ? new Date(row.emailVerifiedAt).toISOString() : null,
  };
}

function legacyRowToUser(row: LegacyUserRow): User {
  return {
    id: String(row.id),
    name: row.name ?? row.fullName ?? "",
    email: row.email,
    password: null,
    role: undefined,
    createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : new Date().toISOString(),
    lastLogin: null,
    isActive: true,
  };
}

export async function listUsers() {
  // Return admin users (AdminUser table) first, then legacy users
  const admins = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  const legacy = await prisma.legacyUser.findMany({ orderBy: { createdAt: "desc" } });

  const mapped = [...admins.map(adminRowToUser), ...legacy.map(legacyRowToUser)];
  return mapped;
}

export async function findUserById(id: string) {
  // Try admin (numeric id) first
  const asInt = Number(id);

  if (Number.isInteger(asInt) && asInt > 0) {
    const admin = await prisma.user.findUnique({ where: { id: asInt } });
    if (admin) return adminRowToUser(admin);
  }

  // Fallback to legacy (cuid string id)
  const legacy = await prisma.legacyUser.findUnique({ where: { id } });
  return legacy ? legacyRowToUser(legacy) : null;
}

export async function findUserByEmail(email: string) {
  if (!email) return null;
  const admin = await prisma.user.findUnique({ where: { email } });
  if (admin) return adminRowToUser(admin);

  const legacy = await prisma.legacyUser.findUnique({ where: { email } });
  return legacy ? legacyRowToUser(legacy) : null;
}

export async function createUser(input: Omit<User, "createdAt" | "lastLogin" | "isActive" | "id">) {
  // If a password is provided, create an AdminUser (prisma.user)
  if (input.password) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw new Error(`User with email ${input.email} already exists`);

    const hashed = await hashPassword(input.password);

    const created = await prisma.user.create({
      data: {
        email: input.email,
        password: hashed,
        fullName: input.name || input.email,
        role: (input.role as string) || "donor",
        // Preserve email verification state when provided (set by verification flow)
        emailVerified: input.emailVerified ?? false,
        emailVerifiedAt: input.emailVerifiedAt ? new Date(input.emailVerifiedAt) : undefined,
      },
    });

    return adminRowToUser(created);
  }

  // Otherwise create a LegacyUser (backfill of public users)
  const existingLegacy = await prisma.legacyUser.findUnique({ where: { email: input.email } });
  if (existingLegacy) throw new Error(`User with email ${input.email} already exists`);

  const createdLegacy = await prisma.legacyUser.create({ data: { email: input.email, name: input.name } });
  return legacyRowToUser(createdLegacy);
}

export async function updateUser(id: string, updates: Partial<Omit<User, "id" | "createdAt">>) {
  const asInt = Number(id);

  if (Number.isInteger(asInt) && asInt > 0) {
    const data: Record<string, unknown> = {};
    if (updates.name) data.fullName = updates.name;
    if (updates.email) data.email = updates.email;
    if (updates.role) data.role = updates.role;
    if (typeof updates.isActive === "boolean") data.isActive = updates.isActive;
    if (updates.password) data.password = await hashPassword(updates.password as string);

    const updated = await prisma.user.update({ where: { id: asInt }, data });
    return adminRowToUser(updated);
  }

  const legacyData: Record<string, unknown> = {};
  if (updates.name) legacyData.name = updates.name;
  if (updates.email) legacyData.email = updates.email;

  const updatedLegacy = await prisma.legacyUser.update({ where: { id }, data: legacyData });
  return legacyRowToUser(updatedLegacy);
}

export async function updateUserRole(id: string, role: UserRole) {
  return updateUser(id, { role });
}

export async function updateUserStatus(id: string, _isActive: boolean) {
  // AdminUser has no explicit isActive column in schema; noop for admin
  void _isActive;
  return updateUser(id, {} as Record<string, unknown>);
}

export async function deleteUser(id: string) {
  const asInt = Number(id);

  try {
    if (Number.isInteger(asInt) && asInt > 0) {
      await prisma.user.delete({ where: { id: asInt } });
      return true;
    }

    await prisma.legacyUser.delete({ where: { id } });
    return true;
  } catch {
    return null;
  }
}
