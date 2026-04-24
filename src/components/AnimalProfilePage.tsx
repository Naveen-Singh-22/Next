"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import ScrollReveal from "@/components/ScrollReveal";
import type { AdoptAnimal } from "@/lib/adoptAnimals";

type AnimalProfilePageProps = {
  animal: AdoptAnimal;
};

const baseReports = [
  {
    title: "Health Tracking",
    text: "Routine checkups, vaccination progress, and recovery milestones documented in real time.",
  },
  {
    title: "Care Timeline",
    text: "A clear view of the animal’s rescue journey, treatment phases, and readiness for adoption.",
  },
  {
    title: "Adoption Readiness",
    text: "Behavior assessment, home-fit guidance, and next-step placement notes for the rescue team.",
  },
];

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

export default function AnimalProfilePage({ animal }: AnimalProfilePageProps) {
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const journalEntries = useMemo(() => buildAnimalJournal(animal), [animal]);

  const detailRows = [
    { label: "Estimated Age", value: animal.age },
    { label: "Breed Mix", value: animal.breed },
    { label: "Location", value: animal.city },
    { label: "Species", value: animal.species },
    { label: "Size", value: animal.size },
    { label: "Gender", value: animal.gender },
  ];

  return (
    <div className="impact-page animal-profile-page">
      <SiteNav className="impact-nav" />

      <main>
        <ScrollReveal as="section" className="section-wrap impact-hero animal-profile-hero" delayMs={40}>
          <div className="impact-copy animal-profile-copy">
            <div className="animal-profile-tags">
              <span>{animal.species}</span>
              <span>{animal.status}</span>
              {animal.pair ? <span>{animal.pair}</span> : null}
            </div>
            <h1>
              Meet <span>{animal.name}</span>
            </h1>
            <p>{animal.profileSummary}</p>
          </div>

          <div className="impact-hero-media animal-profile-hero-media">
            <div className="impact-hero-image animal-profile-hero-image reveal-item" role="img" aria-label={`${animal.name} portrait`}>
              <Image src={animal.image} alt={`${animal.name} portrait`} fill priority sizes="(max-width: 920px) 100vw, 48vw" />
            </div>
            <article className="impact-hero-note reveal-item">
              <p>THE LIVING PROFILE</p>
              <small>"{animal.name} is ready for a forever home."</small>
            </article>
          </div>
        </ScrollReveal>

        <ScrollReveal
          as="section"
          className="section-wrap impact-stats-grid animal-profile-stats"
          aria-label="Animal profile cards"
          delayMs={80}
        >
          <article className="impact-stat-card featured reveal-item">
            <h2>{animal.age}</h2>
            <p>Current estimated age based on intake assessment.</p>
          </article>

          <article className="impact-stat-card soft reveal-item">
            <h2>{animal.city}</h2>
            <p>Current foster or rescue location for this animal.</p>
          </article>

          <article className="impact-stat-card warm reveal-item">
            <h2>{animal.goodWith}</h2>
            <p>Best match for a home that fits temperament and routine.</p>
          </article>

          <article className="impact-stat-card soft large reveal-item">
            <h2>{animal.temperament[0] ?? "Gentle"}</h2>
            <p>Leading temperament trait used to guide adoption placement.</p>
          </article>

          <article className="impact-stat-card efficiency reveal-item">
            <h3>Health & Wellness</h3>
            <p>
              Vaccinated: {animal.vaccinated ? "Yes" : "No"} · Neutered / Spayed: {animal.neutered ? "Yes" : "No"}
            </p>
            <div className="impact-progress animal-profile-progress" aria-label="Adoption readiness indicator">
              <div />
            </div>
            <div className="impact-progress-notes">
              <span>Readiness Review</span>
              <span>Family Fit</span>
            </div>
          </article>
        </ScrollReveal>

        <ScrollReveal as="section" className="section-wrap impact-story animal-profile-story" delayMs={120}>
          <div className="impact-story-image animal-profile-story-image reveal-item" role="img" aria-label={`${animal.name} in care`}>
            <Image src={animal.image} alt={`${animal.name} in care`} fill sizes="(max-width: 920px) 100vw, 45vw" />
          </div>
          <article className="impact-story-copy reveal-item">
            <p>FEATURED TRANSFORMATION</p>
            <h2>The story of {animal.name}.</h2>
            <small>{animal.rescueStory}</small>
            <button
              type="button"
              className="impact-journal-trigger"
              aria-expanded={isJournalOpen}
              aria-controls="animal-journal"
              onClick={() => setIsJournalOpen((previousState) => !previousState)}
            >
              {isJournalOpen ? `Hide ${animal.name}'s Journal ↑` : `Read ${animal.name}'s Full Journal →`}
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
          </article>
        </ScrollReveal>

        <ScrollReveal as="section" className="impact-transparency animal-profile-transparency" delayMs={160}>
          <div className="section-wrap">
            <h2 className="section-title center">Profile Details</h2>
            <p className="section-sub center">
              This profile page is data-driven, so the layout stays the same while each animal’s information changes.
            </p>
            <div className="impact-report-grid animal-profile-report-grid">
              {baseReports.map((report) => (
                <article key={report.title} className="impact-report-card reveal-item">
                  <h3>{report.title}</h3>
                  <p>{report.text}</p>
                </article>
              ))}
            </div>
            <div className="animal-profile-detail-grid">
              {detailRows.map((detail) => (
                <article key={detail.label} className="animal-profile-detail-card reveal-item">
                  <span>{detail.label}</span>
                  <strong>{detail.value}</strong>
                </article>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal as="section" className="impact-cta animal-profile-cta" delayMs={200}>
          <h2>Ready to meet {animal.name}?</h2>
          <p>
            If the fit feels right, continue with adoption or send the rescue team a question about this animal.
          </p>
          <div className="impact-cta-actions">
            <Link className="pill-btn solid pill-link" href="/adopt">
              Back to Adoption List
            </Link>
            <Link className="pill-btn impact-alt pill-link" href="/donate">
              Support More Rescues
            </Link>
          </div>
        </ScrollReveal>
      </main>
    </div>
  );
}
