import Link from "next/link";
import Image from "next/image";
import SiteNav from "@/components/SiteNav";
import HeroCarousel from "@/components/HeroCarousel";

export default function Home() {
  const heroSlides = [
    {
      src: "/images/unsplash/liam-8XbWqqz7ukE-unsplash.jpg",
      alt: "Three rescue puppies standing together on a road",
    },
    {
      src: "/images/unsplash/08.jpg",
      alt: "A volunteer gently comforting a rescue dog",
    },
    {
      src: "/images/unsplash/09.jpg",
      alt: "A rescued cat resting safely in soft bedding",
    },
    {
      src: "/images/unsplash/02.jpg",
      alt: "A close-up of a kitten looking out from a bowl",
    },
    {
      src: "/images/unsplash/01.jpg",
      alt: "A rescue dog sleeping peacefully on the ground",
    },
    {
      src: "/images/unsplash/06.jpg",
      alt: "A rescue dog sleeping peacefully on the ground",
    },
  ];

  const stats = [
    { value: "2,400+", label: "Animals Rescued" },
    { value: "1,850+", label: "Adoptions" },
    { value: "450+", label: "Active Volunteers" },
    { value: "3,200+", label: "Medical Treatments" },
  ];

  const processItems = [
    {
      title: "Report",
      description:
        "Emergency cases are triaged in minutes using location and urgency details.",
    },
    {
      title: "Rescue",
      description:
        "Our rescue team moves quickly and safely to bring animals to care.",
    },
    {
      title: "Rehabilitate",
      description:
        "Compassionate veterinary care, nutrition, and behavioral support follow.",
    },
    {
      title: "Rehome",
      description:
        "Thoughtful matching helps every animal find a safe, loving home.",
    },
  ];

  const programs = [
    {
      title: "Rescue & Emergency Response",
      description:
        "Our 24/7 rapid response team coordinates high-risk rescues and immediate stabilization.",
      href: "/rescue",
    },
    {
      title: "Adoption & Rehoming",
      description:
        "A careful adopter screening process ensures long-term placements and happy transitions.",
      href: "/adopt",
    },
    {
      title: "Medical & Shelter Care",
      description:
        "From surgeries to complete recovery plans, care is delivered with consistency and dignity.",
      href: "/admin/shelter-care-logs",
    },
  ];

  const featuredAnimals = [
    {
      name: "Cooper",
      detail: "5 years • Golden Retriever",
      image: "/images/unsplash/photo-1543466835-00a7907e9de1.jpg",
      badge: "Adoptable",
    },
    {
      name: "Luna",
      detail: "8 months • Domestic Shorthair",
      image: "/images/unsplash/photo-1519052537078-e6302a4968d4.jpg",
      badge: "Adoptable",
    },
    {
      name: "Buster",
      detail: "4 years • Indie Mix",
      image: "/images/unsplash/photo-1507146426996-ef05306b995a.jpg",
      badge: "Adoptable",
    },
    {
      name: "Shadow",
      detail: "6 years • Labrador",
      image: "/images/unsplash/photo-1548199973-03cce0bbc87b.jpg",
      badge: "Foster",
    },
  ];

  const supportWays = [
    {
      title: "Monthly Giving",
      description: "Predictable contributions support rescue operations year-round.",
      cta: "Sign Up",
      href: "/donate",
    },
    {
      title: "Sponsor a Recovery",
      description: "Help fund treatment and safe rehabilitation for one rescued animal.",
      cta: "Donate Now",
      href: "/donate",
    },
    {
      title: "Corporate Matching",
      description: "Amplify your impact through workplace and partner matching programs.",
      cta: "Get Started",
      href: "/donate",
    },
    {
      title: "In-Kind Donations",
      description: "Donate supplies, food, or medical resources needed by the shelter.",
      cta: "View Wishlist",
      href: "/impact",
    },
  ];

  return (
    <div className="homev2-page">
      <SiteNav />

      <main className="homev2-main">
        <HeroCarousel
          slides={heroSlides}
          eyebrow="Rescue mission 2026"
          heading={
            <>
              Every Life
              <br />
              Deserves a
              <br />
              Second Chance
            </>
          }
          subheading="Compassion is more than our mission. It is our promise to every abandoned animal. We rescue, rehabilitate, and rehome with long-term care."
          primaryCta={{ href: "/donate", label: "Donate Now" }}
          secondaryCta={{ href: "/volunteer", label: "Volunteer" }}
        />

        <section className="section-wrap homev2-stats" aria-label="Impact statistics">
          {stats.map((item) => (
            <article key={item.label} className="homev2-stat-card">
              <h3>{item.value}</h3>
              <p>{item.label}</p>
            </article>
          ))}
        </section>

        <section className="homev2-process section-wrap">
          <p className="homev2-kicker">Our process</p>
          <h2>How We Save Lives</h2>
          <p>Every rescue follows a dedicated path from risk to comfort.</p>
          <div className="homev2-process-grid">
            {processItems.map((item) => (
              <article key={item.title} className="homev2-process-card">
                <span aria-hidden="true">✦</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section-wrap homev2-programs">
          <p className="homev2-kicker">Our mission in action</p>
          <h2>Comprehensive Care Programs</h2>
          <div className="homev2-program-grid">
            {programs.map((program, index) => (
              <article key={program.title} className="homev2-program-card">
                <span className="homev2-program-icon" aria-hidden="true">
                  {index === 0 ? "✳" : index === 1 ? "⌂" : "☒"}
                </span>
                <h3>{program.title}</h3>
                <p>{program.description}</p>
                <Link href={program.href}>Learn More →</Link>
              </article>
            ))}
          </div>
        </section>

        <section className="section-wrap homev2-adopt">
          <div className="homev2-adopt-head">
            <div>
              <h2>Adoptable Friends</h2>
              <p>Waiting for a place to call home.</p>
            </div>
            <Link href="/adopt" className="pill-btn solid pill-link">
              View All Animals
            </Link>
          </div>

          <div className="homev2-animal-grid">
            {featuredAnimals.map((animal) => (
              <article key={animal.name} className="homev2-animal-card">
                <Image
                  src={animal.image}
                  alt={`${animal.name} for adoption`}
                  fill
                  sizes="(max-width: 920px) 50vw, 25vw"
                />
                <span className="homev2-animal-badge">{animal.badge}</span>
                <div className="homev2-animal-meta">
                  <h3>{animal.name}</h3>
                  <p>{animal.detail}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section-wrap homev2-story">
          <div>
            <p className="homev2-kicker">Transformation storyline</p>
            <h2>From the Streets to the Sofa</h2>
            <p>
              &quot;Seeing Max go from a frightened, shivering pup to a joyous member
              of our family has been the most rewarding journey of our lives.&quot;
            </p>
            <small>The McKinley Family</small>
            <Link href="/impact" className="pill-btn subtle pill-link">
              Read More Stories
            </Link>
          </div>
          <div className="homev2-story-images">
            <div className="homev2-story-image">
              <Image
                src="/images/unsplash/photo-1517849845537-4d257902454a.jpg"
                alt="Puppy before adoption"
                fill
                sizes="(max-width: 920px) 50vw, 24vw"
              />
            </div>
            <div className="homev2-story-image">
              <Image
                src="/images/unsplash/photo-1601758228041-f3b2795255f1.jpg"
                alt="Dog after adoption"
                fill
                sizes="(max-width: 920px) 50vw, 24vw"
              />
            </div>
          </div>
        </section>

        <section className="section-wrap homev2-faq">
          <p className="homev2-kicker">Information</p>
          <h2>Common Questions</h2>
          <div className="homev2-faq-list">
            <details>
              <summary>What is the adoption process like?</summary>
              <p>
                We start with your application, conduct a short screening call,
                and arrange a supervised meet-and-greet before final placement.
              </p>
            </details>
            <details>
              <summary>How much are the adoption fees?</summary>
              <p>
                Fees vary by animal profile and medical needs, and they help
                cover vaccinations, deworming, and early recovery costs.
              </p>
            </details>
            <details>
              <summary>How can I become a volunteer?</summary>
              <p>
                You can register through our volunteer form. We run orientation
                sessions each week for rescue, shelter, and event support.
              </p>
            </details>
          </div>
        </section>

        <section className="section-wrap homev2-support">
          <h2>Ways to Support</h2>
          <p>
            Your generosity fuels our mission. Choose the way that works best
            for you to help us save lives.
          </p>
          <div className="homev2-support-grid">
            {supportWays.map((way) => (
              <article key={way.title} className="homev2-support-card">
                <h3>{way.title}</h3>
                <p>{way.description}</p>
                <Link href={way.href}>{way.cta}</Link>
              </article>
            ))}
          </div>
        </section>

        <section className="homev2-newsletter-wrap">
          <div className="section-wrap homev2-newsletter">
            <div>
              <h2>Stay Informed</h2>
              <p>
                Join our community and get rescue updates, adoption stories, and
                upcoming events delivered to your inbox.
              </p>
            </div>
            <form>
              <input type="email" placeholder="Enter your email address" aria-label="Email address" />
              <button type="button">Subscribe</button>
            </form>
          </div>
        </section>
      </main>

    </div>
  );
}

