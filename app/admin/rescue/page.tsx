import Link from "next/link";

type RescueCase = {
  id: string;
  priority: "HIGH" | "MED" | "LOW";
  title: string;
  location: string;
  officer: string;
  status: string;
  actionPrimary: string;
  actionSecondary: string;
  image: string;
};

const rescueCases: RescueCase[] = [
  {
    id: "#RES-2094",
    priority: "HIGH",
    title: "Injured Golden Retriever",
    location: "East 42nd St & 2nd Ave, NY",
    officer: "Sarah Miller",
    status: "Reported",
    actionPrimary: "Assign Staff",
    actionSecondary: "Update Status",
    image:
      "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "#RES-2098",
    priority: "MED",
    title: "Abandoned Feline Colony",
    location: "Brooklyn Navy Yard, Pier 4",
    officer: "James Chen",
    status: "Assigned",
    actionPrimary: "Admit to Shelter",
    actionSecondary: "Update Status",
    image:
      "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "#RES-2103",
    priority: "LOW",
    title: "Stranded Husky (Dehydrated)",
    location: "Central Park West, 72nd Entrance",
    officer: "Officer K. Woods",
    status: "Admitted",
    actionPrimary: "View Health Log",
    actionSecondary: "Case Details",
    image:
      "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=300&q=80",
  },
];

const operationsLog = [
  { note: "Unit 4 arrived at Pier 4", time: "2 minutes ago", tone: "ok" },
  { note: "New report: Stray canine #RES-2114", time: "12 minutes ago", tone: "warn" },
  { note: "#RES-2090 moved to Recovery Ward", time: "1 hour ago", tone: "info" },
];

export default function RescueManagementPage() {
  return (
    <div className="admin-page rescue-management-page">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <Link href="/">thecaninehelp</Link>
          <small>Shelter Operations</small>
        </div>

        <nav>
          <ul className="admin-nav">
            <li>
              <Link href="/admin">Overview</Link>
            </li>
            <li className="active">
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
            <small>Sign Out</small>
          </div>
        </div>
      </aside>

      <main className="admin-main rescue-management-main">
        <header className="admin-topbar">
          <input aria-label="Search" placeholder="Search rescue cases..." type="text" />
          <div className="admin-top-icons">
            <span>🔔</span>
            <span>⚙️</span>
            <span>?</span>
            <strong className="rm-head-title">Admin Dashboard</strong>
          </div>
        </header>

        <section className="rm-title-row">
          <div>
            <h1>Rescue Management</h1>
            <p>Real-time animal advocacy and response pipeline.</p>
          </div>
          <div className="rm-filter-row">
            <button type="button">All Statuses</button>
            <input type="date" aria-label="Filter by date" />
          </div>
        </section>

        <section className="rm-layout">
          <article className="rm-pipeline-panel">
            <div className="rm-panel-head">
              <h2>Active Rescue Pipeline</h2>
              <small>14 Active Cases</small>
            </div>

            <div className="rm-case-list">
              {rescueCases.map((item) => (
                <article key={item.id} className="rm-case-item">
                  <img src={item.image} alt={item.title} loading="lazy" />
                  <div className="rm-case-copy">
                    <div className="rm-case-head">
                      <span className={`rm-priority ${item.priority.toLowerCase()}`}>{item.priority}</span>
                      <small>{item.id}</small>
                      <h3>{item.title}</h3>
                    </div>
                    <p>{item.location}</p>
                    <div className="rm-meta-row">
                      <span>{item.officer}</span>
                      <span className="rm-status-pill">{item.status}</span>
                    </div>
                  </div>
                  <div className="rm-actions-col">
                    <button type="button" className="rm-primary-btn">
                      {item.actionPrimary}
                    </button>
                    <button type="button" className="rm-secondary-btn">
                      {item.actionSecondary}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </article>

          <aside className="rm-side-col">
            <article className="rm-map-panel">
              <div className="rm-panel-head compact">
                <h2>Dispatch Map</h2>
                <a href="#">Full Map</a>
              </div>
              <div className="rm-map-box" aria-label="Map preview">
                <span className="pin pin-a" />
                <span className="pin pin-b" />
                <span className="pin pin-c" />
                <span className="pin pin-d" />
              </div>
              <p>Active response units: 4 on ground, 2 in transit.</p>
            </article>

            <div className="rm-kpi-grid">
              <article>
                <strong>28</strong>
                <p>Rescues Today</p>
              </article>
              <article>
                <strong>14m</strong>
                <p>Avg. Response</p>
              </article>
            </div>

            <article className="rm-log-panel">
              <h2>Operations Log</h2>
              <ul>
                {operationsLog.map((entry) => (
                  <li key={entry.note} className={`tone-${entry.tone}`}>
                    <strong>{entry.note}</strong>
                    <small>{entry.time}</small>
                  </li>
                ))}
              </ul>
            </article>
          </aside>
        </section>

        <footer className="admin-footer">
          <p>thecaninehelp</p>
          <small>© 2026 thecaninehelp NGO. All rights reserved.</small>
          <div>
            <a href="#">Contact Us</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Social Media</a>
          </div>
        </footer>
      </main>
    </div>
  );
}
