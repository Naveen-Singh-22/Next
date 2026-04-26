import { mkdir } from "node:fs/promises";
import path from "node:path";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

export type InquiryType = "rescue" | "adoption" | "donation" | "general";
export type InquiryStatus = "new" | "assigned" | "resolved";

export type StoredInquiry = {
  id: number;
  type: InquiryType;
  referenceId: number;
  title: string;
  preview: string;
  status: InquiryStatus;
  createdAt: string;
  updatedAt?: string;
};

type InquiryDb = {
  inquiries: StoredInquiry[];
  nextId: number;
};

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "inquiries.json");

let dbPromise: Promise<Low<InquiryDb>> | null = null;

function nextAvailableId(usedIds: Set<number>) {
  let value = 1;

  while (usedIds.has(value)) {
    value += 1;
  }

  usedIds.add(value);
  return value;
}

async function getDb() {
  if (!dbPromise) {
    dbPromise = (async () => {
      await mkdir(DATA_DIR, { recursive: true });

      const adapter = new JSONFile<InquiryDb>(DB_PATH);
      const db = new Low<InquiryDb>(adapter, {
        inquiries: [],
        nextId: 1,
      });

      await db.read();
      db.data ||= {
        inquiries: [],
        nextId: 1,
      };

      db.data.nextId = Math.max(
        db.data.nextId,
        db.data.inquiries.reduce((maxId, inquiry) => Math.max(maxId, inquiry.id), 0) + 1,
      );

      const usedIds = new Set(db.data.inquiries.map((inquiry) => inquiry.id));
      let shouldWrite = false;

      db.data.inquiries = db.data.inquiries.map((inquiry) => {
        if (inquiry.id) {
          return inquiry;
        }

        shouldWrite = true;

        return {
          ...inquiry,
          id: nextAvailableId(usedIds),
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

export async function listInquiries() {
  const db = await getDb();
  await db.read();

  return [...db.data.inquiries].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export async function getInquiryById(id: number) {
  const db = await getDb();
  await db.read();

  return db.data.inquiries.find((inquiry) => inquiry.id === id) ?? null;
}

export async function createInquiry(
  input: Omit<StoredInquiry, "id" | "status" | "createdAt" | "updatedAt"> & {
    status?: InquiryStatus;
  },
) {
  const db = await getDb();
  await db.read();

  const inquiry: StoredInquiry = {
    ...input,
    id: db.data.nextId++,
    status: input.status ?? "new",
    createdAt: new Date().toISOString(),
  };

  db.data.inquiries.unshift(inquiry);
  await db.write();

  return inquiry;
}

export async function updateInquiryStatus(id: number, status: InquiryStatus) {
  const db = await getDb();
  await db.read();

  const index = db.data.inquiries.findIndex((inquiry) => inquiry.id === id);

  if (index < 0) {
    return null;
  }

  const next: StoredInquiry = {
    ...db.data.inquiries[index],
    status,
    updatedAt: new Date().toISOString(),
  };

  db.data.inquiries[index] = next;
  await db.write();

  return next;
}