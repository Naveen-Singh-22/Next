import { NextResponse } from "next/server";
import { listVaccinationsForAnimal } from "@/lib/vaccinationDb";

function toNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const animalId = toNumber(id);

  if (animalId === null) {
    return NextResponse.json({ error: "Invalid animal id." }, { status: 400 });
  }

  const vaccinations = await listVaccinationsForAnimal(animalId);
  return NextResponse.json({ vaccinations });
}
