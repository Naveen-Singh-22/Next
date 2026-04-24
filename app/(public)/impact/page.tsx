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
    day: "Day 1 - Emergency Intake",
    text: "Scout arrived at 11:42 PM after a street outreach alert from an industrial zone. He was dehydrated, limping, and too fearful to make eye contact. The veterinary team administered warm IV fluids, pain management, and a staged nutrition plan to prevent refeeding shock.",
  },
  {
    day: "Day 3 - First Signs of Safety",
    text: "For the first 48 hours, Scout remained curled in the back of his kennel. By Day 3, he accepted food from a volunteer's open palm and tolerated a brief shoulder touch. We logged this as his first measurable trust milestone.",
  },
  {
    day: "Week 1 - Clinical Workup",
    text: "Bloodwork, imaging, and orthopedic assessment revealed chronic malnutrition and an untreated fracture in his rear limb. A donor-funded care grant covered diagnostics, fracture correction planning, medication, and physiotherapy prep.",
  },
  {
    day: "Week 2 - Trust Conditioning",
    text: "Scout began confidence sessions in low-stimulus rooms with soft sounds and predictable routines. He progressed from retreating at every movement to initiating contact for brief check-ins and accepting leash guidance.",
  },
  {
    day: "Week 3 - Corrective Surgery",
    text: "Orthopedic surgery was completed without complications. The next ten days focused on pain control, wound care, and assisted standing exercises. He showed exceptional resilience and maintained appetite through recovery.",
  },
  {
    day: "Week 5 - Mobility Breakthrough",
    text: "After progressive physiotherapy, Scout completed his first full corridor walk without collapse or panic. His gait improved steadily, and stress indicators dropped by 61% compared to intake week observations.",
  },
  {
    day: "Week 7 - Social Reintegration",
    text: "Scout participated in controlled social circles with calm dogs and trained handlers. He learned engagement cues, recovery cues, and touch consent signals, allowing him to transition from survival behavior to relational behavior.",
  },
  {
    day: "Week 9 - Therapy Assessment",
    text: "Our clinical behavior unit tested Scout for pediatric therapy suitability: startling recovery, sustained calm, and gentle approach behavior. He passed all three stages and began supervised hospital introductions.",
  },
  {
    day: "Week 11 - First Pediatric Visit",
    text: "Scout completed his first official pediatric wing visit, staying calm through medical equipment noise and rotating care teams. Children who had resisted interaction requested to sit with him during treatment intervals.",
  },
  {
    day: "Today - Ongoing Impact",
    text: "Scout now serves as a certified therapy companion twice weekly while remaining under preventive orthopedic monitoring. His journey from fear to service reflects exactly what donor-backed, trauma-informed care can achieve.",
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
              <small>&quot;The data is in the wagging tails.&quot;</small>
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

