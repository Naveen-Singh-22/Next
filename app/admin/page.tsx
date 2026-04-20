import Link from "next/link";

const metrics = [
  { label: "Total Animals", value: "85", note: "+4%", accent: "up" },
  { label: "Adoption Ready", value: "24", note: "verified", accent: "good" },
  { label: "Pending Rescue", value: "6", note: "Priority", accent: "warn" },
  { label: "Vaccines Due", value: "12", note: "Today", accent: "alert" },
  { label: "Monthly Donations", value: "$18,400", note: "this month", accent: "money" },
];

const requests = [
  { id: "#RQ-4921", reporter: "Sarah Jenkins", urgency: "HIGH", status: "Reported", time: "12 mins ago" },
  { id: "#RQ-4918", reporter: "Marcus Thorne", urgency: "MEDIUM", status: "Assigned", time: "1 hour ago" },
  { id: "#RQ-4915", reporter: "Elena Rodriguez", urgency: "LOW", status: "Assigned", time: "3 hours ago" },
  { id: "#RQ-4899", reporter: "David Chen", urgency: "HIGH", status: "Reported", time: "5 hours ago" },
];

const alerts = [
  { name: "Barnaby", item: "Rabies Booster", date: "Today" },
  { name: "Luna", item: "FVRCP Type 2", date: "Today" },
  { name: "Cooper", item: "Distemper-Parvo", date: "Tomorrow" },
];

export default function AdminPage() {
  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <Link href="/">thecaninehelp</Link>
          <small>Shelter Operations</small>
        </div>

        <nav>
          <ul className="admin-nav">
            <li className="active">
              <Link href="/admin">Overview</Link>
            </li>
            <li>
              <Link href="/admin/rescue">Rescue Management</Link>
            </li>
            <li>
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
            <small>Shelter Operations</small>
          </div>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <input
            aria-label="Search"
            placeholder="Search animals, records, or inquiries..."
            type="text"
          />
          <div className="admin-top-icons">
            <span>🔔</span>
            <span>⚙️</span>
            <span>?</span>
            <span className="avatar">AD</span>
          </div>
        </header>

        <section className="admin-title">
          <h1>Overview Dashboard</h1>
          <p>Monday, May 20, 2024 • System Operational</p>
        </section>

        <section className="metric-grid">
          {metrics.map((metric) => (
            <article key={metric.label} className={`metric-card ${metric.accent}`}>
              <p>{metric.label}</p>
              <h3>{metric.value}</h3>
              <span>{metric.note}</span>
            </article>
          ))}
        </section>

        <section className="admin-grid">
          <article className="table-panel">
            <div className="panel-head">
              <h2>Recent Rescue Requests</h2>
              <Link href="/rescue">View All</Link>
            </div>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Reporter</th>
                  <th>Urgency</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.reporter}</td>
                    <td>
                      <span className={`urgency-pill ${row.urgency.toLowerCase()}`}>
                        {row.urgency}
                      </span>
                    </td>
                    <td>{row.status}</td>
                    <td>{row.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>

          <article className="occupancy-panel">
            <h2>Shelter Occupancy</h2>
            <div className="ring-wrap">
              <div className="ring">
                <strong>82%</strong>
                <small>Full</small>
              </div>
            </div>
            <ul>
              <li>
                <span className="dot filled" />Occupied Beds <strong>66</strong>
              </li>
              <li>
                <span className="dot free" />Available Beds <strong>14</strong>
              </li>
            </ul>
          </article>

          <article className="vaccination-panel">
            <h2>Vaccination Alerts</h2>
            <div className="vaccination-list">
              {alerts.map((alert) => (
                <div key={alert.name} className="vaccination-item">
                  <span className="pet-thumb">🐶</span>
                  <div>
                    <p>{alert.name}</p>
                    <small>{alert.item}</small>
                  </div>
                  <span className="due-tag">{alert.date}</span>
                </div>
              ))}
            </div>
            <button className="outline-btn" type="button">
              Update Medical Logs
            </button>
          </article>

          <article className="story-banner">
            <p>Success Story</p>
            <h3>"Ollie found a forever home in Bristol today."</h3>
            <small>
              Through our streamlined adoption pipeline, Ollie transitioned from
              rescue to family in just 14 days.
            </small>
            <Link href="/">Read the Impact Report →</Link>
          </article>
        </section>

        <footer className="admin-footer">
          <p>thecaninehelp</p>
          <small>© 2026 thecaninehelp NGO. All rights reserved.</small>
          <div>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">System Status</a>
          </div>
        </footer>
      </main>
    </div>
  );
}
