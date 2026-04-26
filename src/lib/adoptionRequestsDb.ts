import { mkdir } from "node:fs/promises";
import path from "node:path";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

export type StoredAdoptionRequest = {
  id: number;
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
  nextId: number;
};

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "adoption-requests.json");

let dbPromise: Promise<Low<AdoptionDbSchema>> | null = null;

async function getDb() {
  if (!dbPromise) {
    dbPromise = (async () => {
      await mkdir(DATA_DIR, { recursive: true });

      const adapter = new JSONFile<AdoptionDbSchema>(DB_PATH);
      const db = new Low<AdoptionDbSchema>(adapter, { adoptionRequests: [], nextId: 1 });

      await db.read();
      db.data ||= { adoptionRequests: [], nextId: 1 };

      db.data.nextId = Math.max(
        db.data.nextId,
        db.data.adoptionRequests.reduce((maxId, request) => Math.max(maxId, request.id ?? 0), 0) + 1,
      );

      let shouldWrite = false;
      const usedIds = new Set(db.data.adoptionRequests.map((request) => request.id).filter(Boolean));

      db.data.adoptionRequests = db.data.adoptionRequests.map((request) => {
        if (request.id) {
          return request;
        }

        let nextId = 1;

        while (usedIds.has(nextId)) {
          nextId += 1;
        }

        usedIds.add(nextId);
        shouldWrite = true;

        return {
          ...request,
          id: nextId,
        };
      });

      if (shouldWrite) {
        await db.write();
      }

      return db;
    })();
  }

  return dbPromise;
}

export async function saveAdoptionRequest(request: Omit<StoredAdoptionRequest, "id">) {
  const db = await getDb();
  await db.read();

  const saved: StoredAdoptionRequest = {
    ...request,
    id: db.data.nextId++,
  };

  db.data.adoptionRequests.unshift(saved);
  await db.write();

  return saved;
}

export async function listAdoptionRequests() {
  const db = await getDb();
  await db.read();

  return db.data.adoptionRequests;
}
