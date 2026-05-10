import { NextResponse } from "next/server";
import { deleteAnimal, getAnimalById, updateAnimal } from "@/lib/animalInventoryDb";
import type {
  AnimalGender,
  AnimalHealthStatus,
  AnimalSpecies,
  AnimalStatus,
  AnimalVaccinationStatus,
} from "@/lib/animalInventoryTypes";
import { requireAdmin } from "@/lib/authContext";
import { handleError, NotFoundError } from "@/lib/apiErrors";

const speciesValues: AnimalSpecies[] = ["dog", "cat", "bird"];
const genderValues: AnimalGender[] = ["male", "female"];
const healthValues: AnimalHealthStatus[] = ["healthy", "injured", "recovering", "critical"];
const statusValues: AnimalStatus[] = ["rescued", "admitted", "available", "adopted"];
const vaccinationValues: AnimalVaccinationStatus[] = ["up_to_date", "due_soon", "overdue"];

function parseId(value: string) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function parsePhotoUrls(value: unknown) {
  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    return [] as string[];
  }

  return value.filter((item): item is string => typeof item === "string" && item.length > 0);
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const animalId = parseId(id);

    if (!animalId) {
      return NextResponse.json({ ok: false, message: "Invalid animal id." }, { status: 400 });
    }

    const animal = await getAnimalById(animalId);

    if (!animal) {
      throw new NotFoundError("Animal not found");
    }

    return NextResponse.json({ ok: true, animal }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    // Check admin authorization
    await requireAdmin();

    const { id } = await context.params;
    const animalId = parseId(id);

    if (!animalId) {
      return NextResponse.json({ ok: false, message: "Invalid animal id." }, { status: 400 });
    }

    const body = (await request.json()) as Record<string, unknown>;

    if (body.species && !speciesValues.includes(body.species as AnimalSpecies)) {
      return NextResponse.json({ ok: false, message: "Invalid species." }, { status: 400 });
    }

    if (body.gender && !genderValues.includes(body.gender as AnimalGender)) {
      return NextResponse.json({ ok: false, message: "Invalid gender." }, { status: 400 });
    }

    if (body.healthStatus && !healthValues.includes(body.healthStatus as AnimalHealthStatus)) {
      return NextResponse.json({ ok: false, message: "Invalid health status." }, { status: 400 });
    }

    if (body.status && !statusValues.includes(body.status as AnimalStatus)) {
      return NextResponse.json({ ok: false, message: "Invalid status." }, { status: 400 });
    }

    if (body.vaccinationStatus && !vaccinationValues.includes(body.vaccinationStatus as AnimalVaccinationStatus)) {
      return NextResponse.json({ ok: false, message: "Invalid vaccination status." }, { status: 400 });
    }

    const updated = await updateAnimal(animalId, {
      name: typeof body.name === "string" ? body.name : undefined,
      species: body.species as AnimalSpecies | undefined,
      breed: typeof body.breed === "string" ? body.breed : body.breed === null ? "" : undefined,
      age: typeof body.age === "number" ? body.age : undefined,
      gender: body.gender as AnimalGender | undefined,
      healthStatus: body.healthStatus as AnimalHealthStatus | undefined,
      status: body.status as AnimalStatus | undefined,
      notes: typeof body.notes === "string" ? body.notes : body.notes === null ? "" : undefined,
      photoUrls: parsePhotoUrls(body.photoUrls),
      vaccinationStatus: body.vaccinationStatus as AnimalVaccinationStatus | undefined,
    });

    if (!updated) {
      throw new NotFoundError("Animal not found");
    }

    return NextResponse.json({ ok: true, animal: updated }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    // Check admin authorization
    await requireAdmin();

    const { id } = await context.params;
    const animalId = parseId(id);

    if (!animalId) {
      return NextResponse.json({ ok: false, message: "Invalid animal id." }, { status: 400 });
    }

    const deleted = await deleteAnimal(animalId);

    if (!deleted) {
      throw new NotFoundError("Animal not found");
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}
