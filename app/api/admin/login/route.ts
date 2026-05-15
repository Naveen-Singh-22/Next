import { POST as authLoginPost } from "@/app/api/auth/login/route";

export const runtime = "nodejs";

export async function POST(request: Request) {
	return authLoginPost(request);
}
