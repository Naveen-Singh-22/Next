import SiteNav from "@/components/SiteNav";

const reports = [
  {
    title: "2023 Impact Report",
    text: "A deep dive into our rescue statistics, regional expansion, and survivor stories.",
  },
  {
    title: "Financial Statement",
    text: "Verified by independent auditors, outlining our revenue and expense streams.",
  },
  {
    title: "Rescue Map",
    text: "Visualizing our footprint across 14 counties and international partnerships.",
  },
];

export default function ImpactPage() {
  return (
    <div className="impact-page">
      <SiteNav className="impact-nav" />

      <main>
        <section className="section-wrap impact-hero">
          <div className="impact-copy">
            <h1>
              Metrics of <span>Mercy</span>
            </h1>
            <p>
              The tangible results of collective compassion. Every number below
              represents a heartbeat sustained, a home found, and a life
              transformed through the unwavering support of Kindred Hearth.
            </p>
          </div>

          <div className="impact-hero-media">
            <div className="impact-hero-image" role="img" aria-label="Golden retriever portrait" />
            <article className="impact-hero-note">
              <p>THE LIVING IMPACT</p>
              <small>"The data is in the wagging tails."</small>
            </article>
          </div>
        </section>

        <section className="section-wrap impact-stats-grid" aria-label="Impact metric cards">
          <article className="impact-stat-card featured">
            <h2>2,400+</h2>
            <p>Lives pulled from the brink through our rescue missions.</p>
          </article>

          <article className="impact-stat-card soft">
            <h2>1,850+</h2>
            <p>Adoptions completed into forever families.</p>
          </article>

          <article className="impact-stat-card warm">
            <h2>450+</h2>
            <p>Active volunteers dedicating their time daily.</p>
          </article>

          <article className="impact-stat-card soft large">
            <h2>3,200+</h2>
            <p>Specialized medical treatments provided in our clinics.</p>
          </article>

          <article className="impact-stat-card efficiency">
            <h3>Efficiency of Care</h3>
            <p>
              For every $1 donated, 87¢ goes directly to veterinary care and
              rescue logistics. We maintain transparency to honor your trust.
            </p>
            <div className="impact-progress" aria-label="Aid distribution percentage">
              <div />
            </div>
            <div className="impact-progress-notes">
              <span>Direct Aid 87%</span>
              <span>Admin 13%</span>
            </div>
          </article>
        </section>

        <section className="section-wrap impact-story">
          <div className="impact-story-image" role="img" aria-label="Rescued puppy" />
          <article className="impact-story-copy">
            <p>FEATURED TRANSFORMATION</p>
            <h2>The Story of Scout: From Shadow to Sunshine.</h2>
            <small>
              Scout was found abandoned in an industrial park, underweight and
              fearful. Today, after three months of rehabilitation and a
              life-saving surgery funded by donors like you, he is the therapy
              dog for a local pediatric wing.
            </small>
            <a href="#">Read Scout&apos;s Full Journal →</a>
          </article>
        </section>

        <section className="impact-transparency">
          <div className="section-wrap">
            <h2 className="section-title center">Our Commitment to Transparency</h2>
            <p className="section-sub center">
              Data-driven advocacy means being open about how every resource is
              deployed. Explore our annual impact reports and financial
              disclosures.
            </p>
            <div className="impact-report-grid">
              {reports.map((report) => (
                <article key={report.title} className="impact-report-card">
                  <h3>{report.title}</h3>
                  <p>{report.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section-wrap impact-cta">
          <h2>Ready to grow these numbers?</h2>
          <p>
            Your donation is the catalyst. Choose to be a part of next year&apos;s
            metrics.
          </p>
          <div className="impact-cta-actions">
            <button className="pill-btn solid" type="button">
              Become a Monthly Guardian
            </button>
            <button className="pill-btn impact-alt" type="button">
              One-Time Impact Gift
            </button>
          </div>
        </section>
      </main>

    </div>
  );
}

