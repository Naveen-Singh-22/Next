import { mkdir } from "node:fs/promises";
import path from "node:path";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

export type StoredDonation = {
  id: number;
  donationId: string;
  donorName: string;
  email: string;
  phone: string;
  amount: number;
  coverFees: boolean;
  createdAt: string;
};

type DonationDb = {
  donations: StoredDonation[];
  nextId: number;
};

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "donations.json");

let dbPromise: Promise<Low<DonationDb>> | null = null;

function createDonationId() {
  return `DN-${Math.floor(Date.now() / 1000).toString(36).toUpperCase()}`;
}

async function getDb() {
  if (!dbPromise) {
    dbPromise = (async () => {
      await mkdir(DATA_DIR, { recursive: true });

      const adapter = new JSONFile<DonationDb>(DB_PATH);
      const db = new Low<DonationDb>(adapter, {
        donations: [],
        nextId: 1,
      });

      await db.read();
      db.data ||= {
        donations: [],
        nextId: 1,
      };

      db.data.nextId = Math.max(
        db.data.nextId,
        db.data.donations.reduce((maxId, donation) => Math.max(maxId, donation.id), 0) + 1,
      );

      return db;
    })();
  }

  return dbPromise;
}

export async function listDonations() {
  const db = await getDb();
  await db.read();

  return [...db.data.donations].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export async function createDonation(input: Omit<StoredDonation, "id" | "donationId" | "createdAt">) {
  const db = await getDb();
  await db.read();

  const donation: StoredDonation = {
    ...input,
    id: db.data.nextId++,
    donationId: createDonationId(),
    createdAt: new Date().toISOString(),
  };

  db.data.donations.unshift(donation);
  await db.write();

  return donation;
}