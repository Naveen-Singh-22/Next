import { prisma } from "@/lib/prisma";

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

export async function saveAdoptionRequest(request: Omit<StoredAdoptionRequest, "id">) {
  const nextId = (await prisma.adoptionRequest.aggregate({ _max: { id: true } }))._max.id ?? 0;

  const saved = await prisma.adoptionRequest.create({
    data: {
      id: nextId + 1,
      requestId: request.requestId,
      animalSlug: request.animalSlug,
      animalName: request.animalName,
      animalSpecies: request.animalSpecies,
      animalImage: request.animalImage,
      applicantName: request.applicantName,
      applicantEmail: request.applicantEmail,
      applicantPhone: request.applicantPhone,
      city: request.city,
      homeType: request.homeType,
      message: request.message,
      status: request.status,
      createdAt: request.createdAt ? new Date(request.createdAt) : new Date(),
    },
  });

  return {
    ...request,
    id: saved.id,
  };
}

export async function listAdoptionRequests() {
  const rows = await prisma.adoptionRequest.findMany({ orderBy: { createdAt: "desc" } });

  return rows.map((row) => ({
    id: row.id,
    requestId: row.requestId || `AR-${row.id}`,
    animalSlug: row.animalSlug,
    animalName: row.animalName,
    animalSpecies: row.animalSpecies,
    animalImage: row.animalImage,
    applicantName: row.applicantName,
    applicantEmail: row.applicantEmail,
    applicantPhone: row.applicantPhone,
    city: row.city,
    homeType: row.homeType as StoredAdoptionRequest["homeType"],
    message: row.message,
    status: row.status as StoredAdoptionRequest["status"],
    createdAt: row.createdAt ? row.createdAt.toISOString() : new Date().toISOString(),
  }));
}
