"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import ScrollReveal from "@/components/ScrollReveal";
import type { AdoptAnimal } from "@/lib/adoptAnimals";
import { ensureLoggedIn } from "@/lib/authClient";

type AnimalProfilePageProps = {
  animal: AdoptAnimal;
};

type AdoptionSubmitState = "idle" | "success" | "error";

type AdoptionRequestPayload = {
  applicantName: string;
  email: string;
  phone: string;
  city: string;
  housing: "apartment" | "house" | "farm" | "other";
  petExperience: string;
  whyAdopt: string;
  animalId: number;
  animalName: string;
  animalCode?: string;
};

type AdoptionApiResponse = {
  message?: string;
  application?: {
    id: number;
    applicationId: string;
  };
};

type TimelineEntry = {
  id: string;
  title: string;
  text: string;
};

type TrackingEntry = {
  title: string;
  text: string;
  status: string;
};

type ReadinessCard = {
  title: string;
  text: string;
};

const speciesLabel: Record<AdoptAnimal["species"], string> = {
  Dog: "Companion Animal",
  Cat: "Companion Animal",
  Bird: "Aviary Care",
};

const speciesGallery: Record<AdoptAnimal["species"], string[]> = {
  Dog: [
    "/images/unsplash/photo-1507146426996-ef05306b995a.jpg",
    "/images/unsplash/photo-1543466835-00a7907e9de1.jpg",
    "/images/unsplash/photo-1560250097-0b93528c311a.jpg",
    "/images/unsplash/photo-1601758228041-f3b2795255f1.jpg",
  ],
  Cat: [
    "/images/unsplash/photo-1517849845537-4d257902454a.jpg",
    "/images/unsplash/photo-1519052537078-e6302a4968d4.jpg",
    "/images/unsplash/photo-1542204625-de293a38bda2.jpg",
    "/images/unsplash/photo-1552053831-71594a27632d.jpg",
  ],
  Bird: [
    "/images/unsplash/photo-1530281700549-e82e7bf110d6.jpg",
    "/images/unsplash/photo-1623387641168-d9803ddd3f35.jpg",
    "/images/unsplash/photo-1530281700549-e82e7bf110d6.jpg",
    "/images/unsplash/photo-1623387641168-d9803ddd3f35.jpg",
  ],
};

const journalTemplates = [
  {
    day: "Day 1 - Emergency Intake",
    text: "The animal arrived under urgent care, was stabilized by the medical team, and started a recovery plan immediately.",
  },
  {
    day: "Day 3 - First Signs of Safety",
    text: "Early trust signals appeared through food acceptance, calmer body language, and brief voluntary interaction.",
  },
  {
    day: "Week 1 - Clinical Workup",
    text: "Diagnostics, treatment notes, and nutrition planning were completed to support a healthy recovery path.",
  },
  {
    day: "Week 2 - Trust Conditioning",
    text: "Structured enrichment and gentle handling helped the animal settle into a predictable routine.",
  },
  {
    day: "Week 3 - Behavioral Progress",
    text: "Confidence improved through short social sessions, leash or handling practice, and positive reinforcement.",
  },
  {
    day: "Today - Ongoing Impact",
    text: "The animal is now stable, social, and moving toward adoption with a story shaped by resilient care.",
  },
];

function buildAnimalJournal(animal: AdoptAnimal) {
  return journalTemplates.map((entry) => ({
    ...entry,
    text: entry.text.replace("the animal", animal.name).replace("The animal", animal.name),
  }));
}

function buildTimeline(animal: AdoptAnimal): TimelineEntry[] {
  return [
    {
      id: "intake",
      title: "Found and Initial Stabilization",
      text: `${animal.name} was brought in from ${animal.city}. Intake team completed first aid, hydration, and baseline vitals.`,
    },
    {
      id: "clinical",
      title: "Medical Rehabilitation",
      text: `${animal.vaccinated ? "Vaccination schedule completed" : "Vaccination schedule in progress"} and preventive care logged by the clinical team.`,
    },
    {
      id: "behavior",
      title: "Socialization and Training",
      text: `${animal.temperament.slice(0, 2).join(" and ")} behaviors are now consistent under daily enrichment and structured handling.`,
    },
    {
      id: "status",
      title: "Current Status",
      text: `${animal.status} - now being matched with homes suited for ${animal.goodWith.toLowerCase()}.`,
    },
  ];
}

function buildTracking(animal: AdoptAnimal): TrackingEntry[] {
  return [
    {
      title: animal.neutered ? "Post-neuter recovery" : "Pre-surgery readiness",
      text: animal.neutered
        ? `${animal.name} recovered well and is in stable condition.`
        : `${animal.name} is being monitored for the next neuter/spay slot.`,
      status: animal.neutered ? "100% complete" : "Scheduled",
    },
    {
      title: animal.vaccinated ? "Vaccination complete" : "Vaccination in progress",
      text: animal.vaccinated
        ? "Core shots logged and booster reminders set for follow-up."
        : "Core shots underway with follow-up dates tracked.",
      status: animal.vaccinated ? "On track" : "In progress",
    },
  ];
}

function buildReadiness(animal: AdoptAnimal): ReadinessCard[] {
  const topTrait = animal.temperament[0] ?? "Friendly";
  const secondTrait = animal.temperament[1] ?? "Adaptive";

  return [
    {
      title: "Behavioral Assessment",
      text: `${topTrait} and ${secondTrait}. Responds best to calm, consistent routines and positive reinforcement.`,
    },
    {
      title: "Ideal Home Environment",
      text: `Best suited for ${animal.goodWith.toLowerCase()}. ${animal.size} ${animal.species.toLowerCase()} needs daily enrichment and safe rest space.`,
    },
  ];
}

function buildGallery(animal: AdoptAnimal) {
  const fallback = speciesGallery[animal.species];
  return [animal.image, ...fallback].slice(0, 4);
}

function computeFee(animal: AdoptAnimal) {
  const base = animal.species === "Bird" ? 4200 : animal.species === "Cat" ? 6200 : 8500;
  const sizeBoost = animal.size === "Large" ? 900 : animal.size === "Medium" ? 400 : 0;
  const ageAdjustment = animal.ageYears >= 4 ? -500 : animal.ageYears < 1 ? 300 : 0;
  return Math.max(base + sizeBoost + ageAdjustment, 2500);
}

export default function AnimalProfilePage({ animal }: AnimalProfilePageProps) {
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [applicantName, setApplicantName] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  const [applicantPhone, setApplicantPhone] = useState("");
  const [city, setCity] = useState("");
  const [homeType, setHomeType] = useState<"apartment" | "house" | "farm" | "other">("apartment");
  const [whyAdopt, setWhyAdopt] = useState("");
  const [petExperience, setPetExperience] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<AdoptionSubmitState>("idle");
  const [submitMessage, setSubmitMessage] = useState("");

  function getAnimalIdFromSlug(slug: string) {
    const match = slug.match(/-(\d+)$/);
    const parsedId = match ? Number(match[1]) : Number.NaN;
    return Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null;
  }

  const journalEntries = useMemo(() => buildAnimalJournal(animal), [animal]);
  const timeline = useMemo(() => buildTimeline(animal), [animal]);
  const tracking = useMemo(() => buildTracking(animal), [animal]);
  const readinessCards = useMemo(() => buildReadiness(animal), [animal]);
  const gallery = useMemo(() => buildGallery(animal), [animal]);
  const adoptionFee = useMemo(() => computeFee(animal), [animal]);
  const noteCopy = useMemo(
    () => `${animal.name} does best with ${animal.goodWith.toLowerCase()}. Families offering structure and gentle introductions are preferred.`,
    [animal],
  );
  const healthSummary = useMemo(
    () => `${animal.vaccinated ? "Vaccinated" : "Vaccination in progress"}, ${animal.neutered ? "neutered/spayed" : "neuter/spay pending"}.`,
    [animal],
  );

  const detailRows = useMemo(
    () => [
      { label: "Estimated Age", value: animal.age },
      { label: "Breed Mix", value: animal.breed },
      { label: "Location", value: animal.city },
      { label: "Species", value: animal.species },
      { label: "Size", value: animal.size },
      { label: "Gender", value: animal.gender },
    ],
    [animal],
  );

  async function handleAdoptionSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const animalId = getAnimalIdFromSlug(animal.slug);

    if (!animalId) {
      setSubmitState("error");
      setSubmitMessage("Unable to identify this animal record. Please refresh and try again.");
      return;
    }

    if (!(await ensureLoggedIn(window.location.pathname + window.location.search, "donor"))) {
      return;
    }

    const payload: AdoptionRequestPayload = {
      applicantName: applicantName.trim(),
      email: applicantEmail.trim(),
      phone: applicantPhone.trim(),
      city: city.trim(),
      housing: homeType,
      petExperience: petExperience.trim(),
      whyAdopt: whyAdopt.trim(),
      animalId,
      animalName: animal.name,
      animalCode: undefined,
    };

    if (
      !payload.applicantName ||
      !payload.email ||
      !payload.phone ||
      !payload.city ||
      !payload.whyAdopt ||
      !payload.petExperience
    ) {
      setSubmitState("error");
      setSubmitMessage("Please fill all required fields before submitting.");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitState("idle");
      setSubmitMessage("");

      const response = await fetch("/api/adoptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as AdoptionApiResponse;

      if (!response.ok || !result.application) {
        setSubmitState("error");
        setSubmitMessage(result.message ?? "Unable to submit your adoption request. Please try again.");
        return;
      }

      setSubmitState("success");
      setSubmitMessage(`Application submitted successfully. Reference ${result.application.applicationId}.`);
      setApplicantName("");
      setApplicantEmail("");
      setApplicantPhone("");
      setCity("");
      setHomeType("apartment");
      setWhyAdopt("");
      setPetExperience("");
      window.setTimeout(() => {
        setIsFormOpen(false);
        setSubmitState("idle");
        setSubmitMessage("");
      }, 1200);
    } catch {
      setSubmitState("error");
      setSubmitMessage("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="impact-page animal-profile-page">
      <SiteNav className="impact-nav" />

      <main>
        <ScrollReveal as="section" className="animal-profile-hero" delayMs={40}>
          <div
            className="animal-profile-hero-image reveal-item"
            role="img"
            aria-label={`${animal.name} portrait`}
            style={{ minHeight: "620px" }}
          >
            <Image src={animal.image} alt={`${animal.name} portrait`} fill priority sizes="100vw" />
          </div>

          <div className="animal-profile-hero-overlay section-wrap">
            <div className="animal-profile-top-tags reveal-item">
              <span>{animal.breed}</span>
              <span>{animal.status}</span>
              <span>{animal.gender}</span>
              {animal.pair ? <span>{animal.pair}</span> : null}
            </div>

            <div className="animal-profile-hero-content reveal-item">
              <h1>{animal.name}</h1>
              <p>{animal.profileSummary}</p>
            </div>

            <div className="animal-profile-hero-actions reveal-item">
              <button type="button" className="pill-btn solid pill-link" onClick={() => setIsFormOpen(true)}>
                Apply to Adopt {animal.name}
              </button>
            </div>
          </div>
        </ScrollReveal>

        <section className="section-wrap animal-profile-main-grid">
          <ScrollReveal as="article" className="animal-profile-narrative" delayMs={70}>
            <p className="animal-profile-kicker">The rescue narrative</p>
            <h2>{animal.rescueStory}</h2>
            <p>
              When our team first reached {animal.name} in {animal.city}, a calm and deliberate care plan began immediately.
              Today, this {animal.species.toLowerCase()} is showing resilient recovery and is being matched for a forever home.
            </p>
          </ScrollReveal>

          <ScrollReveal as="aside" className="animal-profile-glance-card" delayMs={100}>
            <h3>At a glance</h3>
            <div className="animal-profile-detail-grid">
              {detailRows.map((detail) => (
                <article key={detail.label} className="animal-profile-detail-card reveal-item">
                  <span>{detail.label}</span>
                  <strong>{detail.value}</strong>
                </article>
              ))}
            </div>
            <div className="animal-profile-fee-row">
              <span>Adoption fee</span>
              <strong>Rs.{adoptionFee.toLocaleString("en-IN")}</strong>
            </div>
          </ScrollReveal>

          <ScrollReveal as="article" className="animal-profile-timeline" delayMs={120}>
            <p className="animal-profile-kicker">Rescue and care journey</p>
            <ul>
              {timeline.map((entry, index) => (
                <li key={entry.id} className="reveal-item" style={{ transitionDelay: `${80 + index * 80}ms` }}>
                  <span>{index === timeline.length - 1 ? "Current" : `Stage ${index + 1}`}</span>
                  <h4>{entry.title}</h4>
                  <p>{entry.text}</p>
                </li>
              ))}
            </ul>
          </ScrollReveal>

          <div className="animal-profile-side-stack">
            <ScrollReveal as="article" className="animal-profile-health-card" delayMs={140}>
              <h3>Health and tracking</h3>
              <p>{healthSummary}</p>
              <div className="animal-profile-progress">
                <div style={{ width: animal.vaccinated ? "100%" : "72%" }} />
              </div>
              <small>{animal.vaccinated ? "100% complete" : "72% complete"}</small>
              <div className="animal-profile-tracking-list">
                {tracking.map((item) => (
                  <article key={item.title} className="reveal-item">
                    <header>
                      <h4>{item.title}</h4>
                      <span>{item.status}</span>
                    </header>
                    <p>{item.text}</p>
                  </article>
                ))}
              </div>
            </ScrollReveal>

            <ScrollReveal as="article" className="animal-profile-support-card" delayMs={165}>
              <h4>{speciesLabel[animal.species]} training</h4>
              <p>
                Support team provides post-adoption guidance to ensure {animal.name} and the new family settle with confidence.
              </p>
            </ScrollReveal>
          </div>
        </section>

        <section className="section-wrap animal-profile-lower-grid">
          <ScrollReveal as="article" className="animal-profile-readiness" delayMs={180}>
            <p className="animal-profile-kicker">Adoption readiness and fit</p>
            <div className="animal-profile-readiness-grid">
              {readinessCards.map((card) => (
                <article key={card.title} className="reveal-item">
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                </article>
              ))}
            </div>
            <blockquote>{noteCopy}</blockquote>
          </ScrollReveal>

          <ScrollReveal as="article" className="animal-profile-journal" delayMs={200}>
            <button
              type="button"
              className="impact-journal-trigger"
              aria-expanded={isJournalOpen}
              aria-controls="animal-journal"
              onClick={() => setIsJournalOpen((previousState) => !previousState)}
            >
              {isJournalOpen ? `Hide ${animal.name}'s care journal` : `Read ${animal.name}'s care journal`}
            </button>

            <div
              id="animal-journal"
              className={`impact-journal-panel ${isJournalOpen ? "impact-journal-panel-open" : ""}`}
              aria-hidden={!isJournalOpen}
            >
              <div className="impact-journal-content">
                {journalEntries.map((entry) => (
                  <article key={entry.day} className="impact-journal-entry">
                    <h3>{entry.day}</h3>
                    <p>{entry.text}</p>
                  </article>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </section>

        <ScrollReveal as="section" className="section-wrap animal-profile-gallery-wrap" delayMs={220}>
          <p className="animal-profile-kicker">Gallery</p>
          <div className="animal-profile-gallery-grid">
            {gallery.map((image, index) => (
              <figure
                key={`${animal.slug}-gallery-${index}`}
                className={`animal-profile-gallery-card reveal-item ${index === 0 ? "large" : ""}`}
                style={{ minHeight: index === 0 ? "270px" : "150px" }}
              >
                <Image
                  src={image}
                  alt={`${animal.name} gallery ${index + 1}`}
                  fill
                  sizes={index === 0 ? "(max-width: 920px) 100vw, 52vw" : "(max-width: 920px) 100vw, 26vw"}
                />
              </figure>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal as="section" className="animal-profile-cta" delayMs={240}>
          <h2>Can you provide {animal.name}&apos;s happy ending?</h2>
          <div className="impact-cta-actions">
            <button type="button" className="pill-btn solid pill-link" onClick={() => setIsFormOpen(true)}>
              Apply to Adopt
            </button>
            <Link className="pill-btn impact-alt pill-link" href="/volunteer">
              Ask About {animal.name}
            </Link>
          </div>
        </ScrollReveal>

        {isFormOpen ? (
          <div className="animal-adopt-modal" role="dialog" aria-modal="true" aria-label={`Apply to adopt ${animal.name}`}>
            <div className="animal-adopt-modal-backdrop" onClick={() => setIsFormOpen(false)} aria-hidden="true" />
            <article
              className="animal-adopt-modal-card"
              style={{ maxHeight: "calc(100dvh - 1.5rem)", overflowY: "auto" }}
            >
              <div className="animal-adopt-modal-head">
                <h3>Apply to Adopt {animal.name}</h3>
                <button
                  type="button"
                  className="animal-adopt-modal-close"
                  onClick={() => setIsFormOpen(false)}
                  aria-label="Close adoption form"
                >
                  Close
                </button>
              </div>

              <form className="animal-adopt-form" onSubmit={handleAdoptionSubmit}>
                <div className="animal-adopt-form-grid">
                  <label>
                    Full Name
                    <input
                      type="text"
                      value={applicantName}
                      onChange={(event) => setApplicantName(event.target.value)}
                      placeholder="Your full name"
                      required
                    />
                  </label>

                  <label>
                    Email
                    <input
                      type="email"
                      value={applicantEmail}
                      onChange={(event) => setApplicantEmail(event.target.value)}
                      placeholder="you@example.com"
                      required
                    />
                  </label>

                  <label>
                    Phone
                    <input
                      type="tel"
                      value={applicantPhone}
                      onChange={(event) => setApplicantPhone(event.target.value)}
                      placeholder="+91 90000 00000"
                      required
                    />
                  </label>

                  <label>
                    City
                    <input
                      type="text"
                      value={city}
                      onChange={(event) => setCity(event.target.value)}
                      placeholder="Your city"
                      required
                    />
                  </label>

                  <label>
                    Home Type
                    <select value={homeType} onChange={(event) => setHomeType(event.target.value as typeof homeType)}>
                      <option value="apartment">Apartment</option>
                      <option value="house">House</option>
                      <option value="farm">Farm / Open Property</option>
                      <option value="other">Other</option>
                    </select>
                  </label>

                  <label className="full-width">
                    Why are you a good match?
                    <textarea
                      rows={4}
                      value={whyAdopt}
                      onChange={(event) => setWhyAdopt(event.target.value)}
                      placeholder={`Share your routine and why ${animal.name} is a good fit for your home.`}
                      required
                    />
                  </label>

                  <label className="full-width">
                    Pet Experience
                    <textarea
                      rows={3}
                      value={petExperience}
                      onChange={(event) => setPetExperience(event.target.value)}
                      placeholder="Describe your experience caring for pets."
                      required
                    />
                  </label>
                </div>

                {submitState !== "idle" ? (
                  <p className={`animal-adopt-form-message ${submitState}`}>{submitMessage}</p>
                ) : null}

                <div className="animal-adopt-form-actions">
                  <button type="submit" className="pill-btn solid pill-link" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </button>
                </div>
              </form>
            </article>
          </div>
        ) : null}
      </main>
    </div>
  );
}
