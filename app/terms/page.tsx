import SiteFooter from "@/components/SiteFooter";
import SiteNav from "@/components/SiteNav";

export default function TermsPage() {
  return (
    <div className="terms-page">
      <SiteNav />
      <main className="profile-main">
        <section className="section-wrap profile-panel profile-records-card">
          <p className="profile-kicker">Terms of Service</p>
          <h1>Terms placeholder</h1>
          <p>
            This page is a placeholder for the Terms of Service. It can later
            be replaced with the final legal copy for TheCanineHelp.
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}