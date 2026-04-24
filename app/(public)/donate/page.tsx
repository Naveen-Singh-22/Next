import SiteNav from "@/components/SiteNav";

const reasons = [
  {
    title: "Rescue Operations",
    text: "Funds emergency transport, on-site response, and field rescues for animals in immediate danger.",
  },
  {
    title: "Medical Care",
    text: "Supports surgeries, diagnostics, vaccinations, and rehabilitation for fragile and injured animals.",
  },
  {
    title: "Shelter Upkeep",
    text: "Maintains safe, clean shelter environments with food, utilities, and daily care resources.",
  },
];

export default function DonatePage() {
  return (
    <div className="donate-page">
      <SiteNav />

      <main className="section-wrap donate-main">
        <header className="donate-hero">
          <h1>Support Our Mission</h1>
          <p>
            Your generosity helps us rescue, heal, and rehome animals in need.
            Choose an amount below and stand with our rescue teams.
          </p>
        </header>

        <section className="donate-grid" aria-label="Donation details">
          <article className="donate-info-card">
            <h2>Why Donate?</h2>
            <ul className="donate-reason-list">
              {reasons.map((reason) => (
                <li key={reason.title}>
                  <h3>{reason.title}</h3>
                  <p>{reason.text}</p>
                </li>
              ))}
            </ul>

            <figure className="donate-photo-card">
              <img
                src="/images/unsplash/05.jpg"
                alt="Two rescued dogs"
                loading="lazy"
              />
              <figcaption>Over 1,200 animals successfully rehomed last year.</figcaption>
            </figure>
          </article>

          <article className="donate-form-card">
            <h2>Make a Donation</h2>
            <form className="donate-form" action="/donate" method="get">
              <div className="donate-form-grid">
                <label>
                  Full Name
                  <input type="text" name="name" placeholder="Jane Doe" required />
                </label>
                <label>
                  Email Address
                  <input type="email" name="email" placeholder="jane@example.com" required />
                </label>
              </div>

              <label>
                Phone Number
                <input type="tel" name="phone" placeholder="+1 (555) 000-0000" />
              </label>

              <div className="donate-amount-row" role="group" aria-label="Suggested donation amounts">
                <button type="button">$10</button>
                <button type="button" className="active">
                  $25
                </button>
                <button type="button">$50</button>
                <button type="button">$100</button>
              </div>

              <input type="number" name="amount" min="1" step="1" placeholder="Enter custom amount" required />

              <label className="donate-check">
                <input type="checkbox" defaultChecked />
                I&apos;d like to cover processing fees so more goes to animal care.
              </label>

              <button className="donate-submit" type="submit">
                Donate Now
              </button>

              <p className="donate-note">Secure SSL encrypted. Donation records available for tax reporting.</p>
            </form>
          </article>
        </section>
      </main>
    </div>
  );
}