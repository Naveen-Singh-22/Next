import { mkdir } from "node:fs/promises";
import path from "node:path";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

export type StoredAdoptionRequest = {
  requestId: string;
  animalSlug: string;
  animalName: string;
  animalSpecies: string;
  animalImage: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  city: string;
  homeType: "apartment" | "house" | "farm" | "other";
  message: string;
  status: "pending" | "shortlisted" | "homevisit" | "final" | "adopted";
  createdAt: string;
};

type AdoptionDbSchema = {
  adoptionRequests: StoredAdoptionRequest[];
};

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "adoption-requests.json");

let dbPromise: Promise<Low<AdoptionDbSchema>> | null = null;

async function getDb() {
  if (!dbPromise) {
    dbPromise = (async () => {
      await mkdir(DATA_DIR, { recursive: true });

      const adapter = new JSONFile<AdoptionDbSchema>(DB_PATH);
      const db = new Low<AdoptionDbSchema>(adapter, { adoptionRequests: [] });

      await db.read();
      db.data ||= { adoptionRequests: [] };

      return db;
    })();
  }

  return dbPromise;
}

export async function saveAdoptionRequest(request: StoredAdoptionRequest) {
  const db = await getDb();

  db.data.adoptionRequests.unshift(request);
  await db.write();

  return request;
}

export async function listAdoptionRequests() {
  const db = await getDb();
  await db.read();

  return db.data.adoptionRequests;
}
