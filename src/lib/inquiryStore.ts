import { prisma } from "@/lib/prisma";

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

export async function listInquiries() {
  const rows = await prisma.inquiry.findMany({ orderBy: { createdAt: "desc" } });

  return rows.map((row) => ({
    id: row.id,
    type: row.type as InquiryType,
    referenceId: row.referenceId ?? 0,
    title: row.title,
    preview: row.preview ?? "",
    status: (row.status as InquiryStatus) ?? "new",
    createdAt: row.createdAt ? row.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: row.updatedAt ? row.updatedAt.toISOString() : undefined,
  }));
}

export async function getInquiryById(id: number) {
  const row = await prisma.inquiry.findUnique({ where: { id } });

  if (!row) return null;

  return {
    id: row.id,
    type: row.type as InquiryType,
    referenceId: row.referenceId ?? 0,
    title: row.title,
    preview: row.preview ?? "",
    status: (row.status as InquiryStatus) ?? "new",
    createdAt: row.createdAt ? row.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: row.updatedAt ? row.updatedAt.toISOString() : undefined,
  };
}

export async function createInquiry(
  input: Omit<StoredInquiry, "id" | "status" | "createdAt" | "updatedAt"> & {
    status?: InquiryStatus;
  },
) {
  const nextId = (await prisma.inquiry.aggregate({ _max: { id: true } }))._max.id ?? 0;
  const createdAt = new Date();

  const row = await prisma.inquiry.create({
    data: {
      id: nextId + 1,
      type: input.type,
      referenceId: input.referenceId,
      title: input.title,
      preview: input.preview ?? null,
      status: input.status ?? "new",
      createdAt,
    },
  });

  return {
    id: row.id,
    type: row.type as InquiryType,
    referenceId: row.referenceId ?? 0,
    title: row.title,
    preview: row.preview ?? "",
    status: (row.status as InquiryStatus) ?? "new",
    createdAt: row.createdAt ? row.createdAt.toISOString() : createdAt.toISOString(),
  };
}

export async function updateInquiryStatus(id: number, status: InquiryStatus) {
  const row = await prisma.inquiry.update({
    where: { id },
    data: { status, updatedAt: new Date() },
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
    type: row.type as InquiryType,
    referenceId: row.referenceId ?? 0,
    title: row.title,
    preview: row.preview ?? "",
    status: (row.status as InquiryStatus) ?? "new",
    createdAt: row.createdAt ? row.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: row.updatedAt ? row.updatedAt.toISOString() : undefined,
  };
}