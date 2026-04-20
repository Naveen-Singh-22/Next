import SiteNav from "../components/SiteNav";

const timeline = [
  {
    year: "2014",
    title: "The First Hearth",
    text: "A single abandoned warehouse in Portland was transformed into our first specialized rescue center. We focused on the unadoptables, animals with trauma that required high-end behavioral curation.",
  },
  {
    year: "2018",
    title: "The Editorial Shift",
    text: "Launching our advocacy journal, we began documenting the rescue process through high-end photography, changing the public perception from pity to partnership.",
  },
  {
    year: "Today",
    title: "A National Compassion Network",
    text: "Now operating across 12 states, Kindred Hearth sets the gold standard for animal advocacy, blending medical excellence with premium foster experiences.",
  },
];

const values = [
  {
    title: "Radical Transparency",
    text: "We provide full clarity on where every dollar goes. From surgery suites to sustainable kibble, our donors see the direct impact of their investment in life.",
    tone: "about-value-card strong",
  },
  {
    title: "Dignity-First Care",
    text: "Every animal is treated as a unique individual with a history. We do not just house animals; we curate their recovery.",
    tone: "about-value-card neutral",
  },
  {
    title: "Advocacy through Art",
    text: "We believe beautiful storytelling is the most powerful tool for systemic change in animal welfare legislation.",
    tone: "about-value-card cool",
  },
  {
    title: "Human-Animal Partnership",
    text: "We recognize that saving an animal often saves a human. Our programs focus on the symbiotic healing that happens at both ends of the leash.",
    tone: "about-value-card warm",
  },
];

const team = [
  {
    name: "Dr. Elena Vance",
    role: "Executive Director",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "Marcus Thorne",
    role: "Chief Medical Officer",
    image:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "Sarah Jenkins",
    role: "Creative Director",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "David Chen",
    role: "Head of Operations",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=700&q=80",
  },
];

export default function AboutPage() {
  return (
    <div className="about-page">
      <SiteNav className="about-nav" />

      <main>
        <section className="section-wrap about-hero">
          <div className="about-copy">
            <p className="about-pill">OUR GENESIS</p>
            <h1>
              Advocacy with <span>Soul.</span>
            </h1>
            <p>
              Kindred Hearth was not born in a boardroom. It was founded in the
              quiet corners of rescue shelters, fueled by the belief that every
              animal deserves a curated life of dignity and care.
            </p>
          </div>

          <div className="about-hero-media">
            <div className="about-hero-image" role="img" aria-label="Golden dog by a window" />
            <article className="about-hero-note">
              <h3>12k+</h3>
              <p>Animals transitioned from crisis to comfort since our founding in 2014.</p>
            </article>
          </div>
        </section>

        <section className="about-story-section">
          <div className="section-wrap about-story-grid">
            <div className="about-story-copy">
              <h2>Our Story</h2>
              <div className="story-underline" />
              <p>
                We started as a small collective of journalists and veterinarians
                who realized that the stories being told about animal rescue were
                missing the human-animal bond&apos;s transformative power.
              </p>
            </div>

            <div className="about-timeline" aria-label="Organization timeline">
              {timeline.map((item) => (
                <article key={item.title} className="about-timeline-row">
                  <span>{item.year}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section-wrap about-values">
          <h2 className="section-title center">Values that Guide Us</h2>
          <p className="section-sub center">
            Our methodology is built on four pillars of integrity, designed to
            elevate the standard of care in the NGO sector.
          </p>

          <div className="about-values-grid">
            {values.map((value) => (
              <article key={value.title} className={value.tone}>
                <span className="about-value-icon" aria-hidden="true" />
                <h3>{value.title}</h3>
                <p>{value.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section-wrap about-team">
          <div className="about-team-head">
            <div>
              <h2 className="section-title">The Curators of Care</h2>
              <p className="section-sub">A multidisciplinary team of experts dedicated to the mission.</p>
            </div>
            <a href="#">Join the Team →</a>
          </div>

          <div className="about-team-grid">
            {team.map((member) => (
              <article key={member.name} className="about-person-card">
                <div
                  className="about-person-photo"
                  style={{ backgroundImage: `url(${member.image})` }}
                  role="img"
                  aria-label={member.name}
                />
                <h3>{member.name}</h3>
                <p>{member.role}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section-wrap about-subscribe">
          <div>
            <h2>Stay Connected to the Cause</h2>
            <p>
              Receive our monthly editorial digest featuring success stories and
              advocacy insights.
            </p>
          </div>
          <form action="#" method="post" className="about-subscribe-form">
            <input type="email" placeholder="Enter your email" aria-label="Enter your email" />
            <button type="submit" className="pill-btn solid">
              Subscribe
            </button>
          </form>
        </section>
      </main>

    </div>
  );
}
