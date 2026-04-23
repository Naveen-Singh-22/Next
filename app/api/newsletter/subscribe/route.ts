import { NextResponse } from "next/server";

type SubscribeBody = {
  email?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: SubscribeBody;

  try {
    body = (await request.json()) as SubscribeBody;
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid request payload." },
      { status: 400 },
    );
  }

  const email = body.email?.trim() ?? "";

  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      { ok: false, message: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Thanks for subscribing. We will keep you updated!",
  });
}
