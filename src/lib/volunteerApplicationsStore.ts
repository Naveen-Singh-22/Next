import { mkdir } from "node:fs/promises";
import path from "node:path";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

export type StoredVolunteerApplication = {
  id: number;
  applicationId: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  interestArea: string;
  availability: string;
  status: "pending" | "reviewing" | "approved" | "declined";
  createdAt: string;
};

type VolunteerDb = {
  applications: StoredVolunteerApplication[];
  nextId: number;
};

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "volunteer-applications.json");

let dbPromise: Promise<Low<VolunteerDb>> | null = null;

function createApplicationId() {
  return `VL-${Math.floor(Date.now() / 1000).toString(36).toUpperCase()}`;
}

async function getDb() {
  if (!dbPromise) {
    dbPromise = (async () => {
      await mkdir(DATA_DIR, { recursive: true });

      const adapter = new JSONFile<VolunteerDb>(DB_PATH);
      const db = new Low<VolunteerDb>(adapter, {
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

export async function listVolunteerApplications() {
  const db = await getDb();
  await db.read();

  return [...db.data.applications].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export async function createVolunteerApplication(
  input: Omit<StoredVolunteerApplication, "id" | "applicationId" | "createdAt">,
) {
  const db = await getDb();
  await db.read();

  const application: StoredVolunteerApplication = {
    ...input,
    id: db.data.nextId++,
    applicationId: createApplicationId(),
    createdAt: new Date().toISOString(),
  };

  db.data.applications.unshift(application);
  await db.write();

  return application;
}