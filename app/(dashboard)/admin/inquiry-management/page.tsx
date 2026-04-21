"use client";

import Link from "next/link";
import { useState } from "react";
import AdminThemeToggle from "@/components/AdminThemeToggle";

const inboxItems = [
  {
    tag: "Rescue Tip",
    title: "Injured stray near North Park east entrance",
    preview:
      "I noticed a golden retriever limping near the east entrance of the park. It looks...",
    time: "14m ago",
    initials: "JD",
    assigned: "Assigned: Julian D.",
    tone: "tip",
    selected: true,
  },
  {
    tag: "Volunteer",
    title: "Group Volunteer Opportunity?",
    preview:
      "Our corporate team of 15 is looking for a one-day weekend activity to help with...",
    time: "2h ago",
    initials: "AR",
    assigned: "New",
    tone: "volunteer",
  },
  {
    tag: "General",
    title: "Adoption fee inquiry",
    preview:
      "Hi, I'm interested in 'Luna' but wanted to clarify if the adoption fee includes the...",
    time: "5h ago",
    initials: "KM",
    assigned: "In Progress: Sarah K.",
    tone: "general",
  },
  {
    tag: "Donation Issue",
    title: "Recurring payment failed",
    preview:
      "I received an email saying my monthly donation didn't go through, but I've update...",
    time: "1d ago",
    initials: "MR",
    assigned: "Resolved",
    tone: "donation",
  },
];

const evidence = [
  {
    image: "/images/unsplash/photo-1517849845537-4d257902454a.jpg",
    label: "Field photo",
  },
  {
    image: "/images/unsplash/photo-1507146426996-ef05306b995a.jpg",
    label: "Park entrance",
  },
];

export default function InquiryManagementPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="admin-page admin-mobile-shell inquiry-page">
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
            <li>
              <Link href="/inventory">Animal Inventory</Link>
            </li>
            <li>
              <Link href="/admin/adoption">Adoption Pipeline</Link>
            </li>
            <li>
              <Link href="/admin/vaccinations">Vaccinations</Link>
            </li>
            <li>
              <Link href="/admin/shelter-care-logs">Shelter Care Logs</Link>
            </li>
            <li className="active">
              <Link href="/admin/inquiry-management">Inquiry Management</Link>
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

      <main className="admin-main inquiry-main">
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
            <input aria-label="Search" placeholder="Search inquiries..." type="text" />
          </div>
          <div className="admin-top-icons">
            <AdminThemeToggle />
            <span>🔔</span>
            <span>⚙️</span>
            <div className="inq-user-chip">
              <div>
                <strong>Alex Rivera</strong>
                <small>Chief Curator</small>
              </div>
              <span className="avatar">AR</span>
            </div>
          </div>
        </header>

        <section className="inq-head">
          <div>
            <h1>Inquiry Management</h1>
            <p>
              Curation of public communications and rescue requests. Treat every
              message with the intentional care of our mission.
            </p>
          </div>

          <div className="inq-stats">
            <article>
              <span>Open Inquiries</span>
              <strong>24</strong>
              <small>+4 since yesterday</small>
            </article>
            <article>
              <span>Avg. Response</span>
              <strong>2.4h</strong>
              <small>Within KPI</small>
            </article>
          </div>
        </section>

        <section className="inq-layout">
          <aside className="inq-inbox-card">
            <div className="inq-card-head">
              <h2>Inbox</h2>
              <div className="inq-card-tools">
                <button type="button" aria-label="Filter inbox">
                  ≡
                </button>
                <button type="button" aria-label="Sort inbox">
                  ⇅
                </button>
              </div>
            </div>

            <div className="inq-list">
              {inboxItems.map((item) => (
                <button
                  key={item.title}
                  type="button"
                  className={`inq-item ${item.selected ? "selected" : ""}`.trim()}
                >
                  <span className={`inq-tag ${item.tone}`}>{item.tag}</span>
                  <span className="inq-time">{item.time}</span>
                  <strong>{item.title}</strong>
                  <p>{item.preview}</p>
                  <div className="inq-assignee-row">
                    <span className="inq-initials">{item.initials}</span>
                    <small>{item.assigned}</small>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <article className="inq-detail-card">
            <div className="inq-detail-top">
              <div className="inq-contact">
                <span className="inq-avatar">MS</span>
                <div>
                  <h2>Marcus Sterling</h2>
                  <p>m.sterling@example.com • +1 234 567 890</p>
                </div>
              </div>

              <div className="inq-detail-actions">
                <button type="button" className="inq-secondary-btn">
                  Assign
                </button>
                <button type="button" className="inq-primary-btn">
                  Mark Resolved
                </button>
              </div>
            </div>

            <div className="inq-message-body">
              <div className="inq-meta-row">
                <span className="inq-tag tip">Rescue Tip</span>
                <small>Received Oct 24, 2023 • 10:42 AM</small>
              </div>

              <h3>"Injured stray near North Park east entrance"</h3>

              <p>Hello Compassion Team,</p>
              <p>
                I am writing to report a golden retriever mix that I've seen three
                days in a row near the North Park East entrance (near the stone
                fountain). The dog seems very frightened and is limping heavily on
                its back left leg.
              </p>
              <p>
                It looks quite thin and doesn't have a collar. I tried to approach
                it with some water, but it ran into the thick brush near the
                ravine. I didn't want to chase it and cause more stress.
              </p>
              <p>
                I will be in the area again this afternoon if your rescue team
                needs a specific location pin or more photos. Please let me know
                how I can help.
              </p>
              <p>Thank you for all the incredible work you do.</p>

              <p className="inq-signature">— Marcus</p>
            </div>

            <div className="inq-evidence-block">
              <h4>Attached Evidence (2)</h4>
              <div className="inq-evidence-grid">
                {evidence.map((item) => (
                  <figure key={item.label}>
                    <img src={item.image} alt={item.label} loading="lazy" />
                    <figcaption>{item.label}</figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}