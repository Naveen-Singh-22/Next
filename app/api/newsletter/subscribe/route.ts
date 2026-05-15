import { NextResponse } from "next/server";
import { NewsletterSignupSchema } from "@/lib/validation";
import { handleError } from "@/lib/apiErrors";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate request body against schema
    const validated = NewsletterSignupSchema.parse(body);

    // TODO: Save to newsletter database or email list
    // For now, just return success
    return NextResponse.json({
      ok: true,
      message: "Thanks for subscribing. We will keep you updated!",
    });
  } catch (error) {
    return handleError(error);
  }
}
