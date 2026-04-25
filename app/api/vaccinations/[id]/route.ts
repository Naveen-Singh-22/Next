import { NextResponse } from "next/server";
import { deleteVaccination, updateVaccination } from "@/lib/vaccinationDb";

function toNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const vaccinationId = toNumber(id);

  if (vaccinationId === null) {
    return NextResponse.json({ error: "Invalid vaccination id." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const nextDueDate = typeof body?.nextDueDate === "string" ? body.nextDueDate : undefined;
  const notes = typeof body?.notes === "string" ? body.notes : undefined;

  const updated = await updateVaccination(vaccinationId, { nextDueDate, notes });

  if (!updated) {
    return NextResponse.json({ error: "Vaccination not found." }, { status: 404 });
  }

  return NextResponse.json({ vaccination: updated });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const vaccinationId = toNumber(id);

  if (vaccinationId === null) {
    return NextResponse.json({ error: "Invalid vaccination id." }, { status: 400 });
  }

  const removed = await deleteVaccination(vaccinationId);

  if (!removed) {
    return NextResponse.json({ error: "Vaccination not found." }, { status: 404 });
  }

  return NextResponse.json({ vaccination: removed });
}
