import { NextResponse } from "next/server";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import type { StoredVolunteerApplication } from "@/lib/volunteerApplicationsStore";

type VolunteerDb = {
  applications: StoredVolunteerApplication[];
  nextId: number;
};

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "volunteer-applications.json");

let dbPromise: Promise<Low<VolunteerDb>> | null = null;

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

      return db;
    })();
  }

  return dbPromise;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: applicationId } = await params;

  let body: { status?: string };

  try {
    body = (await request.json()) as { status?: string };
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid request payload." },
      { status: 400 },
    );
  }

  const { status } = body;

  if (!status || !["pending", "reviewing", "approved", "declined"].includes(status)) {
    return NextResponse.json(
      { ok: false, message: "Invalid status." },
      { status: 400 },
    );
  }

  try {
    const db = await getDb();
    await db.read();

    const application = db.data.applications.find(
      (app) => app.applicationId === applicationId,
    );

    if (!application) {
      return NextResponse.json(
        { ok: false, message: "Application not found." },
        { status: 404 },
      );
    }

    application.status = status as StoredVolunteerApplication["status"];
    await db.write();

    return NextResponse.json({
      ok: true,
      message: "Application status updated successfully.",
      application,
    });
  } catch (error) {
    console.error("Failed to update application status:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to update application status." },
      { status: 500 },
    );
  }
}
