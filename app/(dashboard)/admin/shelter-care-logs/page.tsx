"use client";

import Link from "next/link";
import { useState } from "react";
import AdminThemeToggle from "@/components/AdminThemeToggle";

const locationFilters = [
  { label: "All Wings", count: 48, active: true },
  { label: "North Wing (Dogs)", count: 22 },
  { label: "East Wing (Cats)", count: 14 },
  { label: "ICU / Recovery", count: 5 },
  { label: "Quarantine", count: 7 },
];

const careLogRows = [
  {
    name: "Max",
    species: "Dog • North Wing • K-12",
    food: "Watered",
    meds: "Overdue",
    notes: "High energy today, enjoyed outdoor time but slight limp in rear left paw.",
    staff: "S. Miller",
    badge: "alert",
    image: "/images/unsplash/photo-1517849845537-4d257902454a.jpg",
  },
  {
    name: "Luna",
    species: "Cat • East Wing • C-04",
    food: "Fed",
    meds: "Due",
    notes: "No unusual behavior noted.",
    staff: "J. Doe",
    badge: "calm",
    image: "/images/unsplash/photo-1519052537078-e6302a4968d4.jpg",
  },
  {
    name: "Pippin",
    species: "Dog • North Wing • K-02",
    food: "Fed",
    meds: "Done",
    notes: "Appetite is improving. Still cautious with new staff members.",
    staff: "S. Miller",
    badge: "good",
    image: "/images/unsplash/photo-1548199973-03cce0bbc87b.jpg",
  },
];

const timelineItems = [
  { title: "Morning Feed Logged", time: "08:15 AM by J. Doe", active: true },
  { title: "Exercise Walk", time: "10:30 AM by S. Miller" },
  { title: "Evening Meds", time: "Scheduled 06:00 PM" },
];

export default function ShelterCareLogsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="admin-page admin-mobile-shell care-logs-page">
      <aside className={`admin-sidebar admin-mobile-sidebar ${isSidebarOpen ? "open" : ""}`.trim()}>
        <div className="admin-brand">
          <Link href="/">thecaninehelp</Link>
          <small>Global Admin Access</small>
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
              <Link href="/admin/adoption">Adoption Pipeline</Link>
            </li>
            <li>
              <Link href="/admin/inventory">Animal Inventory</Link>
            </li>
            <li>
              <Link href="/admin/vaccinations">Vaccinations</Link>
            </li>
            <li className="active">
              <Link href="/admin/shelter-care-logs">Shelter Care Logs</Link>
            </li>
            <li>
              <Link href="/admin/inquiry-management">Inquiries</Link>
            </li>
          </ul>
        </nav>

        <button className="alert-btn" type="button">
          New Rescue Entry
        </button>

        <div className="admin-user">
          <span>🗒️</span>
          <div>
            <p>System Health</p>
            <small>Stable</small>
          </div>
        </div>
      </aside>

      <div
        className={`admin-sidebar-backdrop ${isSidebarOpen ? "show" : ""}`.trim()}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden={!isSidebarOpen}
      />

      <main className="admin-main care-logs-main">
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
            <input aria-label="Search" placeholder="Search logs..." type="text" />
          </div>
          <div className="admin-top-icons">
            <AdminThemeToggle />
            <span>🔔</span>
            <span>⚙️</span>
            <span className="avatar">AD</span>
          </div>
        </header>

        <section className="care-logs-head">
          <div>
            <h1>Daily Care Logs</h1>
            <p>Managing 48 residents across 4 shelter wings</p>
          </div>
          <div className="care-logs-actions">
            <button className="care-action ghost" type="button">
              Watered All
            </button>
            <button className="care-action solid" type="button">
              Fed All
            </button>
          </div>
        </section>

        <section className="care-logs-layout">
          <aside className="care-logs-filter-card">
            <h2>Filter by Location</h2>
            <div className="care-filter-list">
              {locationFilters.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className={item.active ? "active" : ""}
                >
                  <span>{item.label}</span>
                  <strong>{item.count}</strong>
                </button>
              ))}
            </div>
          </aside>

          <section className="care-logs-table-card">
            <table className="care-logs-table">
              <thead>
                <tr>
                  <th>Animal</th>
                  <th>Food</th>
                  <th>Meds</th>
                  <th>Behavioral Notes</th>
                  <th>Staff Sign</th>
                </tr>
              </thead>
              <tbody>
                {careLogRows.map((row) => (
                  <tr key={row.name}>
                    <td>
                      <div className="care-animal">
                        <img src={row.image} alt={row.name} loading="lazy" />
                        <div>
                          <strong>{row.name}</strong>
                          <small>{row.species}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`care-pill ${row.badge}`}>{row.food}</span>
                    </td>
                    <td>
                      <span className={`care-pill meds ${row.badge}`}>{row.meds}</span>
                    </td>
                    <td>
                      <p>{row.notes}</p>
                    </td>
                    <td>
                      <span className="staff-sign">{row.staff}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <aside className="care-logs-side">
            <article className="care-alert-card">
              <h3>Critical Alerts</h3>
              <p>3 residents require immediate medical logging.</p>
              <ul>
                <li>
                  <strong>#204 (Max)</strong>
                  <span>Cardiac Medication</span>
                </li>
                <li>
                  <strong>#118 (Luna)</strong>
                  <span>Post-Op Observation</span>
                </li>
              </ul>
            </article>

            <article className="care-timeline-card">
              <div className="care-timeline-head">
                <h3>Log Activity Timeline (Max)</h3>
                <span>TODAY</span>
              </div>
              <ul>
                {timelineItems.map((item) => (
                  <li key={item.title} className={item.active ? "active" : ""}>
                    <strong>{item.title}</strong>
                    <small>{item.time}</small>
                  </li>
                ))}
              </ul>
            </article>

            <article className="care-summary-card">
              <h3>Overall Completion</h3>
              <strong>82%</strong>
              <p>of daily tasks finished</p>
              <div className="care-progress" aria-hidden="true">
                <span />
              </div>
              <div className="care-stats">
                <div>
                  <strong>38</strong>
                  <span>Done</span>
                </div>
                <div>
                  <strong>10</strong>
                  <span>Pending</span>
                </div>
              </div>
            </article>
          </aside>
        </section>
      </main>
    </div>
  );
}