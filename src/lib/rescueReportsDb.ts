import { mkdir } from "node:fs/promises";
import path from "node:path";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

export type RescueCaseStatus = "reported" | "in_progress" | "monitored" | "rescued" | "closed";

export type RescueAdminChecklist = {
  rescued: boolean;
  monitored: boolean;
  medicalCompleted: boolean;
  shelterAssigned: boolean;
  reporterNotified: boolean;
};

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
  animalImageDataUrl?: string;
  caseStatus: RescueCaseStatus;
  adminChecklist: RescueAdminChecklist;
  lastAdminUpdateAt?: string;
  reporterNotifiedAt?: string;
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
  await db.read();

  db.data.rescueReports.unshift(report);
  await db.write();

  return report;
}

export async function listRescueReports() {
  const db = await getDb();
  await db.read();

  return db.data.rescueReports.map((report) => ({
    ...report,
    caseStatus: report.caseStatus ?? "reported",
    adminChecklist: {
      rescued: report.adminChecklist?.rescued ?? false,
      monitored: report.adminChecklist?.monitored ?? false,
      medicalCompleted: report.adminChecklist?.medicalCompleted ?? false,
      shelterAssigned: report.adminChecklist?.shelterAssigned ?? false,
      reporterNotified: report.adminChecklist?.reporterNotified ?? false,
    },
  }));
}

export async function updateRescueReportAdmin(
  reportId: string,
  updates: {
    caseStatus: RescueCaseStatus;
    adminChecklist: RescueAdminChecklist;
  },
) {
  const db = await getDb();
  await db.read();

  const index = db.data.rescueReports.findIndex((report) => report.reportId === reportId);

  if (index < 0) {
    return null;
  }

  const existing = db.data.rescueReports[index];
  const next: StoredRescueReport = {
    ...existing,
    caseStatus: updates.caseStatus,
    adminChecklist: updates.adminChecklist,
    lastAdminUpdateAt: new Date().toISOString(),
  };

  db.data.rescueReports[index] = next;
  await db.write();

  return { previous: existing, updated: next };
}
