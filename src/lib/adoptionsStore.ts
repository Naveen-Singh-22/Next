import type { AdoptionApplication, AdoptionStatus } from "@/lib/adoptionApplicationTypes";
import { prisma } from "@/lib/prisma";

function createApplicationId(usedIds: Set<string>) {
  let value = "";

  do {
    value = `AD-${Math.floor(Date.now() / 1000).toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
  } while (usedIds.has(value));

  usedIds.add(value);
  return value;
}

function statusEventLabel(status: AdoptionStatus) {
  switch (status) {
    case "shortlisted":
      return "Application shortlisted";
    case "home_visit":
      return "Home visit scheduled";
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    case "adopted":
      return "Adopted";
    default:
      return "Status updated";
  }
}

export async function listAdoptions() {
  const items = await prisma.adoptionApplication.findMany({ orderBy: { createdAt: "desc" } });

  return items.map((row) => ({
    id: row.id,
    applicationId: row.applicationId || `AD-${row.id}`,
    applicantName: row.applicantName,
    email: row.email,
    phone: row.phone || "",
    city: row.city || "",
    housing: row.housing || "",
    petExperience: row.petExperience || "",
    whyAdopt: row.whyAdopt || "",
    animalId: row.animalId ?? 0,
    animalName: row.animalName || "",
    animalCode: row.animalCode || undefined,
    status: (row.status as AdoptionStatus) || "applied",
    adminNotes: row.adminNotes || "",
    timeline: (row.timeline as any) || [
      { type: "Application submitted", time: row.createdAt?.toISOString() || new Date().toISOString() },
    ],
    createdAt: row.createdAt ? row.createdAt.toISOString() : new Date().toISOString(),
  })) as AdoptionApplication[];
}

export async function findAdoptionById(id: number) {
  const row = await prisma.adoptionApplication.findUnique({ where: { id } });

  if (!row) return null;

  return {
    id: row.id,
    applicationId: row.applicationId || `AD-${row.id}`,
    applicantName: row.applicantName,
    email: row.email,
    phone: row.phone || "",
    city: row.city || "",
    housing: row.housing || "",
    petExperience: row.petExperience || "",
    whyAdopt: row.whyAdopt || "",
    animalId: row.animalId ?? 0,
    animalName: row.animalName || "",
    animalCode: row.animalCode || undefined,
    status: (row.status as AdoptionStatus) || "applied",
    adminNotes: row.adminNotes || "",
    timeline: (row.timeline as any) || [
      { type: "Application submitted", time: row.createdAt?.toISOString() || new Date().toISOString() },
    ],
    createdAt: row.createdAt ? row.createdAt.toISOString() : new Date().toISOString(),
  } as AdoptionApplication;
}

export async function createAdoption(
  input: Omit<AdoptionApplication, "id" | "applicationId" | "createdAt" | "timeline" | "status">,
) {
  const usedIds = new Set<string>();

  const applicationId = createApplicationId(usedIds);
  const now = new Date();

  const row = await prisma.adoptionApplication.create({
    data: {
      applicationId,
      applicantName: input.applicantName,
      email: input.email,
      phone: input.phone || null,
      city: input.city || null,
      housing: input.housing || null,
      petExperience: input.petExperience || null,
      whyAdopt: input.whyAdopt || null,
      animalId: input.animalId,
      animalName: input.animalName,
      animalCode: input.animalCode || null,
      adminNotes: input.adminNotes || null,
      status: "applied",
      timeline: [
        {
          type: "Application submitted",
          time: now.toISOString(),
        },
      ],
      createdAt: now,
    },
  });

  return findAdoptionById(row.id);
}

export async function updateAdoption(id: number, updates: Partial<Omit<AdoptionApplication, "id" | "createdAt">>) {
  const existing = await prisma.adoptionApplication.findUnique({ where: { id } });
  if (!existing) return null;

  const data: any = {};
  if (updates.applicantName !== undefined) data.applicantName = updates.applicantName;
  if (updates.email !== undefined) data.email = updates.email;
  if (updates.phone !== undefined) data.phone = updates.phone || null;
  if (updates.city !== undefined) data.city = updates.city || null;
  if (updates.housing !== undefined) data.housing = updates.housing || null;
  if (updates.petExperience !== undefined) data.petExperience = updates.petExperience || null;
  if (updates.whyAdopt !== undefined) data.whyAdopt = updates.whyAdopt || null;
  if (updates.animalId !== undefined) data.animalId = updates.animalId;
  if (updates.animalName !== undefined) data.animalName = updates.animalName || null;
  if (updates.animalCode !== undefined) data.animalCode = updates.animalCode || null;
  if (updates.adminNotes !== undefined) data.adminNotes = updates.adminNotes || null;
  if (updates.status !== undefined) data.status = updates.status;
  if (Array.isArray(updates.timeline)) data.timeline = updates.timeline;

  await prisma.adoptionApplication.update({ where: { id }, data });

  return findAdoptionById(id);
}

export async function updateAdoptionStatus(id: number, status: AdoptionStatus) {
  const existing = await prisma.adoptionApplication.findUnique({ where: { id } });
  if (!existing) return null;

  const timeline = Array.isArray(existing.timeline) ? [...existing.timeline] : [];
  timeline.push({ type: statusEventLabel(status), time: new Date().toISOString() } as any);

  await prisma.adoptionApplication.update({ where: { id }, data: { status, timeline } });

  return findAdoptionById(id);
}
