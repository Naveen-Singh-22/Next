import { NextResponse } from "next/server";
import {
  createAnimal,
  listAnimals,
} from "@/lib/animalInventoryDb";
import type {
  AnimalCreateInput,
  AnimalFilters,
  AnimalGender,
  AnimalHealthStatus,
  AnimalSpecies,
  AnimalStatus,
  AnimalVaccinationStatus,
} from "@/lib/animalInventoryTypes";

const speciesValues: AnimalSpecies[] = ["dog", "cat", "bird"];
const genderValues: AnimalGender[] = ["male", "female"];
const healthValues: AnimalHealthStatus[] = ["healthy", "injured", "recovering", "critical"];
const statusValues: AnimalStatus[] = ["rescued", "admitted", "available", "adopted"];
const vaccinationValues: AnimalVaccinationStatus[] = ["up_to_date", "due_soon", "overdue"];
const sortValues: NonNullable<AnimalFilters["sort"]>[] = ["newest", "health", "alphabetical"];

function parseNumber(value: string | null) {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseAnimalsQuery(searchParams: URLSearchParams): AnimalFilters {
  const sort = searchParams.get("sort") as AnimalFilters["sort"] | null;

  return {
    search: searchParams.get("search") ?? undefined,
    species: speciesValues.includes(searchParams.get("species") as AnimalSpecies) ? (searchParams.get("species") as AnimalSpecies) : undefined,
    healthStatus: healthValues.includes(searchParams.get("healthStatus") as AnimalHealthStatus)
      ? (searchParams.get("healthStatus") as AnimalHealthStatus)
      : undefined,
    status: statusValues.includes(searchParams.get("status") as AnimalStatus) ? (searchParams.get("status") as AnimalStatus) : undefined,
    sort: sort && sortValues.includes(sort) ? sort : "newest",
    page: parseNumber(searchParams.get("page")),
    limit: parseNumber(searchParams.get("limit")),
  };
}

function parsePhotoUrls(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as string[];
  }

  return value.filter((item): item is string => typeof item === "string" && item.length > 0);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const result = await listAnimals(parseAnimalsQuery(url.searchParams));

  return NextResponse.json(result, { status: 200 });
}

export async function POST(request: Request) {
  let body: Partial<AnimalCreateInput>;

  try {
    body = (await request.json()) as Partial<AnimalCreateInput>;
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request body." }, { status: 400 });
  }

  if (!body.name?.trim()) {
    return NextResponse.json({ ok: false, message: "Animal name is required." }, { status: 400 });
  }

  if (!speciesValues.includes(body.species as AnimalSpecies)) {
    return NextResponse.json({ ok: false, message: "Valid species is required." }, { status: 400 });
  }

  if (!healthValues.includes(body.healthStatus as AnimalHealthStatus)) {
    return NextResponse.json({ ok: false, message: "Valid health status is required." }, { status: 400 });
  }

  if (body.gender && !genderValues.includes(body.gender as AnimalGender)) {
    return NextResponse.json({ ok: false, message: "Gender must be male or female." }, { status: 400 });
  }

  if (body.status && !statusValues.includes(body.status as AnimalStatus)) {
    return NextResponse.json({ ok: false, message: "Invalid animal status." }, { status: 400 });
  }

  if (!vaccinationValues.includes(body.vaccinationStatus as AnimalVaccinationStatus)) {
    return NextResponse.json({ ok: false, message: "Valid vaccination status is required." }, { status: 400 });
  }

  const created = await createAnimal({
    name: body.name,
    species: body.species as AnimalSpecies,
    breed: body.breed,
    age: body.age,
    gender: body.gender as AnimalGender | undefined,
    healthStatus: body.healthStatus as AnimalHealthStatus,
    status: body.status as AnimalStatus | undefined,
    notes: body.notes,
    photoUrls: parsePhotoUrls(body.photoUrls),
    vaccinationStatus: body.vaccinationStatus as AnimalVaccinationStatus,
  });

  return NextResponse.json({ ok: true, animal: created }, { status: 201 });
}
