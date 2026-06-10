import { prisma } from "./prisma";

export type RescueCaseStatus = "reported" | "in_progress" | "monitored" | "rescued" | "closed";

export type RescueAdminChecklist = {
  rescued: boolean;
  monitored: boolean;
  medicalCompleted: boolean;
  shelterAssigned: boolean;
  reporterNotified: boolean;
};

export type StoredRescueReport = {
  id: number;
  reportId: string | null;
  fullName: string;
  email: string;
  phone: string;
  species?: string;
  breed?: string;
  healthConditions?: string[];
  notes?: string;
  lastSeenAddress?: string;
  urgency?: "critical" | "urgent" | "standard";
  location?: {
    latitude: number;
    longitude: number;
  };
  animalImageDataUrl?: string;
  caseStatus: RescueCaseStatus;
  adminChecklist: RescueAdminChecklist;
  lastAdminUpdateAt?: string | null;
  reporterNotifiedAt?: string | null;
  createdAt: string;
};

function parseDescription(desc: string | null) {
  if (!desc) return {} as any;
  try {
    return JSON.parse(desc);
  } catch {
    return { raw: desc };
  }
}

function buildDescriptionFromReport(report: Omit<StoredRescueReport, "id" | "createdAt">) {
  return JSON.stringify({
    fullName: report.fullName,
    email: report.email,
    species: report.species,
    breed: report.breed,
    healthConditions: report.healthConditions,
    notes: report.notes,
    animalImageDataUrl: report.animalImageDataUrl,
    location: report.location,
    adminChecklist: report.adminChecklist,
    lastAdminUpdateAt: report.lastAdminUpdateAt,
    reporterNotifiedAt: report.reporterNotifiedAt,
  });
}

function mapRowToStored(row: any): StoredRescueReport {
  const extra = parseDescription(row.description ?? null);

  return {
    id: row.id,
    reportId: row.reportId ?? null,
    fullName: extra.fullName ?? row.reporterName ?? "",
    email: extra.email ?? null,
    phone: row.reporterPhone ?? extra.phone ?? "",
    species: extra.species ?? undefined,
    breed: extra.breed ?? undefined,
    healthConditions: extra.healthConditions ?? undefined,
    notes: extra.notes ?? undefined,
    lastSeenAddress: row.location ?? undefined,
    urgency: row.priority as any,
    location: extra.location ?? undefined,
    animalImageDataUrl: extra.animalImageDataUrl ?? undefined,
    caseStatus: (row.status as RescueCaseStatus) ?? "reported",
    adminChecklist: extra.adminChecklist ?? { rescued: false, monitored: false, medicalCompleted: false, shelterAssigned: false, reporterNotified: false },
    lastAdminUpdateAt: extra.lastAdminUpdateAt ?? null,
    reporterNotifiedAt: extra.reporterNotifiedAt ?? null,
    createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : new Date().toISOString(),
  };
}

export async function saveRescueReport(report: Omit<StoredRescueReport, "id">) {
  const created = await prisma.rescueRequest.create({
    data: {
      reportId: report.reportId ?? undefined,
      location: report.lastSeenAddress ?? "",
      description: buildDescriptionFromReport(report as any),
      status: report.caseStatus ?? "reported",
      priority: report.urgency ?? "standard",
      reporterName: report.fullName,
      reporterPhone: report.phone,
    },
  });

  return mapRowToStored(created as any);
}

export async function listRescueReports() {
  const rows = await prisma.rescueRequest.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map(mapRowToStored);
}

export async function updateRescueReportAdmin(
  reportId: string,
  updates: {
    caseStatus: RescueCaseStatus;
    adminChecklist: RescueAdminChecklist;
  },
) {
  const existingRow = await prisma.rescueRequest.findUnique({ where: { reportId } });
  if (!existingRow) return null;

  const prev = mapRowToStored(existingRow as any);

  const extra = parseDescription(existingRow.description ?? null);
  extra.adminChecklist = updates.adminChecklist;
  extra.lastAdminUpdateAt = new Date().toISOString();

  const updatedRow = await prisma.rescueRequest.update({
    where: { reportId },
    data: {
      status: updates.caseStatus,
      description: JSON.stringify(extra),
      updatedAt: new Date(),
    },
  });

  return { previous: prev, updated: mapRowToStored(updatedRow as any) };
}
