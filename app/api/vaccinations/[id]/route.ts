import { NextResponse } from "next/server";
import { deleteVaccination, updateVaccination } from "@/lib/vaccinationDb";
import type { VaccinationStatus } from "@/lib/vaccinationTypes";

function toNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dueDateFromStatus(status: VaccinationStatus) {
  const today = new Date();

  if (status === "overdue") {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return toDateInputValue(yesterday);
  }

  if (status === "today") {
    return toDateInputValue(today);
  }

  if (status === "upcoming") {
    const upcoming = new Date(today);
    upcoming.setDate(upcoming.getDate() + 14);
    return toDateInputValue(upcoming);
  }

  const upToDate = new Date(today);
  upToDate.setDate(upToDate.getDate() + 60);
  return toDateInputValue(upToDate);
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const vaccinationId = toNumber(id);

  if (vaccinationId === null) {
    return NextResponse.json({ error: "Invalid vaccination id." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const vaccineName = typeof body?.vaccineName === "string" ? body.vaccineName : undefined;
  const dose = typeof body?.dose === "string" ? body.dose : undefined;
  const dateGiven = typeof body?.dateGiven === "string" ? body.dateGiven : undefined;
  const nextDueDate = typeof body?.nextDueDate === "string" ? body.nextDueDate : undefined;
  const notes = typeof body?.notes === "string" ? body.notes : undefined;
  const status = typeof body?.status === "string" ? (body.status as VaccinationStatus) : undefined;

  const resolvedDueDate = nextDueDate ?? (status ? dueDateFromStatus(status) : undefined);

  const updated = await updateVaccination(vaccinationId, {
    vaccineName,
    dose,
    dateGiven,
    nextDueDate: resolvedDueDate,
    notes,
  });

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
