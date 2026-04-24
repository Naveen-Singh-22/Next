"use client";

import Link from "next/link";
import { useState } from "react";
import SiteNav from "@/components/SiteNav";
import ScrollReveal from "@/components/ScrollReveal";

const reports = [
  {
    title: "2023 Impact Report",
    text: "A deep dive into our rescue statistics, regional expansion, and survivor stories.",
  },
  {
    title: "Financial Statement",
    text: "Verified by independent auditors, outlining our revenue and expense streams.",
  },
  {
    title: "Rescue Map",
    text: "Visualizing our footprint across 14 counties and international partnerships.",
  },
];

const scoutJournalEntries = [
  {
    day: "Day 1 - Intake",
    text: "Scout arrived trembling, severely underweight, and covered in road dust. Our team stabilized him with fluids, warm bedding, and a slow-feeding protocol to avoid refeeding shock.",
  },
  {
    day: "Week 2 - Trust Building",
    text: "He began accepting hand-fed meals and short leash walks in low-stimulus zones. Behavioral specialists introduced confidence games and gentle desensitization to human touch.",
  },
  {
    day: "Week 5 - Surgery and Recovery",
    text: "Diagnostic imaging confirmed an old untreated fracture requiring corrective surgery. Donor-funded intervention covered the procedure, rehabilitation sessions, and post-operative medication.",
  },
  {
    day: "Week 10 - Purpose Found",
    text: "Scout passed therapy temperament screening with remarkable social responsiveness. He now visits pediatric wards twice weekly, helping children regulate anxiety and feel safe.",
  },
];

export default function ImpactPage() {
  const [isJournalOpen, setIsJournalOpen] = useState(false);

  return (
    <div className="impact-page">
      <SiteNav className="impact-nav" />

      <main>
        <ScrollReveal as="section" className="section-wrap impact-hero" delayMs={40}>
          <div className="impact-copy">
            <h1>
              Metrics of <span>Mercy</span>
            </h1>
            <p>
              The tangible results of collective compassion. Every number below
              represents a heartbeat sustained, a home found, and a life
              transformed through the unwavering support of Kindred Hearth.
            </p>
          </div>

          <div className="impact-hero-media">
            <div className="impact-hero-image reveal-item" role="img" aria-label="Golden retriever portrait" />
            <article className="impact-hero-note reveal-item">
              <p>THE LIVING IMPACT</p>
              <small>"The data is in the wagging tails."</small>
            </article>
          </div>
        </ScrollReveal>

        <ScrollReveal
          as="section"
          className="section-wrap impact-stats-grid"
          aria-label="Impact metric cards"
          delayMs={80}
        >
          <article className="impact-stat-card featured reveal-item">
            <h2>2,400+</h2>
            <p>Lives pulled from the brink through our rescue missions.</p>
          </article>

          <article className="impact-stat-card soft reveal-item">
            <h2>1,850+</h2>
            <p>Adoptions completed into forever families.</p>
          </article>

          <article className="impact-stat-card warm reveal-item">
            <h2>450+</h2>
            <p>Active volunteers dedicating their time daily.</p>
          </article>

          <article className="impact-stat-card soft large reveal-item">
            <h2>3,200+</h2>
            <p>Specialized medical treatments provided in our clinics.</p>
          </article>

          <article className="impact-stat-card efficiency reveal-item">
            <h3>Efficiency of Care</h3>
            <p>
              For every $1 donated, 87¢ goes directly to veterinary care and
              rescue logistics. We maintain transparency to honor your trust.
            </p>
            <div className="impact-progress" aria-label="Aid distribution percentage">
              <div />
            </div>
            <div className="impact-progress-notes">
              <span>Direct Aid 87%</span>
              <span>Admin 13%</span>
            </div>
          </article>
        </ScrollReveal>

        <ScrollReveal as="section" className="section-wrap impact-story" delayMs={120}>
          <div className="impact-story-image reveal-item" role="img" aria-label="Rescued puppy" />
          <article className="impact-story-copy reveal-item">
            <p>FEATURED TRANSFORMATION</p>
            <h2>The Story of Scout: From Shadow to Sunshine.</h2>
            <small>
              Scout was found abandoned in an industrial park, underweight and
              fearful. Today, after three months of rehabilitation and a
              life-saving surgery funded by donors like you, he is the therapy
              dog for a local pediatric wing.
            </small>
            <button
              type="button"
              className="impact-journal-trigger"
              aria-expanded={isJournalOpen}
              aria-controls="scout-journal"
              onClick={() => setIsJournalOpen((previousState) => !previousState)}
            >
              {isJournalOpen ? "Hide Scout's Journal ↑" : "Read Scout's Full Journal →"}
            </button>

            <div
              id="scout-journal"
              className={`impact-journal-panel ${isJournalOpen ? "impact-journal-panel-open" : ""}`}
              aria-hidden={!isJournalOpen}
            >
              <div className="impact-journal-content">
                {scoutJournalEntries.map((entry) => (
                  <article key={entry.day} className="impact-journal-entry">
                    <h3>{entry.day}</h3>
                    <p>{entry.text}</p>
                  </article>
                ))}
              </div>
            </div>
          </article>
        </ScrollReveal>

        <ScrollReveal as="section" className="impact-transparency" delayMs={160}>
          <div className="section-wrap">
            <h2 className="section-title center">Our Commitment to Transparency</h2>
            <p className="section-sub center">
              Data-driven advocacy means being open about how every resource is
              deployed. Explore our annual impact reports and financial
              disclosures.
            </p>
            <div className="impact-report-grid">
              {reports.map((report) => (
                <article key={report.title} className="impact-report-card reveal-item">
                  <h3>{report.title}</h3>
                  <p>{report.text}</p>
                </article>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal as="section" className="section-wrap impact-cta" delayMs={200}>
          <h2>Ready to grow these numbers?</h2>
          <p>
            Your donation is the catalyst. Choose to be a part of next year&apos;s
            metrics.
          </p>
          <div className="impact-cta-actions">
            <Link className="pill-btn solid pill-link" href="/donate">
              Become a Monthly Guardian
            </Link>
            <Link className="pill-btn impact-alt pill-link" href="/donate">
              One-Time Impact Gift
            </Link>
          </div>
        </ScrollReveal>
      </main>

    </div>
  );
}

