export async function ensureLoggedIn(nextPath: string, preferredRole: "donor" | "volunteer" | "admin" = "donor") {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const response = await fetch("/api/auth/session", { cache: "no-store" });
    const payload = (await response.json().catch(() => null)) as { authenticated?: boolean } | null;

    if (response.ok && payload?.authenticated) {
      return true;
    }
  } catch {
    // Redirect below.
  }

  window.location.assign(`/login?role=${preferredRole}&next=${encodeURIComponent(nextPath)}`);
  return false;
}
