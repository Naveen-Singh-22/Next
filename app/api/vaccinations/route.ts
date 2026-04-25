import { NextResponse } from "next/server";
import { bulkCreateVaccinations, listVaccinations } from "@/lib/vaccinationDb";
import type { VaccinationCreateInput } from "@/lib/vaccinationTypes";

function toNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isValidDateString(value: unknown) {
  if (typeof value !== "string") {
    return false;
  }

  return !Number.isNaN(new Date(value).getTime());
}

function normalizeCreateBody(body: unknown): VaccinationCreateInput[] | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const payload = body as Record<string, unknown>;

  const isBulk = Array.isArray(payload.animalIds);
  const animalIds = isBulk ? payload.animalIds.map(toNumber).filter((value): value is number => value !== null) : [];

  const baseFields = {
    vaccineName: payload.vaccineName,
    dose: payload.dose,
    dateGiven: payload.dateGiven,
    nextDueDate: payload.nextDueDate,
    notes: payload.notes,
  };

  if (
    typeof baseFields.vaccineName !== "string" ||
    typeof baseFields.dose !== "string" ||
    !isValidDateString(baseFields.dateGiven) ||
    !isValidDateString(baseFields.nextDueDate)
  ) {
    return null;
  }

  if (isBulk) {
    if (animalIds.length === 0 || !Array.isArray(payload.animalNames) || payload.animalNames.length !== animalIds.length) {
      return null;
    }

    return animalIds.map((animalId, index) => {
      const animalName = payload.animalNames?.[index];

      if (typeof animalName !== "string") {
        return null;
      }

      return {
        animalId,
        animalName,
        vaccineName: baseFields.vaccineName,
        dose: baseFields.dose,
        dateGiven: baseFields.dateGiven,
        nextDueDate: baseFields.nextDueDate,
        notes: typeof baseFields.notes === "string" ? baseFields.notes : undefined,
      } satisfies VaccinationCreateInput;
    }).filter((value): value is VaccinationCreateInput => value !== null);
  }

  const animalId = toNumber(payload.animalId);

  if (animalId === null || typeof payload.animalName !== "string") {
    return null;
  }

  return [
    {
      animalId,
      animalName: payload.animalName,
      vaccineName: baseFields.vaccineName,
      dose: baseFields.dose,
      dateGiven: baseFields.dateGiven,
      nextDueDate: baseFields.nextDueDate,
      notes: typeof baseFields.notes === "string" ? baseFields.notes : undefined,
    },
  ];
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const animalId = url.searchParams.get("animalId");

  const vaccinations = animalId ? (await listVaccinations()).filter((item) => item.animalId === Number(animalId)) : await listVaccinations();

  return NextResponse.json({ vaccinations });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const payload = normalizeCreateBody(body);

  if (!payload || payload.length === 0) {
    return NextResponse.json({ error: "Invalid vaccination payload." }, { status: 400 });
  }

  const created = await bulkCreateVaccinations(payload);
  return NextResponse.json({ vaccinations: created }, { status: 201 });
}
