import Image from "next/image";
import Link from "next/link";
import ScrollReveal from "@/components/ScrollReveal";
import type { ProfileSnapshot } from "@/lib/profileData";

type ProfilePageProps = {
  snapshot: ProfileSnapshot;
  email: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function statusLabel(value: string) {
  return value
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function profileStatusClass(value: string) {
  const normalized = value.toLowerCase();

  if (normalized.includes("approve") || normalized.includes("success") || normalized === "adopted") {
    return "success";
  }

  if (normalized.includes("pending") || normalized.includes("review") || normalized.includes("applied")) {
    return "pending";
  }

  if (normalized.includes("decline") || normalized.includes("reject")) {
    return "danger";
  }

  return "neutral";
}

function EmptyState({ title, description, href, cta }: { title: string; description: string; href: string; cta: string }) {
  return (
    <div className="profile-empty-state">
      <h3>{title}</h3>
      <p>{description}</p>
      <Link className="pill-btn solid pill-link" href={href}>
        {cta}
      </Link>
    </div>
  );
}

export default function ProfilePage({ snapshot, email }: ProfilePageProps) {
  const user = snapshot.user;
  const resolvedEmail = user?.email ?? email;
  const displayName = user?.name?.trim() || "Community Member";
  const roleLabel = user?.role ? statusLabel(user.role) : "Donor";
  const memberSince = user?.createdAt ? formatDate(user.createdAt) : "Recently";

  const totalDonations = snapshot.donations.reduce((sum, donation) => sum + donation.amount, 0);
  const volunteerCount = snapshot.volunteerApplications.length;
  const adoptionCount = snapshot.adoptionRequests.length;
  const impactProgress = Math.min(92, Math.max(18, 18 + totalDonations / 250 + volunteerCount * 8 + adoptionCount * 10));

  const latestAnimal = snapshot.adoptionRequests[0]?.animalImage ?? "/images/unsplash/05.jpg";
  const latestAnimalName = snapshot.adoptionRequests[0]?.animalName ?? "Your rescue journey";
  const latestAnimalCity = snapshot.adoptionRequests[0]?.city ?? "TheCanineHelp community";
  const latestDonation = snapshot.donations[0];
  const latestVolunteer = snapshot.volunteerApplications[0];

  return (
    <div className="profile-page">
      <div className="profile-page-orb profile-page-orb-left" aria-hidden="true" />
      <div className="profile-page-orb profile-page-orb-right" aria-hidden="true" />

      <main className="profile-main" aria-label="User profile page">
        <ScrollReveal as="section" className="section-wrap profile-hero">
          <div className="profile-hero-card profile-panel profile-hero-profile">
            <div className="profile-hero-avatar-wrap">
              <div className="profile-hero-avatar">
                <span>{initials(displayName)}</span>
              </div>
              <div className="profile-hero-photo">
                <Image src={latestAnimal} alt={latestAnimalName} fill sizes="240px" />
              </div>
            </div>

            <div className="profile-hero-copy">
              <p className="profile-kicker">Member dashboard</p>
              <h1>{displayName}</h1>
              <p className="profile-location">{latestAnimalCity} • {resolvedEmail}</p>

              <div className="profile-hero-meta">
                <div>
                  <span>Email address</span>
                  <strong>{resolvedEmail}</strong>
                </div>
                <div>
                  <span>Role</span>
                  <strong>{roleLabel}</strong>
                </div>
                <div>
                  <span>Member since</span>
                  <strong>{memberSince}</strong>
                </div>
              </div>
            </div>

            <div className="profile-hero-actions">
              <Link className="pill-btn solid pill-link" href="#settings">
                Edit Profile
              </Link>
              <Link className="pill-btn subtle pill-link" href="/api/auth/logout">
                Sign Out
              </Link>
            </div>
          </div>
        </ScrollReveal>

        <section className="section-wrap profile-summary-grid" aria-label="Profile summary">
          <ScrollReveal as="article" className="profile-stat-card profile-panel" delayMs={40}>
            <span className="profile-stat-label">Donation total</span>
            <strong>{formatCurrency(totalDonations)}</strong>
            <small>{snapshot.donations.length} recorded donation{snapshot.donations.length === 1 ? "" : "s"}</small>
          </ScrollReveal>

          <ScrollReveal as="article" className="profile-stat-card profile-panel" delayMs={120}>
            <span className="profile-stat-label">Adoption requests</span>
            <strong>{adoptionCount}</strong>
            <small>{adoptionCount === 1 ? "1 request in review" : `${adoptionCount} requests on file`}</small>
          </ScrollReveal>

          <ScrollReveal as="article" className="profile-stat-card profile-panel" delayMs={200}>
            <span className="profile-stat-label">Volunteer applications</span>
            <strong>{volunteerCount}</strong>
            <small>{volunteerCount === 1 ? "1 volunteer application" : `${volunteerCount} volunteer applications`}</small>
          </ScrollReveal>

          <ScrollReveal as="article" className="profile-impact-card profile-panel" delayMs={280}>
            <div className="profile-impact-head">
              <span>Your impact</span>
              <strong>{Math.round(impactProgress)}%</strong>
            </div>
            <p>Support grows as you donate, apply to adopt, and volunteer with the rescue team.</p>
            <div className="profile-progress" aria-hidden="true">
              <span style={{ width: `${impactProgress}%` }} />
            </div>
            <small>Every action helps animals move closer to care and placement.</small>
          </ScrollReveal>
        </section>

        <section className="section-wrap profile-grid">
          <div className="profile-main-column">
            <ScrollReveal as="article" className="profile-panel profile-records-card" delayMs={80}>
              <div className="profile-section-head">
                <div>
                  <p className="profile-kicker">Adoption requests</p>
                  <h2>Requests that belong to you</h2>
                </div>
                <Link href="/adopt">Find more animals</Link>
              </div>

              {snapshot.adoptionRequests.length > 0 ? (
                <div className="profile-request-list">
                  {snapshot.adoptionRequests.map((request) => (
                    <article className="profile-request-card" key={request.id}>
                      <div className="profile-request-image">
                        <Image src={request.animalImage} alt={request.animalName} fill sizes="140px" />
                      </div>
                      <div className="profile-request-copy">
                        <div className="profile-request-topline">
                          <h3>{request.animalName}</h3>
                          <span className={`profile-pill ${profileStatusClass(request.status)}`}>{statusLabel(request.status)}</span>
                        </div>
                        <p>{request.animalSpecies} • {request.city}</p>
                        <small>{formatDate(request.createdAt)}</small>
                        <blockquote>{request.message}</blockquote>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No adoption request yet"
                  description="Your adoption requests will appear here after you submit an adoption form."
                  href="/adopt"
                  cta="Browse Animals"
                />
              )}
            </ScrollReveal>

            <ScrollReveal as="article" className="profile-panel profile-records-card" delayMs={160}>
              <div className="profile-section-head">
                <div>
                  <p className="profile-kicker">Donation history</p>
                  <h2>How you have supported rescue work</h2>
                </div>
                <Link href="/donate">Donate again</Link>
              </div>

              {snapshot.donations.length > 0 ? (
                <div className="profile-table-wrap">
                  <table className="profile-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Purpose</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {snapshot.donations.map((donation) => (
                        <tr key={donation.id}>
                          <td>{formatDate(donation.createdAt)}</td>
                          <td>Rescue support</td>
                          <td>{formatCurrency(donation.amount)}</td>
                          <td><span className="profile-pill success">Successful</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState
                  title="No donation history yet"
                  description="When you make a donation, it will show up here with the amount and date."
                  href="/donate"
                  cta="Donate Now"
                />
              )}
            </ScrollReveal>

            <ScrollReveal as="article" className="profile-panel profile-records-card" delayMs={240}>
              <div className="profile-section-head">
                <div>
                  <p className="profile-kicker">Volunteer history</p>
                  <h2>Your volunteer applications</h2>
                </div>
                <Link href="/volunteer">Apply again</Link>
              </div>

              {snapshot.volunteerApplications.length > 0 ? (
                <div className="profile-table-wrap">
                  <table className="profile-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Interest area</th>
                        <th>City</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {snapshot.volunteerApplications.map((application) => (
                        <tr key={application.id}>
                          <td>{formatDate(application.createdAt)}</td>
                          <td>{application.interestArea}</td>
                          <td>{application.city}</td>
                          <td><span className="profile-pill pending">{statusLabel(application.status)}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState
                  title="No volunteer applications yet"
                  description="Volunteer submissions are stored here once you apply with your account email."
                  href="/volunteer"
                  cta="Volunteer Now"
                />
              )}
            </ScrollReveal>
          </div>

          <aside className="profile-side-column">
            <ScrollReveal as="article" className="profile-panel profile-side-card" delayMs={120}>
              <p className="profile-kicker">Latest activity</p>
              <h2>Quick snapshot</h2>
              <div className="profile-side-stack">
                <div>
                  <span>Newest donation</span>
                  <strong>{latestDonation ? formatCurrency(latestDonation.amount) : "No donations yet"}</strong>
                  <small>{latestDonation ? formatDate(latestDonation.createdAt) : "Make a contribution to start your history"}</small>
                </div>
                <div>
                  <span>Newest volunteer entry</span>
                  <strong>{latestVolunteer ? latestVolunteer.interestArea : "No volunteer record"}</strong>
                  <small>{latestVolunteer ? `${latestVolunteer.city} • ${formatDate(latestVolunteer.createdAt)}` : "Apply to volunteer to see it here"}</small>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal as="article" className="profile-panel profile-side-card" delayMs={200}>
              <p className="profile-kicker">Account settings</p>
              <h2 id="settings">Manage your account</h2>
              <div className="profile-settings-list">
                <Link href="/donate">Donation methods</Link>
                <Link href="/volunteer">Volunteer preferences</Link>
                <Link href="/adopt">Browse adoption</Link>
                <Link href="/api/auth/logout">Log out</Link>
              </div>
            </ScrollReveal>

            <ScrollReveal as="article" className="profile-panel profile-side-spotlight" delayMs={280}>
              <p>You&apos;re making a difference.</p>
              <h2>{totalDonations > 0 ? `You have donated ${formatCurrency(totalDonations)} so far.` : "Start your impact journey today."}</h2>
              <small>Adoption requests, donations, and volunteer applications stay in one place for quick review.</small>
            </ScrollReveal>
          </aside>
        </section>
      </main>
    </div>
  );
}