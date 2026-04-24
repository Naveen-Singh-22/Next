import { mkdir } from "node:fs/promises";
import path from "node:path";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

export type StoredRescueReport = {
  reportId: string;
  fullName: string;
  email: string;
  phone: string;
  species: string;
  breed: string;
  healthConditions: string[];
  notes: string;
  lastSeenAddress: string;
  urgency: "critical" | "urgent" | "standard";
  location: {
    latitude: number;
    longitude: number;
  };
  createdAt: string;
};

type RescueDbSchema = {
  rescueReports: StoredRescueReport[];
};

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "rescue-reports.json");

let dbPromise: Promise<Low<RescueDbSchema>> | null = null;

async function getDb() {
  if (!dbPromise) {
    dbPromise = (async () => {
      await mkdir(DATA_DIR, { recursive: true });

      const adapter = new JSONFile<RescueDbSchema>(DB_PATH);
      const db = new Low<RescueDbSchema>(adapter, { rescueReports: [] });

      await db.read();
      db.data ||= { rescueReports: [] };

      return db;
    })();
  }

  return dbPromise;
}

export async function saveRescueReport(report: StoredRescueReport) {
  const db = await getDb();

  db.data.rescueReports.unshift(report);
  await db.write();

  return report;
}

export async function listRescueReports() {
  const db = await getDb();
  await db.read();

  return db.data.rescueReports;
}
