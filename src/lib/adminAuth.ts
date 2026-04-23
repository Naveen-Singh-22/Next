export const ADMIN_AUTH_COOKIE = "tch_admin_auth";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8;

const FALLBACK_ADMIN_EMAIL = "admin@thecaninehelp.org";
const FALLBACK_ADMIN_PASSWORD = "admin123";

export function isValidAdminCredentials(email: string, password: string): boolean {
  const expectedEmail = (process.env.ADMIN_EMAIL ?? FALLBACK_ADMIN_EMAIL).trim().toLowerCase();
  const expectedPassword = process.env.ADMIN_PASSWORD ?? FALLBACK_ADMIN_PASSWORD;

  return email.trim().toLowerCase() === expectedEmail && password === expectedPassword;
}
