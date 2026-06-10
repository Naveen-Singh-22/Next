import { prisma } from "@/lib/prisma";

export type StoredVolunteerApplication = {
  id: number;
  applicationId: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  interestArea: string;
  availability: string;
  status: "pending" | "reviewing" | "approved" | "declined";
  createdAt: string;
};

function createApplicationId() {
  return `VL-${Math.floor(Date.now() / 1000).toString(36).toUpperCase()}`;
}

export async function listVolunteerApplications() {
  const rows = await prisma.volunteerApplication.findMany({ orderBy: { createdAt: "desc" } });

  return rows.map((row) => ({
    id: row.id,
    applicationId: row.applicationId || `VL-${row.id}`,
    fullName: row.fullName,
    email: row.email,
    phone: row.phone || "",
    city: row.city || "",
    interestArea: row.interestArea || "",
    availability: row.availability || "",
    status: (row.status as StoredVolunteerApplication["status"]) || "pending",
    createdAt: row.createdAt ? row.createdAt.toISOString() : new Date().toISOString(),
  }));
}

export async function createVolunteerApplication(
  input: Omit<StoredVolunteerApplication, "id" | "applicationId" | "createdAt">,
) {
  const nextId = (await prisma.volunteerApplication.aggregate({ _max: { id: true } }))._max.id ?? 0;
  const applicationId = createApplicationId();
  const createdAt = new Date();

  const row = await prisma.volunteerApplication.create({
    data: {
      id: nextId + 1,
      applicationId,
      fullName: input.fullName,
      email: input.email,
      phone: input.phone || null,
      city: input.city || null,
      interestArea: input.interestArea || null,
      availability: input.availability || null,
      status: input.status,
      createdAt,
    },
  });

  return {
    id: row.id,
    applicationId: row.applicationId || applicationId,
    fullName: row.fullName,
    email: row.email,
    phone: row.phone || "",
    city: row.city || "",
    interestArea: row.interestArea || "",
    availability: row.availability || "",
    status: (row.status as StoredVolunteerApplication["status"]) || "pending",
    createdAt: row.createdAt ? row.createdAt.toISOString() : new Date().toISOString(),
  };
}

export async function updateVolunteerApplicationStatus(
  applicationId: string,
  status: StoredVolunteerApplication["status"],
) {
  const row = await prisma.volunteerApplication.update({
    where: { applicationId },
    data: { status },
  }).catch((error: { code?: string }) => {
    if (error.code === "P2025") {
      return null;
    }

    throw error;
  });

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    applicationId: row.applicationId || applicationId,
    fullName: row.fullName,
    email: row.email,
    phone: row.phone || "",
    city: row.city || "",
    interestArea: row.interestArea || "",
    availability: row.availability || "",
    status: (row.status as StoredVolunteerApplication["status"]) || "pending",
    createdAt: row.createdAt ? row.createdAt.toISOString() : new Date().toISOString(),
  };
}
