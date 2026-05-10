import { cookies } from "next/headers";
import { AUTH_EMAIL_COOKIE, AUTH_ROLE_COOKIE, type AuthRole } from "@/lib/auth";
import { AuthenticationError, AuthorizationError } from "@/lib/apiErrors";

export interface AuthContext {
  email: string;
  role: AuthRole;
}

/**
 * Get the current authenticated user from cookies
 * @throws AuthenticationError if user is not authenticated
 */
export async function getAuthContext(): Promise<AuthContext> {
  const cookieStore = await cookies();
  const email = cookieStore.get(AUTH_EMAIL_COOKIE)?.value;
  const role = cookieStore.get(AUTH_ROLE_COOKIE)?.value;

  if (!email || !role) {
    throw new AuthenticationError("Not authenticated. Please login first.");
  }

  // Validate role
  if (!["admin", "donor", "volunteer"].includes(role)) {
    throw new AuthenticationError("Invalid authentication state.");
  }

  return {
    email,
    role: role as AuthRole,
  };
}

/**
 * Check if the current user has a specific role
 * @throws AuthenticationError if user is not authenticated
 * @throws AuthorizationError if user doesn't have the required role
 */
export async function requireRole(requiredRole: AuthRole | AuthRole[]): Promise<AuthContext> {
  const auth = await getAuthContext();

  const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

  if (!allowedRoles.includes(auth.role)) {
    throw new AuthorizationError(
      `This action requires one of these roles: ${allowedRoles.join(", ")}`
    );
  }

  return auth;
}

/**
 * Check if current user is authenticated (can be any role)
 * @throws AuthenticationError if user is not authenticated
 */
export async function requireAuth(): Promise<AuthContext> {
  return getAuthContext();
}

/**
 * Check if current user is an admin
 * @throws AuthenticationError if user is not authenticated
 * @throws AuthorizationError if user is not an admin
 */
export async function requireAdmin(): Promise<AuthContext> {
  return requireRole("admin");
}

/**
 * Optionally get auth context (returns null if not authenticated)
 */
export async function getAuthContextOptional(): Promise<AuthContext | null> {
  try {
    return await getAuthContext();
  } catch {
    return null;
  }
}
