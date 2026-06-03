import { appendFile, mkdir } from "fs/promises";
import path from "path";
import type { AuthContext } from "@/lib/authContext";

export type AdminAuditOutcome = "success" | "failure" | "attempt";

export type AdminAuditEvent = {
  actor: AuthContext;
  action: string;
  resource: string;
  outcome?: AdminAuditOutcome;
  subjectId?: string | number;
  details?: Record<string, unknown>;
  request?: Request;
};

function getAuditLogPath() {
  return path.join(process.cwd(), "data", "admin-audit-log.jsonl");
}

export async function recordAdminAuditEvent(event: AdminAuditEvent) {
  const timestamp = new Date().toISOString();
  const requestUrl = event.request ? new URL(event.request.url) : null;

  const payload = {
    timestamp,
    action: event.action,
    resource: event.resource,
    outcome: event.outcome ?? "success",
    subjectId: event.subjectId ?? null,
    details: event.details ?? null,
    actor: {
      userId: event.actor.userId,
      fullName: event.actor.fullName,
      email: event.actor.email,
      role: event.actor.role,
    },
    request: requestUrl
      ? {
          method: event.request?.method ?? null,
          path: `${requestUrl.pathname}${requestUrl.search}`,
          ip:
            event.request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
            event.request?.headers.get("x-real-ip") ??
            null,
          userAgent: event.request?.headers.get("user-agent") ?? null,
        }
      : null,
  };

  try {
    const logPath = getAuditLogPath();
    await mkdir(path.dirname(logPath), { recursive: true });
    await appendFile(logPath, `${JSON.stringify(payload)}\n`, "utf8");
  } catch (error) {
    console.error("[AdminAudit] Failed to write audit log", error);
  }
}