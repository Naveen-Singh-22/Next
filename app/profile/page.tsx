import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SiteNav from "@/components/SiteNav";
import ProfilePage from "@/components/ProfilePage";
import { ADMIN_AUTH_COOKIE } from "@/lib/adminAuth";
import { AUTH_EMAIL_COOKIE, AUTH_ROLE_COOKIE, normalizeAuthRole } from "@/lib/auth";
import { getProfileSnapshot } from "@/lib/profileData";

export const dynamic = "force-dynamic";

export default async function ProfileRoute() {
  const cookieStore = await cookies();
  const rawRole = cookieStore.get(AUTH_ROLE_COOKIE)?.value ?? null;
  const adminCookie = cookieStore.get(ADMIN_AUTH_COOKIE)?.value === "1";
  const role = normalizeAuthRole(rawRole) ?? (adminCookie ? "admin" : null);
  const email = cookieStore.get(AUTH_EMAIL_COOKIE)?.value ?? null;

  if (!role || !email) {
    redirect("/login?next=/profile");
  }

  if (role === "admin") {
    redirect("/admin");
  }

  const snapshot = await getProfileSnapshot(email);

  return (
    <div className="profile-page-shell">
      <SiteNav />
      <ProfilePage snapshot={snapshot} email={email} />
    </div>
  );
}