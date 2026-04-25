import { NextResponse } from "next/server";
import { findAdoptionById, updateAdoption } from "@/lib/adoptionsStore";
import type { AdoptionApplication } from "@/lib/adoptionApplicationTypes";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

type UpdateAdoptionBody = Partial<Omit<AdoptionApplication, "id" | "createdAt">>;

function parseId(rawId: string) {
  const parsed = Number(rawId);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export const runtime = "nodejs";

export async function GET(_: Request, { params }: RouteParams) {
  const { id } = await params;
  const parsedId = parseId(id);

  if (!parsedId) {
    return NextResponse.json({ message: "Invalid adoption application ID." }, { status: 400 });
  }

  const application = findAdoptionById(parsedId);

  if (!application) {
    return NextResponse.json({ message: "Adoption application not found." }, { status: 404 });
  }

  return NextResponse.json({ application });
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const parsedId = parseId(id);

  if (!parsedId) {
    return NextResponse.json({ message: "Invalid adoption application ID." }, { status: 400 });
  }

  let body: UpdateAdoptionBody;

  try {
    body = (await request.json()) as UpdateAdoptionBody;
  } catch {
    return NextResponse.json({ message: "Invalid JSON payload." }, { status: 400 });
  }

  const application = updateAdoption(parsedId, body);

  if (!application) {
    return NextResponse.json({ message: "Adoption application not found." }, { status: 404 });
  }

  return NextResponse.json({ application });
}
