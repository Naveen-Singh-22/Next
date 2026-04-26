import { NextResponse } from "next/server";
import { bulkCreateVaccinations, listVaccinations } from "@/lib/vaccinationDb";
import type { VaccinationCreateInput } from "@/lib/vaccinationTypes";

function toNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isValidDateString(value: unknown): value is string {
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

  const animalIdsInput = payload.animalIds;
  const animalNamesInput = payload.animalNames;
  const isBulk = Array.isArray(animalIdsInput);
  const animalIds = isBulk ? animalIdsInput.map(toNumber).filter((value): value is number => value !== null) : [];

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

  const vaccineName = baseFields.vaccineName;
  const dose = baseFields.dose;
  const dateGiven = baseFields.dateGiven;
  const nextDueDate = baseFields.nextDueDate;
  const notes = typeof baseFields.notes === "string" ? baseFields.notes : undefined;

  if (isBulk) {
    if (animalIds.length === 0 || !Array.isArray(animalNamesInput) || animalNamesInput.length !== animalIds.length) {
      return null;
    }

    const inputs: VaccinationCreateInput[] = [];

    for (const [index, animalId] of animalIds.entries()) {
      const animalName = animalNamesInput[index];

      if (typeof animalName !== "string") {
        return null;
      }

      inputs.push({
        animalId,
        animalName,
        vaccineName,
        dose,
        dateGiven,
        nextDueDate,
        notes,
      });
    }

    return inputs;
  }

  const animalId = toNumber(payload.animalId);

  if (animalId === null || typeof payload.animalName !== "string") {
    return null;
  }

  return [
    {
      animalId,
      animalName: payload.animalName,
      vaccineName,
      dose,
      dateGiven,
      nextDueDate,
      notes,
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
