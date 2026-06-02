import { POST as authLoginPost } from "@/app/api/auth/login/route";
import { verifyToken } from "@/lib/auth";
import { recordAdminAuditEvent } from "@/lib/adminAudit";

export const runtime = "nodejs";

export async function POST(request: Request) {
	const response = await authLoginPost(request);

	if (response.ok) {
		const payload = (await response.clone().json().catch(() => null)) as
			| { ok?: boolean; role?: string; token?: string; name?: string; email?: string; expiresIn?: number }
			| null;

		if (payload?.ok && payload.token) {
			try {
				const actor = verifyToken(payload.token);
				if (actor.role === "admin" || actor.role === "staff") {
					await recordAdminAuditEvent({
						actor: {
							userId: actor.userId,
							fullName: actor.fullName,
							email: actor.email,
							role: actor.role,
						},
						action: "login",
						resource: "admin_session",
						request,
						details: {
							expiresIn: payload.expiresIn ?? null,
						},
					});
				}
			} catch {
				// Audit logging must never block admin login.
			}
		}
	}

	return response;
}
