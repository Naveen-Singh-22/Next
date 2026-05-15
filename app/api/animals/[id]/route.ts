import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type {
  AnimalGender,
  AnimalHealthStatus,
  AnimalSpecies,
  AnimalStatus,
  AnimalVaccinationState,
} from "@/lib/animalInventoryTypes";
import { requireAdmin } from "@/lib/authContext";
import { handleError, NotFoundError } from "@/lib/apiErrors";

const speciesValues: AnimalSpecies[] = ["dog", "cat", "bird"];
const genderValues: AnimalGender[] = ["male", "female"];
const healthValues: AnimalHealthStatus[] = ["healthy", "injured", "recovering", "critical"];
const statusValues: AnimalStatus[] = ["rescued", "admitted", "available", "adopted"];
const vaccinationValues: AnimalVaccinationState[] = ["up-to-date", "due_soon", "overdue"];

function parseId(value: string) {
  const trimmed = value?.toString().trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const animalId = parseId(id);

    if (!animalId) {
      return NextResponse.json({ ok: false, message: "Invalid animal id." }, { status: 400 });
    }

    const animal = await prisma.animal.findUnique({ where: { id: animalId } });

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

    if (body.vaccinationState && !vaccinationValues.includes(body.vaccinationState as AnimalVaccinationState)) {
      return NextResponse.json({ ok: false, message: "Invalid vaccination status." }, { status: 400 });
    }

    const updates: any = {};

    if (body.name !== undefined) updates.name = typeof body.name === "string" ? body.name.trim() : undefined;
    if (body.species) updates.species = body.species;
    if (body.age !== undefined) updates.age = typeof body.age === "number" ? body.age : undefined;
    if (body.animalCode !== undefined) updates.animalCode = typeof body.animalCode === "string" ? body.animalCode.trim() : undefined;
    if (body.breed !== undefined) updates.breed = typeof body.breed === "string" ? body.breed.trim() : undefined;
    if (body.gender !== undefined) updates.gender = body.gender;
    if (body.healthStatus !== undefined) updates.healthStatus = body.healthStatus;
    if (body.notes !== undefined) updates.notes = typeof body.notes === "string" ? body.notes.trim() : undefined;
    if (body.photoUrls !== undefined) updates.photoUrls = Array.isArray(body.photoUrls) ? body.photoUrls.filter((value): value is string => typeof value === "string" && value.trim().length > 0) : undefined;
    if (body.status === "adopted") updates.adopted = true;
    if (body.status === "available" || body.status === "admitted" || body.status === "rescued") updates.adopted = false;
    if (body.status !== undefined) updates.status = body.status;
    if (body.vaccinationState !== undefined) updates.vaccinationState = body.vaccinationState;

    const updated = await prisma.animal.update({ where: { id: animalId }, data: updates });

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

    const existing = await prisma.animal.findUnique({ where: { id: animalId } });

    if (!existing) {
      throw new NotFoundError("Animal not found");
    }

    await prisma.animal.delete({ where: { id: animalId } });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}
