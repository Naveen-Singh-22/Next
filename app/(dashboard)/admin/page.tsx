"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import AdminTopbar from "@/components/AdminTopbar";

type RescueReport = {
  reportId: string;
  fullName: string;
  species: string;
  healthConditions: string[];
  notes: string;
  urgency: "critical" | "urgent" | "standard";
  createdAt: string;
};

type RescueReportsResponse = {
  ok?: boolean;
  message?: string;
  reports?: RescueReport[];
};

async function readJsonSafely(response: Response): Promise<RescueReportsResponse | null> {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.toLowerCase().includes("application/json")) {
    return null;
  }

  return (await response.json().catch(() => null)) as RescueReportsResponse | null;
}

function formatRelativeTime(isoDate: string) {
  const timestamp = new Date(isoDate).getTime();

  if (!Number.isFinite(timestamp)) {
    return "Unknown";
  }

  const secondsDiff = Math.round((timestamp - Date.now()) / 1000);
  const absSeconds = Math.abs(secondsDiff);
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (absSeconds < 60) {
    return formatter.format(secondsDiff, "second");
  }

  if (absSeconds < 3600) {
    return formatter.format(Math.round(secondsDiff / 60), "minute");
  }

  if (absSeconds < 86400) {
    return formatter.format(Math.round(secondsDiff / 3600), "hour");
  }

  return formatter.format(Math.round(secondsDiff / 86400), "day");
}

function urgencyToPillTone(urgency: RescueReport["urgency"]) {
  if (urgency === "critical") {
    return "high";
  }

  if (urgency === "urgent") {
    return "medium";
  }

  return "low";
}

function urgencyToLabel(urgency: RescueReport["urgency"]) {
  if (urgency === "critical") {
    return "HIGH";
  }

  if (urgency === "urgent") {
    return "MEDIUM";
  }

  return "LOW";
}

function getStatusLabel(urgency: RescueReport["urgency"]) {
  if (urgency === "critical") {
    return "Dispatched";
  }

  if (urgency === "urgent") {
    return "Queued";
  }

  return "Scheduled";
}

export default function AdminPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [reports, setReports] = useState<RescueReport[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [reportsError, setReportsError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadReports() {
      try {
        setIsLoadingReports(true);
        setReportsError("");

        const response = await fetch("/api/rescue/requests", { cache: "no-store" });
        const payload = await readJsonSafely(response);

        if (!response.ok || !payload || !payload.ok) {
          throw new Error(payload?.message ?? "Failed to load rescue reports.");
        }

        if (isMounted) {
          setReports(Array.isArray(payload.reports) ? payload.reports : []);
        }
      } catch (error) {
        if (isMounted) {
          setReportsError(error instanceof Error ? error.message : "Failed to load rescue reports.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingReports(false);
        }
      }
    }

    loadReports();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredReports = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return reports;
    }

    return reports.filter((report) => {
      const healthText = report.healthConditions.join(" ").toLowerCase();

      return (
        report.reportId.toLowerCase().includes(query) ||
        report.fullName.toLowerCase().includes(query) ||
        report.species.toLowerCase().includes(query) ||
        report.notes.toLowerCase().includes(query) ||
        healthText.includes(query)
      );
    });
  }, [reports, searchQuery]);

  const requestRows = filteredReports.slice(0, 6);
  const medicalLogs = filteredReports.filter((report) => report.healthConditions.length > 0 || report.notes.trim()).slice(0, 5);

  const metrics = useMemo(() => {
    const criticalOrUrgent = reports.filter((report) => report.urgency !== "standard").length;
    const standardCases = reports.filter((report) => report.urgency === "standard").length;
    const flaggedMedical = reports.filter((report) => report.healthConditions.length > 0).length;

    return [
      { label: "Total Reports", value: String(reports.length), note: "logged", accent: "up" },
      { label: "Standard Cases", value: String(standardCases), note: "stable", accent: "good" },
      { label: "Pending Rescue", value: String(criticalOrUrgent), note: "priority", accent: "warn" },
      { label: "Medical Flags", value: String(flaggedMedical), note: "active", accent: "alert" },
      { label: "Monthly Donations", value: "$18,400", note: "this month", accent: "money" },
    ];
  }, [reports]);

  return (
    <div className="admin-page admin-mobile-shell">
      <AdminSidebar activeHref="/admin" isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="admin-main">
        <AdminTopbar activeHref="/admin" isSidebarOpen={isSidebarOpen} onOpenMenu={() => setIsSidebarOpen(true)} />

        <section className="admin-title">
          <h1>Overview Dashboard</h1>
          <p>Monday, May 20, 2024 • System Operational</p>
        </section>

        <section className="metric-grid">
          {metrics.map((metric, index) => (
            <article
              key={metric.label}
              className={`metric-card admin-fade-card ${metric.accent}`}
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <p>{metric.label}</p>
              <h3>{metric.value}</h3>
              <span>{metric.note}</span>
            </article>
          ))}
        </section>

        <section className="admin-grid">
          <article className="table-panel admin-fade-card" style={{ animationDelay: "120ms" }}>
            <div className="panel-head">
              <h2>Recent Rescue Requests</h2>
              <Link href="/admin/rescue">View All</Link>
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
                {isLoadingReports ? (
                  <tr>
                    <td colSpan={5}>Loading reports...</td>
                  </tr>
                ) : null}

                {!isLoadingReports && reportsError ? (
                  <tr>
                    <td colSpan={5}>{reportsError}</td>
                  </tr>
                ) : null}

                {!isLoadingReports && !reportsError && requestRows.length === 0 ? (
                  <tr>
                    <td colSpan={5}>No rescue reports yet. Submit one from the rescue page to see it here.</td>
                  </tr>
                ) : null}

                {!isLoadingReports && !reportsError
                  ? requestRows.map((row, index) => (
                  <tr key={row.reportId} className="admin-report-row" style={{ animationDelay: `${140 + index * 70}ms` }}>
                    <td>{row.reportId}</td>
                    <td>{row.fullName}</td>
                    <td>
                      <span className={`urgency-pill ${urgencyToPillTone(row.urgency)}`}>
                        {urgencyToLabel(row.urgency)}
                      </span>
                    </td>
                    <td>{getStatusLabel(row.urgency)}</td>
                    <td>{formatRelativeTime(row.createdAt)}</td>
                  </tr>
                  ))
                  : null}
              </tbody>
            </table>
          </article>

          <article className="occupancy-panel admin-fade-card" style={{ animationDelay: "180ms" }}>
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

          <article className="vaccination-panel admin-fade-card" style={{ animationDelay: "240ms" }}>
            <h2>Medical Logs</h2>
            <div className="vaccination-list">
              {isLoadingReports ? <div className="vaccination-item">Loading medical logs...</div> : null}

              {!isLoadingReports && reportsError ? <div className="vaccination-item">{reportsError}</div> : null}

              {!isLoadingReports && !reportsError && medicalLogs.length === 0 ? (
                <div className="vaccination-item">No medical logs yet.</div>
              ) : null}

              {!isLoadingReports && !reportsError
                ? medicalLogs.map((report, index) => (
                <div
                  key={`${report.reportId}-medical`}
                  className="vaccination-item admin-medical-item"
                  style={{ animationDelay: `${280 + index * 80}ms` }}
                >
                  <span className="pet-thumb">🩺</span>
                  <div>
                    <p>{report.reportId}</p>
                    <small>
                      {report.healthConditions.length > 0
                        ? report.healthConditions.join(" • ")
                        : report.notes.slice(0, 48) || "General assessment logged"}
                    </small>
                  </div>
                  <span className="due-tag">{formatRelativeTime(report.createdAt)}</span>
                </div>
                ))
                : null}
            </div>
          </article>

          <article className="story-banner admin-fade-card" style={{ animationDelay: "300ms" }}>
            <p>Success Story</p>
            <h3>&quot;Ollie found a forever home in Bristol today.&quot;</h3>
            <small>
              Through our streamlined adoption pipeline, Ollie transitioned from
              rescue to family in just 14 days.
            </small>
            <Link href="/impact">Read the Impact Report →</Link>
          </article>
        </section>

      </main>
    </div>
  );
}
