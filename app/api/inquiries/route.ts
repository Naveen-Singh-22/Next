import { NextResponse } from "next/server";
import { listInquiries } from "@/lib/inquiryStore";
import { requireAdmin } from "@/lib/authContext";

export const runtime = "nodejs";

export async function GET() {
  await requireAdmin();
  return NextResponse.json({ inquiries: await listInquiries() });
}