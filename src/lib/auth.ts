export type AuthRole = "admin" | "donor" | "volunteer";

export const AUTH_ROLE_COOKIE = "tch_auth_role";
export const AUTH_EMAIL_COOKIE = "tch_auth_email";
export const AUTH_SESSION_MAX_AGE = 60 * 60 * 8;

export function normalizeAuthRole(value: string | null | undefined): AuthRole | null {
  if (value === "admin" || value === "donor" || value === "volunteer") {
    return value;
  }

  return null;
}

export function sanitizeAuthNextPath(nextPath: string | null, fallbackPath: string) {
  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("/login") || nextPath.startsWith("/admin/login")) {
    return fallbackPath;
  }

  return nextPath;
}

export function resolveLoginDestination(role: AuthRole, nextPath: string | null) {
  const fallbackPath = role === "admin" ? "/admin" : "/";
  const sanitizedPath = sanitizeAuthNextPath(nextPath, fallbackPath);

  if (role !== "admin") {
    if (sanitizedPath.startsWith("/admin")) {
      return "/";
    }

    return sanitizedPath;
  }

  if (!sanitizedPath.startsWith("/admin")) {
    return "/admin";
  }

  return sanitizedPath;
}
