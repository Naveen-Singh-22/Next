import Link from "next/link";
import SiteNav from "../components/SiteNav";

const roles = [
  {
    title: "Shelter Assistant",
    description:
      "Provide direct care, companionship, and enrichment for animals waiting for adoption.",
    points: ["Socializing kittens and pups", "Maintenance and feeding"],
    tone: "vol-role role-a",
  },
  {
    title: "Rescue Dispatcher",
    description:
      "Coordinate emergency rescues and transport while serving as the communication bridge.",
    points: ["Communication hub", "Logistics coordination"],
    tone: "vol-role role-b",
  },
  {
    title: "Event Support",
    description:
      "Help us advocate at community events, fundraisers, and high-impact adoption drives.",
    points: ["Community outreach", "Fundraising assistance"],
    tone: "vol-role role-c",
  },
];

const reasons = [
  {
    title: "Meaningful Connection",
    text: "Forge deep bonds with animals and like-minded advocates in your community.",
  },
  {
    title: "Skill Development",
    text: "Gain practical experience in animal behavior, emergency response, and public relations.",
  },
  {
    title: "Well-being",
    text: "Experience proven stress reduction and emotional wellness from helping companion animals.",
  },
];

export default function VolunteerPage() {
  return (
    <div className="volunteer-page">
      <SiteNav className="volunteer-nav" />

      <main>
        <section className="section-wrap volunteer-hero">
          <div className="volunteer-copy">
            <h1>
              Be the <span>Voice</span> for the Voiceless.
            </h1>
            <p>
              Join Kindred Hearth. Your time is not just a contribution; it is a
              lifeline for animals waiting for their second chance at happiness.
            </p>
            <div className="volunteer-avatars" aria-label="Active volunteers in your area">
              <span className="avatar-dot one" />
              <span className="avatar-dot two" />
              <span className="avatar-dot three" />
              <span className="avatar-dot four">+40</span>
              <small>42 Active Volunteers in your area</small>
            </div>
          </div>

          <div className="hero-photo-wrap">
            <div className="hero-photo" role="img" aria-label="Volunteers walking rescue dogs" />
            <article className="quote-float">
              <strong>Community Spirit</strong>
              <p>
                "Volunteering at Kindred Hearth changed my life as much as it
                changed theirs."
              </p>
            </article>
          </div>
        </section>

        <section className="section-wrap purpose-section">
          <h2 className="section-title">Find Your Purpose</h2>
          <p className="section-sub">Diverse roles tailored to your unique skills and passion.</p>
          <div className="role-grid">
            {roles.map((role) => (
              <article key={role.title} className={role.tone}>
                <span className="role-icon" aria-hidden="true" />
                <h3>{role.title}</h3>
                <p>{role.description}</p>
                <ul>
                  {role.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="section-wrap volunteer-main-grid">
          <aside className="volunteer-left-col">
            <h2 className="section-title">Why Volunteer?</h2>
            <div className="why-list">
              {reasons.map((reason) => (
                <article key={reason.title} className="why-item">
                  <span className="why-glyph" aria-hidden="true" />
                  <div>
                    <h3>{reason.title}</h3>
                    <p>{reason.text}</p>
                  </div>
                </article>
              ))}
            </div>

            <article className="process-card">
              <p>THE PROCESS</p>
              <h3>Joining is Simple</h3>
              <ol>
                <li>Fill out the registration form below.</li>
                <li>Short virtual orientation and background check.</li>
                <li>On-site training with your mentor.</li>
              </ol>
            </article>
          </aside>

          <section className="volunteer-form-wrap" aria-label="Volunteer registration">
            <h2>Volunteer Registration</h2>
            <p>Ready to start? Let us get some basic information.</p>

            <form className="volunteer-form" action="#" method="post">
              <div className="field-grid">
                <label>
                  Full Name
                  <input placeholder="John Doe" type="text" />
                </label>
                <label>
                  Email Address
                  <input placeholder="john@example.com" type="email" />
                </label>
              </div>

              <div className="field-grid">
                <label>
                  Phone Number
                  <input placeholder="+1 (555) 000-0000" type="tel" />
                </label>
                <label>
                  City
                  <input placeholder="San Francisco" type="text" />
                </label>
              </div>

              <label>
                Interest Area
                <select defaultValue="Shelter Assistant">
                  <option>Shelter Assistant</option>
                  <option>Rescue Dispatcher</option>
                  <option>Event Support</option>
                </select>
              </label>

              <label>
                Availability
                <textarea
                  rows={4}
                  placeholder="Tell us which days and times work best for you..."
                />
              </label>

              <button className="submit-btn" type="submit">
                Submit Application
              </button>
            </form>

            <small>
              By submitting, you agree to our privacy policy and consent to a
              preliminary background check for animal safety.
            </small>
          </section>
        </section>
      </main>

      <footer className="footer section-wrap volunteer-footer">
        <div>
          <p className="brand">thecaninehelp</p>
          <p>© 2026 thecaninehelp Animal NGO.</p>
          <p>Dedicated to advocacy and rescue.</p>
        </div>
        <div className="footer-links one-line">
          <a href="#">Terms of Service</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Contact Us</a>
          <a href="#">Careers</a>
        </div>
      </footer>
    </div>
  );
}
