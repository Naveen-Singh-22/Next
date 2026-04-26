import type { AdoptionApplication, AdoptionStatus } from "@/lib/adoptionApplicationTypes";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

type AdoptionStore = {
  applications: AdoptionApplication[];
  nextId: number;
};

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "adoptions.json");

let dbPromise: Promise<Low<AdoptionStore>> | null = null;

async function getDb() {
  if (!dbPromise) {
    dbPromise = (async () => {
      await mkdir(DATA_DIR, { recursive: true });

      const adapter = new JSONFile<AdoptionStore>(DB_PATH);
      const db = new Low<AdoptionStore>(adapter, {
        applications: [],
        nextId: 1,
      });

      await db.read();
      db.data ||= {
        applications: [],
        nextId: 1,
      };

      db.data.nextId = Math.max(
        db.data.nextId,
        db.data.applications.reduce((maxId, application) => Math.max(maxId, application.id), 0) + 1,
      );

      return db;
    })();
  }

  return dbPromise;
}

export async function listAdoptions() {
  const db = await getDb();
  await db.read();

  return [...db.data.applications].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export async function findAdoptionById(id: number) {
  const db = await getDb();
  await db.read();

  return db.data.applications.find((application) => application.id === id) ?? null;
}

export async function createAdoption(input: Omit<AdoptionApplication, "id" | "createdAt" | "timeline" | "status">) {
  const db = await getDb();
  await db.read();

  const nowIso = new Date().toISOString();

  const application: AdoptionApplication = {
    ...input,
    id: db.data.nextId++,
    createdAt: nowIso,
    status: "applied",
    timeline: [
      {
        type: "Application submitted",
        time: nowIso,
      },
    ],
  };

  db.data.applications.unshift(application);
  await db.write();

  return application;
}

export async function updateAdoption(id: number, updates: Partial<Omit<AdoptionApplication, "id" | "createdAt">>) {
  const db = await getDb();
  await db.read();

  const index = db.data.applications.findIndex((application) => application.id === id);

  if (index < 0) {
    return null;
  }

  const existing = db.data.applications[index];
  const next: AdoptionApplication = {
    ...existing,
    ...updates,
    id: existing.id,
    createdAt: existing.createdAt,
    timeline: Array.isArray(updates.timeline) ? updates.timeline : existing.timeline,
  };

  db.data.applications[index] = next;
  await db.write();

  return next;
}

function statusEventLabel(status: AdoptionStatus) {
  switch (status) {
    case "shortlisted":
      return "Application shortlisted";
    case "home_visit":
      return "Home visit scheduled";
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    case "adopted":
      return "Adopted";
    default:
      return "Status updated";
  }
}

export async function updateAdoptionStatus(id: number, status: AdoptionStatus) {
  const db = await getDb();
  await db.read();

  const index = db.data.applications.findIndex((application) => application.id === id);

  if (index < 0) {
    return null;
  }

  const existing = db.data.applications[index];
  const next: AdoptionApplication = {
    ...existing,
    status,
    timeline: [
      ...existing.timeline,
      {
        type: statusEventLabel(status),
        time: new Date().toISOString(),
      },
    ],
  };

  db.data.applications[index] = next;
  await db.write();

  return next;
}
