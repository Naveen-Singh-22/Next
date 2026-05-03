import SiteFooter from "@/components/SiteFooter";
import SiteNav from "@/components/SiteNav";

export default function PrivacyPage() {
  return (
    <div className="profile-page-shell">
      <SiteNav />
      <main className="profile-main">
        <section className="section-wrap profile-panel profile-records-card">
          <p className="profile-kicker">Privacy Policy</p>
          <h1>Privacy placeholder</h1>
          <p>
            This page is a placeholder for the Privacy Policy. It can later be
            replaced with the final privacy copy for TheCanineHelp.
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}