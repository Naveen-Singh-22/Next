import { NextResponse } from "next/server";
import { listInquiries } from "@/lib/inquiryStore";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ inquiries: await listInquiries() });
}