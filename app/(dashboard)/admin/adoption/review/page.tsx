"use client";

import Link from "next/link";
import { useState } from "react";
import AdminThemeToggle from "@/components/AdminThemeToggle";

type BoardCard = {
  applicant: string;
  pet: string;
  note: string;
  image: string;
  urgent?: boolean;
  selected?: boolean;
};

type BoardColumn = {
  title: string;
  cards: BoardCard[];
};

const boardColumns: BoardColumn[] = [
  {
    title: "Pending Review",
    cards: [
      {
        applicant: "Marcus Thorne",
        pet: "Bella (Golden)",
        note: "Submitted 3h ago",
        image: "/images/unsplash/photo-1544005313-94ddf0286df2.jpg",
        urgent: true,
      },
      {
        applicant: "Elena Rodriguez",
        pet: "Socks (Tabby)",
        note: "Submitted 5h ago",
        image: "/images/unsplash/photo-1524504388940-b1c1722653e1.jpg",
      },
    ],
  },
  {
    title: "Shortlisted",
    cards: [
      {
        applicant: "David & Claire Ames",
        pet: "Duke (Labrador)",
        note: "Last updated 24m ago",
        image: "/images/unsplash/photo-1500648767791-00dcc994a43e.jpg",
        selected: true,
      },
    ],
  },
  {
    title: "Home Visit",
    cards: [
      {
        applicant: "Sarah Miller",
        pet: "Apollo",
        note: "Tomorrow, 10:30 AM",
        image: "/images/unsplash/photo-1580489944761-15a19d654956.jpg",
      },
    ],
  },
];

const timeline = [
  {
    time: "Oct 14, 2:34 PM",
    note: "Phone screening completed by Sarah Jenkins. Recommended for shortlist.",
  },
  {
    time: "Oct 12, 10:15 AM",
    note: "Application submitted via website.",
  },
];

export default function AdoptionReviewPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="admin-page admin-mobile-shell adoption-review-page">
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
            <p>NGO Director</p>
            <small>Sarah Jenkins</small>
          </div>
        </div>
      </aside>

      <div
        className={`admin-sidebar-backdrop ${isSidebarOpen ? "show" : ""}`.trim()}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden={!isSidebarOpen}
      />

      <main className="admin-main adoption-review-main">
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
            <input aria-label="Search" placeholder="Search applications or animals..." type="text" />
          </div>
          <div className="admin-top-icons">
            <AdminThemeToggle />
            <span>🔔</span>
            <span>⚙️</span>
            <span>?</span>
          </div>
        </header>

        <section className="ar-content">
          <article className="ar-board">
            <p className="ar-breadcrumb">Dashboard / Adoption Pipeline</p>
            <h1>Pipeline Board</h1>
            <p>Reviewing 24 active adoption applications across 5 stages.</p>

            <ul className="ar-stage-list" aria-label="Pipeline stages">
              <li>Pending Review</li>
              <li>Shortlisted</li>
              <li>Home Visit</li>
            </ul>

            <div className="ar-columns">
              {boardColumns.map((column) => (
                <section key={column.title} className="ar-column">
                  <h2>{column.title}</h2>
                  <div className="ar-card-stack">
                    {column.cards.map((card) => (
                      <article
                        key={`${column.title}-${card.applicant}`}
                        className={`ar-card ${card.selected ? "selected" : ""}`.trim()}
                      >
                        {card.urgent ? <span className="ar-urgent">Urgent</span> : null}
                        <div className="ar-card-head">
                          <h3>{card.applicant}</h3>
                          <p>Applied for: {card.pet}</p>
                        </div>
                        <div className="ar-card-foot">
                          <img src={card.image} alt={card.applicant} loading="lazy" />
                          <small>{card.note}</small>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </article>

          <aside className="ar-details">
            <div className="ar-details-head">
              <h2>Application Details</h2>
              <span>Shortlisted</span>
            </div>

            <article className="ar-profile">
              <img
                src="/images/unsplash/photo-1560250097-0b93528c311a.jpg"
                alt="David and Claire"
              />
              <div>
                <h3>David &amp; Claire Ames</h3>
                <p>Applied for Duke (Black Labrador)</p>
                <small>Seattle, WA • House with garden</small>
              </div>
            </article>

            <article className="ar-panel">
              <h4>Lifestyle &amp; Environment</h4>
              <p>
                Do you have other pets? Yes, one elderly Golden Retriever who is
                very calm. We are looking for a companion for him.
              </p>
              <p>
                How many hours will the dog be left alone? Max 3-4 hours. Claire
                works from home 4 days a week.
              </p>
            </article>

            <article className="ar-panel">
              <h4>Reviewer Notes</h4>
              <textarea placeholder="Add decision notes or observations from phone screening..." rows={4} />
            </article>

            <article className="ar-panel timeline">
              <h4>Activity Timeline</h4>
              <ul>
                {timeline.map((item) => (
                  <li key={item.time}>
                    <small>{item.time}</small>
                    <p>{item.note}</p>
                  </li>
                ))}
              </ul>
            </article>

            <div className="ar-action-row">
              <button type="button" className="ar-secondary">
                Request Info
              </button>
              <button type="button" className="ar-danger">
                Reject
              </button>
            </div>

            <button type="button" className="ar-primary">
              Schedule Home Visit
            </button>
          </aside>
        </section>
      </main>
    </div>
  );
}
