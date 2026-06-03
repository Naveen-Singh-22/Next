import { prisma } from "@/lib/prisma";

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

function createDonationId() {
  return `DN-${Math.floor(Date.now() / 1000).toString(36).toUpperCase()}`;
}

export async function listDonations() {
  const rows = await prisma.donation.findMany({ orderBy: { createdAt: "desc" } });

  return rows.map((row) => ({
    id: row.id,
    donationId: row.donationId || `DN-${row.id}`,
    donorName: row.donorName,
    email: row.email || "",
    phone: row.phone || "",
    amount: row.amount,
    coverFees: row.coverFees,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function createDonation(input: Omit<StoredDonation, "id" | "donationId" | "createdAt">) {
  const nextId = (await prisma.donation.aggregate({ _max: { id: true } }))._max.id ?? 0;
  const createdAt = new Date();
  const donationId = createDonationId();

  const row = await prisma.donation.create({
    data: {
      id: nextId + 1,
      donationId,
      donorName: input.donorName,
      email: input.email || null,
      phone: input.phone || null,
      amount: input.amount,
      coverFees: input.coverFees,
      createdAt,
    },
  });

  return {
    id: row.id,
    donationId: row.donationId || donationId,
    donorName: row.donorName,
    email: row.email || "",
    phone: row.phone || "",
    amount: row.amount,
    coverFees: row.coverFees,
    createdAt: row.createdAt.toISOString(),
  };
}