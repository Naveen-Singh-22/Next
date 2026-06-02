import { GET as authLogoutGet, POST as authLogoutPost } from "@/app/api/auth/logout/route";
import { getAuthContextOptional } from "@/lib/authContext";
import { recordAdminAuditEvent } from "@/lib/adminAudit";

export async function GET(request: Request) {
	const actor = await getAuthContextOptional();

	if (actor && (actor.role === "admin" || actor.role === "staff")) {
		await recordAdminAuditEvent({
			actor,
			action: "logout",
			resource: "admin_session",
			request,
		});
	}

	return authLogoutGet(request);
}

export async function POST(request: Request) {
	const actor = await getAuthContextOptional();

	if (actor && (actor.role === "admin" || actor.role === "staff")) {
		await recordAdminAuditEvent({
			actor,
			action: "logout",
			resource: "admin_session",
			request,
		});
	}

	return authLogoutPost();
}
