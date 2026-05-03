import SiteNav from "@/components/SiteNav";
import ScrollReveal from "@/components/ScrollReveal";
import VolunteerApplicationForm from "@/components/VolunteerApplicationForm";

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
      <SiteNav />

      <main>
        <ScrollReveal as="section" className="section-wrap volunteer-hero">
          <div className="volunteer-copy">
            <h1 className="reveal-item">
              Be the <span>Voice</span> for the Voiceless.
            </h1>
            <p className="reveal-item">
              Join Kindred Hearth. Your time is not just a contribution; it is a
              lifeline for animals waiting for their second chance at happiness.
            </p>
            <div className="volunteer-avatars reveal-item" aria-label="Active volunteers in your area">
              <span className="avatar-dot one" />
              <span className="avatar-dot two" />
              <span className="avatar-dot three" />
              <span className="avatar-dot four">+40</span>
              <small>42 Active Volunteers in your area</small>
            </div>
          </div>

          <div className="hero-photo-wrap reveal-item">
            <div className="hero-photo vol-float" role="img" aria-label="Volunteers walking rescue dogs" />
            <article className="quote-float vol-bob">
              <strong>Community Spirit</strong>
              <p>
                &quot;Volunteering at Kindred Hearth changed my life as much as it
                changed theirs.&quot;
              </p>
            </article>
          </div>
        </ScrollReveal>

        <ScrollReveal as="section" className="section-wrap purpose-section" delayMs={80}>
          <h2 className="section-title reveal-item">Find Your Purpose</h2>
          <p className="section-sub reveal-item">Diverse roles tailored to your unique skills and passion.</p>
          <div className="role-grid">
            {roles.map((role) => (
              <article key={role.title} className={`${role.tone} reveal-item`}>
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
        </ScrollReveal>

        <ScrollReveal as="section" className="section-wrap volunteer-main-grid" delayMs={120}>
          <aside className="volunteer-left-col">
            <h2 className="section-title reveal-item">Why Volunteer?</h2>
            <div className="why-list">
              {reasons.map((reason) => (
                <article key={reason.title} className="why-item reveal-item">
                  <span className="why-glyph" aria-hidden="true" />
                  <div>
                    <h3>{reason.title}</h3>
                    <p>{reason.text}</p>
                  </div>
                </article>
              ))}
            </div>

            <article className="process-card reveal-item">
              <p>THE PROCESS</p>
              <h3>Joining is Simple</h3>
              <ol>
                <li>Fill out the registration form below.</li>
                <li>Short virtual orientation and background check.</li>
                <li>On-site training with your mentor.</li>
              </ol>
            </article>
          </aside>

          <section className="volunteer-form-wrap reveal-item" aria-label="Volunteer registration">
            <h2 className="reveal-item">Volunteer Registration</h2>
            <p className="reveal-item">Ready to start? Let us get some basic information.</p>

            <VolunteerApplicationForm />

            <small>
              By submitting, you agree to our privacy policy and consent to a
              preliminary background check for animal safety.
            </small>
          </section>
        </ScrollReveal>
      </main>

    </div>
  );
}

