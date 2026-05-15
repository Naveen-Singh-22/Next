import { prisma } from "@/lib/prisma";
import type {
  Vaccination,
  VaccinationCreateInput,
  VaccinationUpdateInput,
} from "@/lib/vaccinationTypes";

function toIsoDate(date: Date | null | undefined) {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

function toVaccination(row: {
  id: number;
  animalId: number;
  animalName: string;
  vaccineName: string;
  dose: string | null;
  dateGiven: Date;
  nextDueDate: Date | null;
  notes: string | null;
}): Vaccination {
  return {
    id: row.id,
    animalId: row.animalId,
    animalName: row.animalName,
    vaccineName: row.vaccineName,
    dose: row.dose ?? "",
    dateGiven: toIsoDate(row.dateGiven),
    nextDueDate: toIsoDate(row.nextDueDate),
    notes: row.notes ?? undefined,
  };
}

async function getNextVaccinationId() {
  const result = await prisma.vaccination.aggregate({ _max: { id: true } });
  return (result._max.id ?? 0) + 1;
}

export async function listVaccinations() {
  const rows = await prisma.vaccination.findMany({ orderBy: { id: "desc" } });
  return rows.map(toVaccination);
}

export async function listVaccinationsForAnimal(animalId: number) {
  const rows = await prisma.vaccination.findMany({
    where: { animalId },
    orderBy: { id: "desc" },
  });
  return rows.map(toVaccination);
}

export async function createVaccination(input: VaccinationCreateInput) {
  const nextId = await getNextVaccinationId();

  const row = await prisma.vaccination.create({
    data: {
      id: nextId,
      animalId: input.animalId,
      animalName: input.animalName.trim(),
      vaccineName: input.vaccineName.trim(),
      dose: input.dose.trim() || null,
      dateGiven: new Date(input.dateGiven),
      nextDueDate: input.nextDueDate ? new Date(input.nextDueDate) : null,
      notes: input.notes?.trim() || null,
    },
  });

  return toVaccination(row);
}

export async function bulkCreateVaccinations(inputs: VaccinationCreateInput[]) {
  const created: Vaccination[] = [];

  for (const input of inputs) {
    created.push(await createVaccination(input));
  }

  return created;
}

export async function updateVaccination(id: number, updates: VaccinationUpdateInput) {
  const existing = await prisma.vaccination.findUnique({ where: { id } });
  if (!existing) return null;

  const data: {
    vaccineName?: string;
    dose?: string | null;
    dateGiven?: Date;
    nextDueDate?: Date | null;
    notes?: string | null;
  } = {};

  if (updates.vaccineName !== undefined) data.vaccineName = updates.vaccineName.trim();
  if (updates.dose !== undefined) data.dose = updates.dose.trim() || null;
  if (updates.dateGiven !== undefined) data.dateGiven = new Date(updates.dateGiven);
  if (updates.nextDueDate !== undefined) data.nextDueDate = updates.nextDueDate ? new Date(updates.nextDueDate) : null;
  if (updates.notes !== undefined) data.notes = updates.notes.trim() || null;

  const row = await prisma.vaccination.update({ where: { id }, data });
  return toVaccination(row);
}

export async function deleteVaccination(id: number) {
  const existing = await prisma.vaccination.findUnique({ where: { id } });
  if (!existing) return null;

  const removed = await prisma.vaccination.delete({ where: { id } });
  return toVaccination(removed);
}
