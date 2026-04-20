"use client";

import Link from "next/link";
import { useState } from "react";

const animalCards = [
  {
    species: "Canine",
    id: "#ID-40992",
    name: "Cooper",
    intake: "Oct 12, 2023",
    status: "Observation",
    fed: "08:30 AM",
    medication: "Apoquel 10mg",
    notes:
      "Slightly lethargic this morning. Avoided hard kibble, preferred wet food topper.",
    image:
      "https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=1000&q=80",
    chip: "Log Completed",
    chipTone: "ok",
  },
  {
    species: "Feline",
    id: "#ID-43812",
    name: "Luna",
    intake: "Nov 05, 2023",
    status: "Healthy",
    fed: "07:45 AM",
    medication: "Insulin due 10:00 AM",
    notes:
      "Extremely affectionate. Purring loudly during morning check. Weight stable at 4.2kg.",
    image:
      "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=1000&q=80",
    chip: "Meds Pending",
    chipTone: "warn",
  },
];

const ledgerRows = [
  {
    name: "Maximus",
    id: "#2201",
    species: "German Shepherd",
    location: "Kennel B-12",
    health: "Stable",
    care: "Daily log done",
  },
  {
    name: "Apollo",
    id: "#1054",
    species: "Equine / Arabian",
    location: "Stable North 4",
    health: "Critical",
    care: "Log overdue",
  },
];

const careUpdates = [
  {
    title: "Vaccination Record Update",
    subtitle: "Rabies booster administered by Dr. Aris.",
    time: "20 mins ago",
  },
  {
    title: "Special Dietary Note",
    subtitle: "Transitioning to prescription diabetic wet pack.",
    time: "1 hour ago",
  },
  {
    title: "Behavioral Observation",
    subtitle: "Positive social interaction with other males.",
    time: "3 hours ago",
  },
];

export default function InventoryPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="admin-page admin-mobile-shell inventory-page">
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
            <li className="active">
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
            <p>Admin Profile</p>
            <small>Sarah Jenkins</small>
          </div>
        </div>
      </aside>

      <div
        className={`admin-sidebar-backdrop ${isSidebarOpen ? "show" : ""}`.trim()}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden={!isSidebarOpen}
      />

      <main className="admin-main inventory-main">
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
              placeholder="Search animal ID or name..."
              type="text"
            />
          </div>
          <div className="admin-top-icons">
            <span>🔔</span>
            <span>⚙️</span>
            <span>?</span>
          </div>
        </header>

        <section className="inventory-head">
          <div>
            <h1>Animal Inventory</h1>
            <p>Currently housing 142 rescues across 3 wings.</p>
          </div>
          <div className="inventory-actions">
            <button className="ghost-action" type="button">
              Export Schedule
            </button>
            <button className="solid-action" type="button">
              Add New Animal
            </button>
          </div>
        </section>

        <section className="inventory-filter-row">
          <div className="filter-group">
            <p>Species</p>
            <button type="button">All Species</button>
          </div>
          <div className="filter-group">
            <p>Health Status</p>
            <button type="button">All Statuses</button>
          </div>
          <div className="filter-group">
            <p>Care Log</p>
            <button type="button">Any Status</button>
          </div>
          <div className="filter-group sort">
            <p>Sort By</p>
            <button type="button">Recent Intake</button>
          </div>
        </section>

        <section className="inventory-grid">
          {animalCards.map((animal) => (
            <article key={animal.id} className="animal-card">
              <div
                className="animal-hero"
                style={{
                  backgroundImage: `linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.75) 100%), url(${animal.image})`,
                }}
              >
                <div className="animal-badges">
                  <span>{animal.species}</span>
                  <span>{animal.id}</span>
                </div>
                <p className={`chip ${animal.chipTone}`}>{animal.chip}</p>
              </div>
              <div className="animal-body">
                <div className="animal-title-row">
                  <h2>{animal.name}</h2>
                  <span className="status-tag">{animal.status}</span>
                </div>
                <p className="intake">Intake: {animal.intake}</p>

                <div className="animal-meta">
                  <div>
                    <p>Last Fed</p>
                    <strong>{animal.fed}</strong>
                  </div>
                  <div>
                    <p>Medication</p>
                    <strong>{animal.medication}</strong>
                  </div>
                </div>

                <div>
                  <p className="note-title">Behavior Notes</p>
                  <p className="note-text">{animal.notes}</p>
                </div>

                <button className="record-btn" type="button">
                  View Full Record
                </button>
              </div>
            </article>
          ))}

          <aside className="inventory-side">
            <article className="round-summary">
              <h3>Morning Round Summary</h3>
              <div>
                <p>Animals Fed</p>
                <strong>128/142</strong>
              </div>
              <div className="progress" role="progressbar" aria-valuenow={90} />
              <div>
                <p>Meds Administered</p>
                <strong>12/15</strong>
              </div>
              <div className="progress short" role="progressbar" aria-valuenow={80} />
            </article>

            <article className="care-updates">
              <h3>Recent Care Updates</h3>
              <ul>
                {careUpdates.map((item) => (
                  <li key={item.title}>
                    <span className="update-dot" />
                    <div>
                      <strong>{item.title}</strong>
                      <small>{item.time}</small>
                      <p>{item.subtitle}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <button type="button">View All Logs</button>
            </article>
          </aside>
        </section>

        <section className="ledger-panel">
          <div className="panel-head">
            <h2>Full Inventory Ledger</h2>
            <div className="ledger-view-switch">
              <button type="button">Grid</button>
              <button type="button" className="active">
                List
              </button>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Animal</th>
                <th>ID / Species</th>
                <th>Current Location</th>
                <th>Health Status</th>
                <th>Care Log Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ledgerRows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>{row.name}</strong>
                  </td>
                  <td>
                    {row.id}
                    <small>{row.species}</small>
                  </td>
                  <td>{row.location}</td>
                  <td>
                    <span className={`health-pill ${row.health.toLowerCase()}`}>
                      {row.health}
                    </span>
                  </td>
                  <td>{row.care}</td>
                  <td>...</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

      </main>
    </div>
  );
}
