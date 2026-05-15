import { writeFile, readFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import type { OtpRecord } from "./otp";

interface OtpDatabase {
  otps: OtpRecord[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "otp-records.json");

let dbPromise: Promise<Low<OtpDatabase>> | null = null;

async function getDb(): Promise<Low<OtpDatabase>> {
  if (!dbPromise) {
    dbPromise = (async () => {
      await mkdir(DATA_DIR, { recursive: true });

      const adapter = new JSONFile<OtpDatabase>(DB_PATH);
      const db = new Low<OtpDatabase>(adapter, {
        otps: [],
      });

      await db.read();
      db.data ||= { otps: [] };

      return db;
    })();
  }

  return dbPromise;
}

/**
 * Save OTP record for an email
 * Replaces any existing OTP for the same email
 */
export async function saveOtpRecord(record: OtpRecord): Promise<OtpRecord> {
  const db = await getDb();
  await db.read();

  // Remove any existing OTP for this email
  if (db.data.otps) {
    db.data.otps = db.data.otps.filter((r) => r.email !== record.email);
  } else {
    db.data.otps = [];
  }

  // Add new OTP
  db.data.otps.push(record);
  await db.write();

  return record;
}

/**
 * Get OTP record by email
 */
export async function getOtpRecord(email: string): Promise<OtpRecord | null> {
  const db = await getDb();
  await db.read();

  const record = db.data.otps?.find((r) => r.email === email);
  return record || null;
}

/**
 * Delete OTP record after verification
 */
export async function deleteOtpRecord(email: string): Promise<void> {
  const db = await getDb();
  await db.read();

  if (db.data.otps) {
    db.data.otps = db.data.otps.filter((r) => r.email !== email);
    await db.write();
  }
}

/**
 * Clean up expired OTP records (runs periodically)
 */
export async function cleanupExpiredOtps(): Promise<number> {
  const db = await getDb();
  await db.read();

  if (!db.data.otps) {
    return 0;
  }

  const now = Date.now();
  const initialLength = db.data.otps.length;

  // Remove expired records
  db.data.otps = db.data.otps.filter((r) => r.expiresAt > now);

  if (db.data.otps.length < initialLength) {
    await db.write();
  }

  return initialLength - db.data.otps.length;
}
