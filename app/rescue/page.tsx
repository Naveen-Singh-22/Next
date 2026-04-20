import Link from "next/link";
import SiteNav from "../components/SiteNav";

export default function RescuePage() {
  return (
    <div className="rescue-page">
      <SiteNav />

      <main className="section-wrap rescue-main">
        <section className="rescue-head">
          <p className="eyebrow">Emergency Dispatch</p>
          <h1>Report an Animal in Need.</h1>
          <p>
            Your report provides a lifeline. Please provide accurate details to
            help our field teams locate and assess the animal as quickly as
            possible.
          </p>
        </section>

        <section className="rescue-layout">
          <div className="rescue-left">
            <article className="panel">
              <h2>
                <span className="panel-dot">👤</span>
                Reporter Info
              </h2>
              <div className="field-stack">
                <label>
                  Full Name
                  <input placeholder="Jane Doe" type="text" />
                </label>
                <div className="field-grid">
                  <label>
                    Email Address
                    <input placeholder="jane@example.com" type="email" />
                  </label>
                  <label>
                    Phone Number
                    <input placeholder="+1 (555) 000-0000" type="tel" />
                  </label>
                </div>
              </div>
            </article>

            <article className="panel">
              <h2>
                <span className="panel-dot">🐾</span>
                Animal Info
              </h2>
              <div className="field-grid">
                <label>
                  Species
                  <select defaultValue="Dog">
                    <option>Dog</option>
                    <option>Cat</option>
                    <option>Bird</option>
                    <option>Other</option>
                  </select>
                </label>
                <label>
                  Breed (if known)
                  <input placeholder="e.g. Golden Retriever" type="text" />
                </label>
              </div>

              <p className="check-title">Health Condition</p>
              <div className="check-row">
                <label className="chip-check">
                  <input type="checkbox" />
                  Injured
                </label>
                <label className="chip-check">
                  <input type="checkbox" />
                  Malnourished
                </label>
                <label className="chip-check">
                  <input type="checkbox" />
                  Healthy Stray
                </label>
              </div>

              <button className="upload-box" type="button">
                <span className="upload-icon">📷</span>
                Photo Upload (Optional)
                <small>Drag and drop or click to upload</small>
              </button>
            </article>

            <article className="panel">
              <h2>
                <span className="panel-dot notes">📝</span>
                Additional Notes
              </h2>
              <label>
                <textarea
                  placeholder="Describe behavior, specific markings, or any hazards in the area..."
                  rows={6}
                />
              </label>
            </article>
          </div>

          <aside className="rescue-right">
            <article className="panel sticky">
              <h2>
                <span className="panel-dot">📍</span>
                Location
              </h2>
              <div className="map-box" aria-label="Map preview" />

              <label>
                Last Seen Address
                <input placeholder="Street, City, Landmarks..." type="text" />
              </label>

              <p className="check-title">Urgency Level</p>
              <div className="urgency-list">
                <label className="urgency-item">
                  <input name="urgency" type="radio" />
                  <div>
                    <strong>Critical</strong>
                    <small>Life-threatening injury or immediate danger.</small>
                  </div>
                </label>
                <label className="urgency-item">
                  <input name="urgency" type="radio" />
                  <div>
                    <strong>Urgent</strong>
                    <small>Needs medical attention within 24 hours.</small>
                  </div>
                </label>
                <label className="urgency-item selected">
                  <input defaultChecked name="urgency" type="radio" />
                  <div>
                    <strong>Standard</strong>
                    <small>Stable stray, needs routine rescue check.</small>
                  </div>
                </label>
              </div>
            </article>

            <button className="submit-btn" type="button">
              Submit Rescue Report
            </button>

            <article className="panel post-note">
              <h3>Post-Submission</h3>
              <p>
                Upon submission, you will receive a unique Rescue Reference ID.
                This allows you to track response status and see medical updates.
              </p>
            </article>
          </aside>
        </section>
      </main>

      <footer className="footer section-wrap rescue-footer">
        <p className="brand">thecaninehelp</p>
        <div className="footer-links one-line">
          <a href="#">Contact Us</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Social Media</a>
          <Link href="/admin">Admin Portal</Link>
        </div>
        <p>© 2026 thecaninehelp NGO. All rights reserved.</p>
      </footer>
    </div>
  );
}
