import { NextResponse } from "next/server";
import { NewsletterSignupSchema } from "@/lib/validation";
import { handleError } from "@/lib/apiErrors";
import { prisma } from "@/lib/prisma";
import { sendNewsletterWelcomeEmail } from "@/lib/emailService";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate request body against schema
    const { email } = NewsletterSignupSchema.parse(body);
    const normalizedEmail = email.trim().toLowerCase();

    await prisma.newsletterSignup.upsert({
      where: { email: normalizedEmail },
      update: { source: "website" },
      create: { email: normalizedEmail, source: "website" },
    });

    const emailResult = await sendNewsletterWelcomeEmail(normalizedEmail);

    return NextResponse.json({
      ok: true,
      message: emailResult.sent
        ? "Thanks for subscribing. We sent a confirmation email and will keep you updated!"
        : "Thanks for subscribing. We will keep you updated!",
      emailSent: emailResult.sent,
    });
  } catch (error) {
    return handleError(error);
  }
}
