"use client";

import Link from "next/link";
import { useState } from "react";
import AdminThemeToggle from "@/components/AdminThemeToggle";

type PipelineCard = {
  applicant: string;
  pet: string;
  date: string;
  tone: string;
  image: string;
  tag?: string;
  location?: string;
};

type PipelineLane = {
  id: string;
  title: string;
  cards: PipelineCard[];
};

const lanes: PipelineLane[] = [
  {
    id: "pending",
    title: "Pending Review",
    cards: [
      {
        applicant: "Sarah Jenkins",
        pet: "Cooper",
        date: "Oct 12, 2023",
        tone: "warm",
        image: "/images/unsplash/photo-1544723795-3fb6469f5b39.jpg",
      },
      {
        applicant: "Michael Chen",
        pet: "Luna",
        date: "Oct 14, 2023",
        tone: "neutral",
        image: "/images/unsplash/photo-1500648767791-00dcc994a43e.jpg",
      },
    ],
  },
  {
    id: "shortlisted",
    title: "Shortlisted",
    cards: [
      {
        applicant: "Emma Watson",
        pet: "Bailey",
        date: "Oct 08, 2023",
        tag: "Background Check OK",
        tone: "mint",
        image: "/images/unsplash/photo-1524504388940-b1c1722653e1.jpg",
      },
    ],
  },
  {
    id: "homevisit",
    title: "Home Visit",
    cards: [
      {
        applicant: "Liam O'Connor",
        pet: "Felix",
        date: "Tomorrow, 10:30 AM",
        location: "Brooklyn, NY",
        tag: "Scheduled",
        tone: "blue",
        image: "/images/unsplash/photo-1542204625-de293a38bda2.jpg",
      },
    ],
  },
  {
    id: "final",
    title: "Final Approval",
    cards: [
      {
        applicant: "Noah Clark",
        pet: "Milo",
        date: "Awaiting Director Sign-Off",
        tone: "neutral",
        image: "/images/unsplash/photo-1472099645785-5658abf4ff4e.jpg",
      },
    ],
  },
  {
    id: "adopted",
    title: "Adopted",
    cards: [
      {
        applicant: "David Miller",
        pet: "Snowball",
        date: "Completed",
        tone: "mint",
        image: "/images/unsplash/photo-1560250097-0b93528c311a.jpg",
      },
      {
        applicant: "Sarah Thompson",
        pet: "Rocket",
        date: "Completed",
        tone: "mint",
        image: "/images/unsplash/photo-1544005313-94ddf0286df2.jpg",
      },
    ],
  },
];

export default function AdoptionPipelinePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="admin-page admin-mobile-shell adoption-page">
      <aside className={`admin-sidebar admin-mobile-sidebar ${isSidebarOpen ? "open" : ""}`.trim()}>
        <div className="admin-brand">
          <Link href="/">thecaninehelp</Link>
          <small>Shelter Operations</small>
        </div>

        <button
          className="admin-sidebar-close"
          type="button"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close admin menu"
        >
          Close
        </button>

        <nav>
          <ul className="admin-nav">
            <li>
              <Link href="/admin">Overview</Link>
            </li>
            <li>
              <Link href="/admin/rescue">Rescue Management</Link>
            </li>
            <li className="active">
              <Link href="/admin/adoption">Adoption Pipeline</Link>
            </li>
            <li>
              <Link href="/inventory">Animal Inventory</Link>
            </li>
            <li>
              <Link href="/admin/vaccinations">Vaccinations</Link>
            </li>
            <li>
              <Link href="/admin/shelter-care-logs">Shelter Care Logs</Link>
            </li>
            <li>
              <Link href="/admin/inquiry-management">Inquiries</Link>
            </li>
          </ul>
        </nav>

        <button className="alert-btn" type="button">
          Emergency Alert
        </button>

        <div className="admin-user">
          <span>👩🏽‍💻</span>
          <div>
            <p>Admin Portal</p>
            <small>Adoption Team</small>
          </div>
        </div>
      </aside>

      <div
        className={`admin-sidebar-backdrop ${isSidebarOpen ? "show" : ""}`.trim()}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden={!isSidebarOpen}
      />

      <main className="admin-main adoption-main">
        <header className="admin-topbar">
          <div className="admin-topbar-start">
            <button
              className="admin-menu-btn"
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open admin menu"
              aria-expanded={isSidebarOpen}
            >
              <span />
              <span />
              <span />
            </button>
            <input
              aria-label="Search"
              placeholder="Search applications or animals..."
              type="text"
            />
          </div>
          <div className="admin-top-icons">
            <AdminThemeToggle />
            <span>🔔</span>
            <span>⚙️</span>
            <span className="avatar">AR</span>
          </div>
        </header>

        <section className="adoption-head">
          <div>
            <h1>Adoption Pipeline</h1>
            <p>
              Monitor every stage of rescue-to-home applications and keep approvals
              moving.
            </p>
          </div>
          <div className="adoption-kpis">
            <article>
              <p>Active Apps</p>
              <strong>124</strong>
            </article>
            <article>
              <p>Monthly Goal</p>
              <strong>42</strong>
            </article>
          </div>
        </section>

        <section className="adoption-toolbar" aria-label="Pipeline filters">
          <button className="filter-pill" type="button">
            All Species
          </button>
          <button className="filter-pill" type="button">
            Urgency: High
          </button>
          <p>Showing priority applications first</p>
          <Link href="/admin/adoption/review" className="adoption-review-link">
            Open Review Page
          </Link>
          <div className="view-switch" role="group" aria-label="Board view options">
            <button className="active" type="button">
              Board View
            </button>
            <button type="button">List View</button>
          </div>
        </section>

        <section className="pipeline-board" aria-label="Adoption pipeline board">
          {lanes.map((lane) => (
            <article key={lane.id} className="pipeline-column">
              <h2>
                {lane.title} <span>({lane.cards.length})</span>
              </h2>
              <div className="pipeline-stack">
                {lane.cards.map((card) => (
                  <div key={`${lane.id}-${card.applicant}`} className={`pipeline-card ${card.tone}`}>
                    <div className="pipeline-person">
                      <img
                        className="pipeline-avatar"
                        src={card.image}
                        alt={`${card.applicant} profile photo`}
                        loading="lazy"
                      />
                      <div>
                        <strong>{card.applicant}</strong>
                        <small>
                          Adopting <em>{card.pet}</em>
                        </small>
                      </div>
                    </div>
                    {card.tag ? <p className="pipeline-tag">{card.tag}</p> : null}
                    <p className="pipeline-date">{card.date}</p>
                    {card.location ? <small className="pipeline-location">{card.location}</small> : null}
                    {lane.id === "shortlisted" ? (
                      <Link href="/admin/adoption/review" className="pipeline-review-link">
                        Review Application
                      </Link>
                    ) : null}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>

        <button className="pipeline-fab" type="button" aria-label="Create adoption application">
          +
        </button>
      </main>
    </div>
  );
}
