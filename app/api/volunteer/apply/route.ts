import { NextResponse } from "next/server";
import { createVolunteerApplication } from "@/lib/volunteerApplicationsStore";
import { VolunteerApplicationSchema } from "@/lib/validation";
import { handleError } from "@/lib/apiErrors";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate request body against schema
    const validated = VolunteerApplicationSchema.parse(body);

    await createVolunteerApplication({
      fullName: validated.fullName,
      email: validated.email,
      phone: validated.phone,
      city: validated.city,
      interestArea: validated.interestArea,
      availability: validated.availability,
      status: "pending",
    });

    return NextResponse.json({
      ok: true,
      message: "Thanks for applying. Our volunteer team will contact you within 2-3 days.",
    });
  } catch (error) {
    return handleError(error);
  }
}
