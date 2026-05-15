import { GET as authLogoutGet, POST as authLogoutPost } from "@/app/api/auth/logout/route";

export function GET(request: Request) {
	return authLogoutGet(request);
}

export function POST() {
	return authLogoutPost();
}
