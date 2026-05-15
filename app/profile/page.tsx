import { redirect } from "next/navigation";
import SiteNav from "@/components/SiteNav";
import ProfilePage from "@/components/ProfilePage";
import { getCurrentUser } from "@/lib/auth";
import { getProfileSnapshot } from "@/lib/profileData";

export const dynamic = "force-dynamic";

export default async function ProfileRoute() {
  const user = await getCurrentUser();
  const email = user?.email ?? null;

  if (!email) {
    redirect("/login?next=/profile");
  }

  const snapshot = await getProfileSnapshot(email);

  return (
    <div className="profile-page-shell">
      <SiteNav />
      <ProfilePage snapshot={snapshot} email={email} />
    </div>
  );
}