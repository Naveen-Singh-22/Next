import Link from "next/link";
import SiteNav from "./components/SiteNav";

export default function Home() {
  const stats = [
    { value: "2,400+", label: "Animals Rescued" },
    { value: "1,850+", label: "Adoptions" },
    { value: "450", label: "Active Volunteers" },
    { value: "3,200+", label: "Treatments" },
  ];

  const programs = [
    {
      title: "Emergency Rescue",
      description:
        "24/7 rapid response for animals in critical danger, from roadside injuries to flood zones.",
      tone: "program-card rescue",
      href: "/rescue",
      link: "Report Now",
    },
    {
      title: "Specialized Medical Care",
      description:
        "In-house surgery and trauma rehabilitation with custom recovery plans for each rescued animal.",
      tone: "program-card medical",
      href: "#",
      link: "Learn more",
    },
    {
      title: "Adoption Program",
      description:
        "Careful matching, home checks, and post-adoption support to build lifelong bonds.",
      tone: "program-card adoption",
      href: "/adopt",
      link: "View gallery",
    },
    {
      title: "Education & Advocacy",
      description:
        "Community outreach in schools and neighborhoods to prevent cruelty and promote empathy.",
      tone: "program-card advocacy",
      href: "#",
      link: "Learn more",
    },
  ];

  return (
    <div className="home-page">
      <SiteNav />

      <main>
        <section className="hero section-wrap">
          <div className="hero-copy">
            <p className="eyebrow">Rescue Mission 2026</p>
            <h1>
              Every Life <span>Deserves</span> a Second Chance
            </h1>
            <p>
              Join us in our mission to rescue, heal, and rehome animals in need.
              We are the voice for those who cannot speak.
            </p>
            <div className="button-row">
              <button className="pill-btn solid" type="button">
                Donate Now
              </button>
              <Link className="pill-btn subtle pill-link" href="/rescue">
                Report Rescue
              </Link>
            </div>
          </div>

          <div className="hero-art" role="img" aria-label="Rescued golden retriever" />
        </section>

        <section className="section-wrap stat-grid" aria-label="Impact statistics">
          {stats.map((item) => (
            <article key={item.label} className="stat-card">
              <h3>{item.value}</h3>
              <p>{item.label}</p>
            </article>
          ))}
        </section>

        <section className="section-wrap">
          <h2 className="section-title">Our Core Programs</h2>
          <div className="program-grid">
            {programs.map((program) => (
              <article key={program.title} className={program.tone}>
                <h3>{program.title}</h3>
                <p>{program.description}</p>
                <Link href={program.href}>{program.link}</Link>
              </article>
            ))}
          </div>
        </section>

        <section className="section-wrap">
          <h2 className="section-title center">Transformed Lives</h2>
          <p className="section-sub center">
            See the difference your support makes. Meet Luna.
          </p>
          <div className="story-pair">
            <article className="story-card before">
              <span>Before</span>
              <h3>Found: January 12</h3>
              <p>Severely malnourished, wandering in an industrial park.</p>
            </article>
            <article className="story-card after">
              <span>After</span>
              <h3>Today: Happy &amp; Loved</h3>
              <p>
                Luna now lives with a caring family and spends weekends at the
                beach.
              </p>
            </article>
          </div>
        </section>

        <section className="section-wrap cta-wrap">
          <h2>Ready to make a difference?</h2>
          <p>
            Your donation provides food, medical care, and safe shelter for
            animals who have nowhere else to go.
          </p>
          <div className="button-row center-row">
            <button className="pill-btn subtle light" type="button">
              Give Now
            </button>
            <Link className="pill-btn ghost pill-link" href="/admin">
              Admin Portal
            </Link>
            <Link className="pill-btn subtle pill-link" href="/inventory">
              Animal Inventory
            </Link>
          </div>
        </section>
      </main>

      <footer className="footer section-wrap">
        <div>
          <p className="brand">thecaninehelp</p>
          <p>Dedicated to rescue and rehabilitation of animals worldwide.</p>
        </div>
        <div className="footer-links">
          <a href="#">Contact Us</a>
          <a href="#">Terms of Service</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Social Media</a>
        </div>
      </footer>
    </div>
  );
}
