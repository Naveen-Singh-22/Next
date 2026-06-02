import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type {
  AnimalCreateInput,
  AnimalFilters,
  AnimalGender,
  AnimalHealthStatus,
  AnimalSpecies,
  AnimalStatus,
  AnimalVaccinationState,
} from "@/lib/animalInventoryTypes";
import { requireAdmin } from "@/lib/authContext";
import { recordAdminAuditEvent } from "@/lib/adminAudit";
import { handleError } from "@/lib/apiErrors";

const speciesValues: AnimalSpecies[] = ["dog", "cat", "bird"];
const genderValues: AnimalGender[] = ["male", "female"];
const healthValues: AnimalHealthStatus[] = ["healthy", "injured", "recovering", "critical"];
const statusValues: AnimalStatus[] = ["rescued", "admitted", "available", "adopted"];
const vaccinationValues: AnimalVaccinationState[] = ["up-to-date", "due_soon", "overdue"];
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

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const filters = parseAnimalsQuery(url.searchParams);

    const where: any = {};

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { species: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters.species) where.species = filters.species;
    if (filters.status === "adopted") where.adopted = true;
    if (filters.status === "available") where.adopted = false;

    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.max(1, filters.limit ?? 12);

    const orderBy: any = [];
    switch (filters.sort) {
      case "alphabetical":
        orderBy.push({ name: "asc" });
        break;
      case "newest":
      default:
        orderBy.push({ createdAt: "desc" });
        break;
    }

    const [total, animals] = await Promise.all([
      prisma.animal.count({ where }),
      prisma.animal.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit }),
    ]);

    return NextResponse.json({ animals, total, page, limit }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    // Check admin authorization
    const actor = await requireAdmin();

    const body = (await request.json()) as Partial<AnimalCreateInput>;

    // Validate required fields
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

    if (!vaccinationValues.includes(body.vaccinationState as AnimalVaccinationState)) {
      return NextResponse.json({ ok: false, message: "Valid vaccination status is required." }, { status: 400 });
    }

    const animalCode =
      typeof body.animalCode === "string" && body.animalCode.trim().length > 0
        ? body.animalCode.trim()
        : `${body.name!.trim().toLowerCase().replace(/\s+/g, "-")}-${body.species}`;

    const nextIntId = (await prisma.animal.aggregate({ _max: { intId: true } }))._max.intId ?? 0;

    const created = await prisma.animal.create({
      data: {
        id: `${body.name!.trim().toLowerCase().replace(/\s+/g, "-")}-${body.species}`,
        intId: nextIntId + 1,
        animalCode,
        name: body.name!.trim(),
        species: body.species as AnimalSpecies,
        age: body.age ?? null,
        adopted: body.status === "adopted",
        breed: typeof body.breed === "string" && body.breed.trim().length > 0 ? body.breed.trim() : "",
        gender: body.gender ?? "male",
        healthStatus: body.healthStatus as AnimalHealthStatus,
        notes: typeof body.notes === "string" ? body.notes.trim() : "",
        photoUrls: Array.isArray(body.photoUrls) ? body.photoUrls.filter((value): value is string => typeof value === "string" && value.trim().length > 0) : [],
        status: body.status ?? "admitted",
        vaccinationState: body.vaccinationState as AnimalVaccinationState,
      },
    });

    await recordAdminAuditEvent({
      actor,
      action: "create",
      resource: "animal",
      request,
      subjectId: created.id,
      details: {
        animalCode: created.animalCode,
        name: created.name,
        species: created.species,
        status: created.status,
      },
    });

    return NextResponse.json({ ok: true, animal: created }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
