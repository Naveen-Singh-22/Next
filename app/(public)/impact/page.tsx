import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import ScrollReveal from "@/components/ScrollReveal";

export default function ImpactPage() {
  return (
    <div className="impact-page">
      <SiteNav />

      <main>
        <ScrollReveal as="section" className="section-wrap impact-hero" delayMs={40}>
          <div className="impact-copy">
            <h1>
              Rescue Progress You Can <span>See.</span>
            </h1>
            <p>
              Every adoption, treatment, and rescue response is tracked so our
              community can follow real outcomes, not just headlines.
            </p>
          </div>

          <div className="impact-hero-media">
            <div className="impact-hero-image reveal-item" role="img" aria-label="Rescue team with adopted dogs" />
            <article className="impact-hero-note reveal-item">
              <p>THIS YEAR SO FAR</p>
              <small>1,248 animals moved from crisis care to stable homes.</small>
            </article>
          </div>
        </ScrollReveal>

        <ScrollReveal as="section" className="section-wrap impact-stats-grid" aria-label="Impact statistics" delayMs={80}>
          <article className="impact-stat-card featured reveal-item">
            <h2>1,248</h2>
            <p>Animals rescued, treated, and moved into foster or adoptive care this year.</p>
          </article>

          <article className="impact-stat-card soft reveal-item">
            <h2>96%</h2>
            <p>Vaccination completion rate across all current intakes.</p>
          </article>

          <article className="impact-stat-card warm reveal-item">
            <h2>73%</h2>
            <p>Of rescue alerts receive first response within two hours.</p>
          </article>

          <article className="impact-stat-card soft large reveal-item">
            <h2>18 Days</h2>
            <p>Average time from intake to readiness review for adoption matching.</p>
          </article>

          <article className="impact-stat-card efficiency reveal-item">
            <h3>Funding Efficiency</h3>
            <p>87% of all donations directly support rescue operations, medical care, and rehabilitation.</p>
            <div className="impact-progress" aria-label="Funding allocation progress bar">
              <div />
            </div>
            <div className="impact-progress-notes">
              <span>Program Use</span>
              <span>Operations</span>
            </div>
          </article>
        </ScrollReveal>

        <ScrollReveal as="section" className="section-wrap impact-story" delayMs={120}>
          <div className="impact-story-image reveal-item" role="img" aria-label="Animal recovery journey" />
          <article className="impact-story-copy reveal-item">
            <p>FEATURED TRANSFORMATION</p>
            <h2>Luna&apos;s recovery and rehoming story.</h2>
            <small>
              Found malnourished and scared, Luna completed treatment,
              regained confidence, and is now ready for a permanent family.
            </small>
            <Link href="/adopt/luna"><button type="button" className="impact-journal-trigger" aria-expanded="false" aria-controls="animal-journal">Read Luna's Full Journal →</button></Link>
          </article>
        </ScrollReveal>

        <ScrollReveal as="section" className="impact-transparency" delayMs={160}>
          <div className="section-wrap">
            <h2 className="section-title center">Transparency Report</h2>
            <p className="section-sub center">
              We publish operational metrics monthly so donors, volunteers, and
              adopters can track impact with full clarity.
            </p>
            <div className="impact-report-grid">
              <article className="impact-report-card reveal-item">
                <h3>Medical Care</h3>
                <p>Vaccinations, diagnostics, surgery, and post-op support for high-risk rescues.</p>
              </article>
              <article className="impact-report-card reveal-item">
                <h3>Shelter & Foster</h3>
                <p>Nutrition, enrichment, and safe temporary housing while animals stabilize.</p>
              </article>
              <article className="impact-report-card reveal-item">
                <h3>Placement Support</h3>
                <p>Adopter screening, matching, and post-adoption follow-ups to improve retention.</p>
              </article>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal as="section" className="impact-cta" delayMs={200}>
          <h2>Help us scale this impact.</h2>
          <p>
            Join as a donor, adopter, or volunteer to extend care to more
            animals waiting for their second chance.
          </p>
          <div className="impact-cta-actions">
            <Link className="pill-btn solid pill-link" href="/donate">
              Donate Now
            </Link>
            <Link className="pill-btn impact-alt pill-link" href="/adopt">
              Meet Adoptable Animals
            </Link>
          </div>
        </ScrollReveal>
      </main>
    </div>
  );
}
