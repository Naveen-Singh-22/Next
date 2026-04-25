"use client";

import Link from "next/link";
import { useState } from "react";
import AdminThemeToggle from "@/components/AdminThemeToggle";

type VaccineRow = {
  animal: string;
  species: string;
  ward: string;
  vaccine: string;
  dose: string;
  dueDate: string;
  dueNote: string;
  status: "overdue" | "today" | "upcoming";
  image: string;
};

const vaccineRows: VaccineRow[] = [
  {
    animal: "Cooper",
    species: "Canine",
    ward: "Kennel 4A",
    vaccine: "Rabies Booster",
    dose: "Clinical Grade A",
    dueDate: "Oct 22, 2023",
    dueNote: "5 days overdue",
    status: "overdue",
    image: "/images/unsplash/photo-1507146426996-ef05306b995a.jpg",
  },
  {
    animal: "Luna",
    species: "Feline",
    ward: "Cattery B",
    vaccine: "FVRCP Combination",
    dose: "Primary Course",
    dueDate: "Oct 27, 2023",
    dueNote: "Today",
    status: "today",
    image: "/images/unsplash/photo-1519052537078-e6302a4968d4.jpg",
  },
  {
    animal: "Barnaby",
    species: "Canine",
    ward: "Quarantine 1",
    vaccine: "Distemper/Parvo",
    dose: "Booster Tier 2",
    dueDate: "Nov 02, 2023",
    dueNote: "in 6 days",
    status: "upcoming",
    image: "/images/unsplash/photo-1543466835-00a7907e9de1.jpg",
  },
  {
    animal: "Sasha",
    species: "Canine",
    ward: "Intake Run 12",
    vaccine: "Leptospirosis",
    dose: "Seasonal Prep",
    dueDate: "Nov 05, 2023",
    dueNote: "in 9 days",
    status: "upcoming",
    image: "/images/unsplash/photo-1517849845537-4d257902454a.jpg",
  },
];

const appointments = [
  { title: "Luna's FVRCP", subtitle: "Scheduled at 2:30 PM" },
  { title: "New Intake Batch (4)", subtitle: "Scheduled at 4:00 PM" },
];

const calendarWeekdays = ["S", "M", "T", "W", "T", "F", "S"];

const calendarWeeks = [
  [1, 2, 3, 4, 5, 6, 7],
  [8, 9, 10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19, 20, 21],
  [22, 23, 24, 25, 26, 27, 28],
  [29, 30, 31, null, null, null, null],
];

export default function VaccinationsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="admin-page admin-mobile-shell vaccinations-page">
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
              <Link href="/admin/adoption">Adoption Pipeline</Link>
            </li>
            <li>
              <Link href="/admin/inventory">Animal Inventory</Link>
            </li>
            <li className="active">
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
            <p>NGO Admin</p>
            <small>Global Access</small>
          </div>
        </div>
      </aside>

      <div
        className={`admin-sidebar-backdrop ${isSidebarOpen ? "show" : ""}`.trim()}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden={!isSidebarOpen}
      />

      <main className="admin-main vaccination-main">
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
            <input aria-label="Search" placeholder="Search animal records..." type="text" />
          </div>
          <div className="admin-top-icons">
            <AdminThemeToggle />
            <span>🔔</span>
            <span>⚙️</span>
            <span className="avatar">AD</span>
          </div>
        </header>

        <section className="vaccination-head">
          <div>
            <h1>Vaccination Registry</h1>
            <p>Monitoring and scheduling clinical immunization for 124 residents.</p>
          </div>
          <div className="vaccination-head-actions">
            <button type="button" className="vax-ghost">
              Export Report
            </button>
            <button type="button" className="vax-solid">
              Schedule Mass Batch
            </button>
          </div>
        </section>

        <section className="vaccination-layout">
          <article className="vaccination-table-panel">
            <div className="vaccination-panel-head">
              <h2>Active Schedule</h2>
              <div className="vaccination-filters">
                <button type="button">Priority</button>
                <button type="button">All Tasks</button>
                <span>Sort by: Date Due</span>
              </div>
            </div>

            <table className="vaccination-table">
              <thead>
                <tr>
                  <th>Animal Details</th>
                  <th>Vaccine Type</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {vaccineRows.map((row) => (
                  <tr key={`${row.animal}-${row.vaccine}`}>
                    <td>
                      <div className="vax-animal">
                        <img src={row.image} alt={row.animal} loading="lazy" />
                        <div>
                          <strong>{row.animal}</strong>
                          <small>
                            {row.species} • {row.ward}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <strong>{row.vaccine}</strong>
                      <small>{row.dose}</small>
                    </td>
                    <td>
                      <strong>{row.dueDate}</strong>
                      <small>{row.dueNote}</small>
                    </td>
                    <td>
                      <span className={`vax-status ${row.status}`}>{row.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button type="button" className="vax-link-btn">
              View Full Clinical Log
            </button>
          </article>

          <aside className="vaccination-side">
            <article className="vax-calendar-panel">
              <div className="vax-calendar-head">
                <h3>October 2023</h3>
                <span>‹  ›</span>
              </div>
              <div className="vax-calendar-weekdays" aria-hidden="true">
                {calendarWeekdays.map((day, index) => (
                  <span key={`weekday-${index}`}>{day}</span>
                ))}
              </div>
              <div className="vax-calendar-grid">
                {calendarWeeks.map((week, weekIndex) =>
                  week.map((day, dayIndex) => (
                    <span
                      key={`day-${weekIndex}-${dayIndex}`}
                      className={day === 27 ? "active" : undefined}
                    >
                      {day ?? ""}
                    </span>
                  ))
                )}
              </div>

              <h4>Today&apos;s Appointments</h4>
              <ul>
                {appointments.map((item) => (
                  <li key={item.title}>
                    <strong>{item.title}</strong>
                    <small>{item.subtitle}</small>
                  </li>
                ))}
              </ul>
            </article>

            <article className="vax-quote-card">
              <p>
                "Prevention is the kindest form of care we provide our residents."
              </p>
              <small>Dr. Elena Thorne • Chief Veterinarian</small>
            </article>

            <article className="vax-resource-panel">
              <h4>Protocol Resources</h4>
              <a href="#">2023 Rabies Guidelines</a>
              <a href="#">Shelter Disinfection SOP</a>
            </article>
          </aside>
        </section>
      </main>
    </div>
  );
}
