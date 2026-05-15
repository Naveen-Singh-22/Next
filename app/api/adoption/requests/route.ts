import { NextResponse } from "next/server";
import { listAdoptionRequests, saveAdoptionRequest } from "@/lib/adoptionRequestsDb";
import { createInquiry } from "@/lib/inquiryStore";
import { AdoptionRequestSchema } from "@/lib/validation";
import { requireAdmin, getAuthContextOptional } from "@/lib/authContext";
import { handleError, ValidationError } from "@/lib/apiErrors";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAdmin();
    const requests = await listAdoptionRequests();
    return NextResponse.json({ ok: true, count: requests.length, requests });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate request body against schema
    const validated = AdoptionRequestSchema.parse(body);

    const requestId = `AR-${Math.floor(Date.now() / 1000).toString(36).toUpperCase()}`;

    const savedRequest = await saveAdoptionRequest({
      requestId,
      animalSlug: validated.animalSlug,
      animalName: validated.animalName,
      animalSpecies: validated.animalSpecies,
      animalImage: validated.animalImage || "",
      applicantName: validated.applicantName,
      applicantEmail: validated.applicantEmail,
      applicantPhone: validated.applicantPhone,
      city: validated.city,
      homeType: validated.homeType,
      message: validated.message,
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    await createInquiry({
      type: "adoption",
      referenceId: savedRequest.id,
      title: `Adoption request from ${savedRequest.applicantName}`,
      preview: `${savedRequest.animalName} • ${savedRequest.city}`,
    });

    return NextResponse.json({
      ok: true,
      requestId,
      message: `Application submitted. Your request ID is ${requestId}.`,
    });
  } catch (error) {
    return handleError(error);
  }
}
