import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteNav from "@/components/SiteNav";
import { adoptAnimals, findAnimalBySlug } from "@/lib/adoptAnimals";

type AnimalProfilePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return adoptAnimals.map((animal) => ({ slug: animal.slug }));
}

export default async function AnimalProfilePage({ params }: AnimalProfilePageProps) {
  const { slug } = await params;
  const animal = findAnimalBySlug(slug);

  if (!animal) {
    notFound();
  }

  return (
    <div className="adopt-profile-page">
      <SiteNav />

      <main className="section-wrap adopt-profile-main">
        <div className="adopt-profile-back-row">
          <Link href="/adopt" className="adopt-profile-back-link">
            Back to Adoption List
          </Link>
        </div>

        <section className="adopt-profile-grid" aria-label="Animal profile details">
          <article className="adopt-profile-image-card">
            <div className="adopt-profile-image-wrap">
              <Image
                src={animal.image}
                alt={`${animal.name} profile photo`}
                fill
                sizes="(max-width: 920px) 100vw, 52vw"
                priority
              />
            </div>
            <div className="adopt-profile-chip-row">
              <span className="adopt-profile-chip">{animal.species}</span>
              <span className="adopt-profile-chip">{animal.status}</span>
              {animal.pair ? <span className="adopt-profile-chip">{animal.pair}</span> : null}
            </div>
          </article>

          <article className="adopt-profile-info-card">
            <h1>{animal.name}</h1>
            <p className="adopt-profile-subtitle">{animal.breed}</p>
            <p className="adopt-profile-summary">{animal.profileSummary}</p>

            <dl className="adopt-profile-facts">
              <div>
                <dt>Age</dt>
                <dd>{animal.age}</dd>
              </div>
              <div>
                <dt>Gender</dt>
                <dd>{animal.gender}</dd>
              </div>
              <div>
                <dt>Size</dt>
                <dd>{animal.size}</dd>
              </div>
              <div>
                <dt>Location</dt>
                <dd>{animal.city}</dd>
              </div>
              <div>
                <dt>Vaccinated</dt>
                <dd>{animal.vaccinated ? "Yes" : "No"}</dd>
              </div>
              <div>
                <dt>Neutered / Spayed</dt>
                <dd>{animal.neutered ? "Yes" : "No"}</dd>
              </div>
              <div>
                <dt>Good With</dt>
                <dd>{animal.goodWith}</dd>
              </div>
            </dl>

            <section className="adopt-profile-section">
              <h2>Rescue Story</h2>
              <p>{animal.rescueStory}</p>
            </section>

            <section className="adopt-profile-section">
              <h2>Temperament</h2>
              <ul className="adopt-profile-temperament-list">
                {animal.temperament.map((trait) => (
                  <li key={trait}>{trait}</li>
                ))}
              </ul>
            </section>

            <div className="adopt-profile-actions">
              <Link href="/volunteer" className="adopt-profile-action-secondary">
                Contact Rescue Team
              </Link>
              <Link href="/rescue" className="adopt-profile-action-primary">
                Start Adoption Inquiry
              </Link>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
