import { mkdir } from "node:fs/promises";
import path from "node:path";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

export type UserRole = "admin" | "staff" | "donor" | "volunteer" | "adopter";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

type UsersStore = {
  users: User[];
};

function normalizeUsersData(data: unknown): UsersStore {
  if (Array.isArray(data)) {
    return {
      users: data.filter(Boolean) as User[],
    };
  }

  if (data && typeof data === "object") {
    const record = data as Partial<UsersStore> & Record<string, unknown>;
    return {
      users: Array.isArray(record.users) ? (record.users.filter(Boolean) as User[]) : [],
    };
  }

  return { users: [] };
}

function ensureActiveUserShape(users: User[]) {
  return users.map((user) => {
    if (user.isActive === undefined) {
      return {
        ...user,
        isActive: true,
      };
    }

    return user;
  });
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "users.json");

let dbPromise: Promise<Low<UsersStore>> | null = null;

async function getDb() {
  if (!dbPromise) {
    dbPromise = (async () => {
      await mkdir(DATA_DIR, { recursive: true });

      const adapter = new JSONFile<UsersStore>(DB_PATH);
      const db = new Low<UsersStore>(adapter, {
        users: [],
      });

      await db.read();

      const normalized = normalizeUsersData(db.data);
      const usersWithStatus = ensureActiveUserShape(normalized.users);
      const hasUpdates =
        !db.data ||
        !Array.isArray((db.data as Partial<UsersStore>).users) ||
        JSON.stringify(usersWithStatus) !== JSON.stringify(normalized.users);

      db.data = {
        users: usersWithStatus,
      };

      if (hasUpdates) {
        await db.write();
      }

      return db;
    })();
  }

  return dbPromise;
}

export async function listUsers() {
  const db = await getDb();
  await db.read();

  db.data = normalizeUsersData(db.data);
  db.data.users = ensureActiveUserShape(db.data.users);

  if (!db.data.users.length && Array.isArray(db.data as unknown)) {
    return [];
  }

  return [...db.data.users].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export async function findUserById(id: string) {
  const db = await getDb();
  await db.read();

  db.data = normalizeUsersData(db.data);
  db.data.users = ensureActiveUserShape(db.data.users);

  return db.data.users.find((user) => user.id === id) ?? null;
}

export async function findUserByEmail(email: string) {
  const db = await getDb();
  await db.read();

  db.data = normalizeUsersData(db.data);
  db.data.users = ensureActiveUserShape(db.data.users);

  return db.data.users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function createUser(input: Omit<User, "createdAt" | "lastLogin" | "isActive">) {
  const db = await getDb();
  await db.read();
  db.data = normalizeUsersData(db.data);
  db.data.users = ensureActiveUserShape(db.data.users);

  // Check if user already exists
  const existing = await findUserByEmail(input.email);
  if (existing) {
    throw new Error(`User with email ${input.email} already exists`);
  }

  const user: User = {
    ...input,
    createdAt: new Date().toISOString(),
    isActive: true,
  };

  db.data.users.push(user);
  await db.write();

  return user;
}

export async function updateUser(id: string, updates: Partial<Omit<User, "id" | "createdAt">>) {
  const db = await getDb();
  await db.read();
  db.data = normalizeUsersData(db.data);
  db.data.users = ensureActiveUserShape(db.data.users);

  const index = db.data.users.findIndex((user) => user.id === id);

  if (index < 0) {
    return null;
  }

  const existing = db.data.users[index];
  const next: User = {
    ...existing,
    ...updates,
    id: existing.id,
    createdAt: existing.createdAt,
  };

  db.data.users[index] = next;
  await db.write();

  return next;
}

export async function updateUserRole(id: string, role: UserRole) {
  return updateUser(id, { role });
}

export async function updateUserStatus(id: string, isActive: boolean) {
  return updateUser(id, { isActive });
}

export async function deleteUser(id: string) {
  const db = await getDb();
  await db.read();
  db.data = normalizeUsersData(db.data);
  db.data.users = ensureActiveUserShape(db.data.users);

  const index = db.data.users.findIndex((user) => user.id === id);

  if (index < 0) {
    return null;
  }

  db.data.users.splice(index, 1);
  await db.write();

  return true;
}
