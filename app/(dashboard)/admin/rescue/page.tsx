"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AdminThemeToggle from "@/components/AdminThemeToggle";
import AdminTopNav from "@/components/AdminTopNav";
import AdminTopbarBrand from "@/components/AdminTopbarBrand";
import RescueDispatchMap, { type RescueDispatchMapReport } from "@/components/RescueDispatchMap";
import ScrollReveal from "@/components/ScrollReveal";

type RescueReport = RescueDispatchMapReport & {
  email: string;
  phone: string;
  breed: string;
  animalImageDataUrl?: string;
  caseStatus?: RescueCaseStatus;
  adminChecklist?: RescueAdminChecklist;
};

type RescueReportsResponse = {
  ok?: boolean;
  message?: string;
  reports?: RescueReport[];
};

async function readJsonSafely<T>(response: Response): Promise<T | null> {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.toLowerCase().includes("application/json")) {
    return null;
  }

  return (await response.json().catch(() => null)) as T | null;
}

type RescueCaseStatus = "reported" | "in_progress" | "monitored" | "rescued" | "closed";

type RescueAdminChecklist = {
  rescued: boolean;
  monitored: boolean;
  medicalCompleted: boolean;
  shelterAssigned: boolean;
  reporterNotified: boolean;
};

type RescueAdminDraft = {
  caseStatus: RescueCaseStatus;
  adminChecklist: RescueAdminChecklist;
};

type RescueAdminUpdateResponse = {
  ok?: boolean;
  message?: string;
  report?: RescueReport;
  mail?: {
    sent?: boolean;
    reason?: string;
  };
};

type StatusFilter = "all" | RescueReport["urgency"];

type DashboardStat = {
  label: string;
  value: string;
  helper: string;
  tone: "calm" | "good" | "warn" | "alert";
};

const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "critical", label: "Critical" },
  { value: "urgent", label: "Urgent" },
  { value: "standard", label: "Standard" },
];

const CASE_STATUS_OPTIONS: Array<{ value: RescueCaseStatus; label: string }> = [
  { value: "reported", label: "Reported" },
  { value: "in_progress", label: "In Progress" },
  { value: "monitored", label: "Monitored" },
  { value: "rescued", label: "Rescued" },
  { value: "closed", label: "Closed" },
];

function getInitialChecklist(): RescueAdminChecklist {
  return {
    rescued: false,
    monitored: false,
    medicalCompleted: false,
    shelterAssigned: false,
    reporterNotified: false,
  };
}

function getReportDraft(report: RescueReport): RescueAdminDraft {
  return {
    caseStatus: report.caseStatus ?? "reported",
    adminChecklist: {
      rescued: report.adminChecklist?.rescued ?? false,
      monitored: report.adminChecklist?.monitored ?? false,
      medicalCompleted: report.adminChecklist?.medicalCompleted ?? false,
      shelterAssigned: report.adminChecklist?.shelterAssigned ?? false,
      reporterNotified: report.adminChecklist?.reporterNotified ?? false,
    },
  };
}

function getDefaultDraft(): RescueAdminDraft {
  return {
    caseStatus: "reported",
    adminChecklist: getInitialChecklist(),
  };
}

function caseStatusLabel(status: RescueCaseStatus | undefined) {
  switch (status) {
    case "in_progress":
      return "In progress";
    case "monitored":
      return "Monitored";
    case "rescued":
      return "Rescued";
    case "closed":
      return "Closed";
    default:
      return "Reported";
  }
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

function formatDateLabel(isoDate: string) {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return "Unknown time";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function urgencyTone(urgency: RescueReport["urgency"]) {
  if (urgency === "critical") {
    return "high";
  }

  if (urgency === "urgent") {
    return "med";
  }

  return "low";
}

function urgencyLabel(urgency: RescueReport["urgency"]) {
  if (urgency === "critical") {
    return "HIGH";
  }

  if (urgency === "urgent") {
    return "MED";
  }

  return "LOW";
}

function statusLabel(urgency: RescueReport["urgency"]) {
  if (urgency === "critical") {
    return "Needs dispatch";
  }

  if (urgency === "urgent") {
    return "Queued";
  }

  return "Monitoring";
}

function buildMedicalSummary(report: RescueReport) {
  if (report.healthConditions.length > 0) {
    return report.healthConditions.join(" • ");
  }

  return report.notes.trim() || "No medical notes yet";
}

function locationHref(report: RescueReport) {
  return `https://www.google.com/maps?q=${report.location.latitude},${report.location.longitude}`;
}

function toSortableTimestamp(value: string) {
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function getIsoDate(value: string) {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString().slice(0, 10) : "";
}

function compareByNewest(first: RescueReport, second: RescueReport) {
  return toSortableTimestamp(second.createdAt) - toSortableTimestamp(first.createdAt);
}

function buildNote(report: RescueReport) {
  const healthSummary = report.healthConditions.length > 0 ? report.healthConditions.join(" • ") : "no medical flags";
  return `${report.fullName} reported ${report.species.toLowerCase()} case with ${healthSummary}`;
}

export default function RescueManagementPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dateFilter, setDateFilter] = useState("");
  const [reports, setReports] = useState<RescueReport[]>([]);
  const [selectedReportId, setSelectedReportId] = useState("");
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [reportsError, setReportsError] = useState("");
  const [lastSyncedAt, setLastSyncedAt] = useState("");
  const [adminDrafts, setAdminDrafts] = useState<Record<string, RescueAdminDraft>>({});
  const [savingByReportId, setSavingByReportId] = useState<Record<string, boolean>>({});
  const [saveMessageByReportId, setSaveMessageByReportId] = useState<Record<string, string>>({});

  useEffect(() => {
    let isMounted = true;

    async function loadReports() {
      try {
        setIsLoadingReports(true);
        setReportsError("");

        const response = await fetch("/api/rescue/requests", { cache: "no-store" });
        const payload = await readJsonSafely<RescueReportsResponse>(response);

        if (!response.ok || !payload?.ok) {
          throw new Error(payload?.message ?? "Failed to load rescue reports.");
        }

        if (isMounted) {
          setReports(Array.isArray(payload.reports) ? payload.reports.slice().sort(compareByNewest) : []);
          setLastSyncedAt(new Date().toISOString());
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
    const timer = window.setInterval(loadReports, 30000);

    return () => {
      isMounted = false;
      window.clearInterval(timer);
    };
  }, []);

  const filteredReports = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return reports.filter((report) => {
      const matchesQuery =
        !query ||
        report.reportId.toLowerCase().includes(query) ||
        report.fullName.toLowerCase().includes(query) ||
        report.species.toLowerCase().includes(query) ||
        report.breed.toLowerCase().includes(query) ||
        report.notes.toLowerCase().includes(query) ||
        report.lastSeenAddress.toLowerCase().includes(query) ||
        report.healthConditions.join(" ").toLowerCase().includes(query);

      const matchesStatus = statusFilter === "all" || report.urgency === statusFilter;
      const matchesDate = !dateFilter || getIsoDate(report.createdAt) === dateFilter;

      return matchesQuery && matchesStatus && matchesDate;
    });
  }, [dateFilter, reports, searchQuery, statusFilter]);

  useEffect(() => {
    if (filteredReports.length === 0) {
      setSelectedReportId("");
      return;
    }

    const selectedExists = filteredReports.some((report) => report.reportId === selectedReportId);
    if (!selectedExists) {
      setSelectedReportId(filteredReports[0].reportId);
    }
  }, [filteredReports, selectedReportId]);

  const selectedReport = filteredReports.find((report) => report.reportId === selectedReportId) ?? filteredReports[0];

  function resolveDraft(report: RescueReport) {
    return adminDrafts[report.reportId] ?? getReportDraft(report);
  }

  function updateDraftStatus(reportId: string, value: RescueCaseStatus) {
    setAdminDrafts((current) => {
      const linkedReport = reports.find((report) => report.reportId === reportId);
      const existing = current[reportId] ?? (linkedReport ? getReportDraft(linkedReport) : getDefaultDraft());

      return {
        ...current,
        [reportId]: {
          ...existing,
          caseStatus: value,
        },
      };
    });
  }

  function updateDraftChecklist(reportId: string, key: keyof RescueAdminChecklist, checked: boolean) {
    setAdminDrafts((current) => {
      const linkedReport = reports.find((report) => report.reportId === reportId);
      const source = current[reportId] ?? (linkedReport ? getReportDraft(linkedReport) : getDefaultDraft());

      return {
        ...current,
        [reportId]: {
          ...source,
          adminChecklist: {
            ...source.adminChecklist,
            [key]: checked,
          },
        },
      };
    });
  }

  async function saveAdminChecklist(report: RescueReport) {
    const reportId = report.reportId;
    const draft = resolveDraft(report);

    try {
      setSavingByReportId((current) => ({ ...current, [reportId]: true }));
      setSaveMessageByReportId((current) => ({ ...current, [reportId]: "" }));

      const response = await fetch("/api/rescue/requests", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportId,
          caseStatus: draft.caseStatus,
          adminChecklist: draft.adminChecklist,
        }),
      });

      const payload = await readJsonSafely<RescueAdminUpdateResponse>(response);

      if (!response.ok || !payload || !payload.ok || !payload.report) {
        throw new Error(payload?.message ?? "Failed to save checklist.");
      }

      setReports((current) =>
        current.map((item) => (item.reportId === reportId ? payload.report ?? item : item)),
      );

      const mailNote = payload.mail?.sent ? " Reporter email sent." : payload.mail?.reason ? ` ${payload.mail.reason}` : "";
      setSaveMessageByReportId((current) => ({
        ...current,
        [reportId]: `${payload.message ?? "Checklist saved."}${mailNote}`,
      }));
    } catch (error) {
      setSaveMessageByReportId((current) => ({
        ...current,
        [reportId]: error instanceof Error ? error.message : "Failed to save checklist.",
      }));
    } finally {
      setSavingByReportId((current) => ({ ...current, [reportId]: false }));
    }
  }

  const dashboardStats = useMemo<DashboardStat[]>(() => {
    const criticalCases = reports.filter((report) => report.urgency === "critical").length;
    const urgentCases = reports.filter((report) => report.urgency === "urgent").length;
    const mappedCases = reports.filter((report) => Number.isFinite(report.location.latitude) && Number.isFinite(report.location.longitude)).length;
    const latestReport = reports[0];

    return [
      {
        label: "Live reports",
        value: String(reports.length),
        helper: reports.length > 0 ? "Pulled from rescue API" : "Waiting for the first case",
        tone: "calm",
      },
      {
        label: "Critical cases",
        value: String(criticalCases),
        helper: `${urgentCases} urgent cases also queued`,
        tone: "alert",
      },
      {
        label: "Mapped pins",
        value: String(mappedCases),
        helper: "Cases with live coordinates",
        tone: "good",
      },
      {
        label: "Latest update",
        value: latestReport ? formatRelativeTime(latestReport.createdAt) : "--",
        helper: latestReport ? `Synced ${lastSyncedAt ? formatRelativeTime(lastSyncedAt) : "moments ago"}` : "No updates yet",
        tone: "warn",
      },
    ];
  }, [lastSyncedAt, reports]);

  const operationsLog = useMemo(() => {
    return reports.slice(0, 3).map((report) => ({
      note: buildNote(report),
      time: formatRelativeTime(report.createdAt),
      tone: urgencyTone(report.urgency),
    }));
  }, [reports]);

  return (
    <div className="admin-page admin-mobile-shell rescue-management-page rescue-live-page">
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
            <li className="active">
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
            <li>
              <Link href="/admin/users">User Management</Link>
            </li>
            <li>
              <Link href="/admin/inquiry-management">Inquiries</Link>
            </li>
          </ul>
        </nav>

        <button className="alert-btn" type="button" onClick={() => setStatusFilter("critical")}>
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

      <div
        className={`admin-sidebar-backdrop ${isSidebarOpen ? "show" : ""}`.trim()}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden={!isSidebarOpen}
      />

      <main className="admin-main rescue-management-main">
        <header className="admin-topbar rescue-topbar">
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
            <AdminTopbarBrand />
            <input
              aria-label="Search rescue reports"
              placeholder="Search rescue reports..."
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
          <AdminTopNav activeHref="/admin/rescue" />
          <div className="admin-top-icons">
            <AdminThemeToggle />
            
            <strong className="rm-head-title">Admin Dashboard</strong>
          </div>
        </header>

        <ScrollReveal as="section" className="rm-title-row rescue-hero">
          <div>
            <p className="rm-eyebrow">Live rescue control</p>
            <h1>Rescue Management</h1>
            <p>Real reports, live map pins, and a case pipeline that updates from the rescue API.</p>
          </div>
          <div className="rm-filter-row">
            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <input aria-label="Filter by date" type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} />
          </div>
        </ScrollReveal>

        <ScrollReveal as="section" className="rm-summary-grid">
          {dashboardStats.map((stat, index) => (
            <article key={stat.label} className={`rm-stat-card reveal-item ${stat.tone}`} style={{ animationDelay: `${index * 90}ms` }}>
              <p>{stat.label}</p>
              <strong>{stat.value}</strong>
              <span>{stat.helper}</span>
            </article>
          ))}
        </ScrollReveal>

        <section className="rm-layout">
          <ScrollReveal as="article" className="rm-pipeline-panel" delayMs={80}>
            <div className="rm-panel-head">
              <h2>Active Rescue Pipeline</h2>
              <small>{filteredReports.length} active case{filteredReports.length === 1 ? "" : "s"}</small>
            </div>

            {isLoadingReports ? <p className="rm-empty-state">Loading live rescue reports...</p> : null}

            {!isLoadingReports && reportsError ? <p className="rm-empty-state error">{reportsError}</p> : null}

            {!isLoadingReports && !reportsError && filteredReports.length === 0 ? (
              <div className="rm-empty-state">
                <strong>No matching rescue reports.</strong>
                <span>Try a different search, date, or status filter.</span>
              </div>
            ) : null}

            {!isLoadingReports && !reportsError && filteredReports.length > 0 ? (
              <div className="rm-case-list">
                {filteredReports.map((report, index) => (
                  <article
                    key={report.reportId}
                    className={`rm-case-item ${selectedReportId === report.reportId ? "selected" : ""}`}
                    style={{ animationDelay: `${120 + index * 80}ms` }}
                  >
                    {report.animalImageDataUrl ? (
                      <Image
                        alt={`${report.species} reported by ${report.fullName}`}
                        className="rm-case-image"
                        height={84}
                        src={report.animalImageDataUrl}
                        unoptimized
                        width={84}
                      />
                    ) : (
                      <div className="rm-case-image rm-case-image-fallback" aria-hidden="true">
                        <span>🐾</span>
                        <small>No photo</small>
                      </div>
                    )}
                    <div className="rm-case-copy">
                      <div className="rm-case-head">
                        <span className={`rm-priority ${urgencyTone(report.urgency)}`}>{urgencyLabel(report.urgency)}</span>
                        <small>{report.reportId}</small>
                        <h3>
                          {report.species} case for {report.fullName}
                        </h3>
                      </div>
                      <p>{report.lastSeenAddress}</p>
                      <div className="rm-meta-row">
                        <span>{statusLabel(report.urgency)} • {caseStatusLabel(report.caseStatus)}</span>
                        <span className="rm-status-pill">{formatRelativeTime(report.createdAt)}</span>
                      </div>
                    </div>
                    <p className="rm-case-summary">{buildMedicalSummary(report)}</p>
                    <div className="rm-actions-col">
                      <button type="button" className="rm-primary-btn" onClick={() => setSelectedReportId(report.reportId)}>
                        Focus on map
                      </button>
                      <a className="rm-secondary-btn rm-link-btn" href={locationHref(report)} target="_blank" rel="noreferrer">
                        Open in Maps
                      </a>
                    </div>
                    <div className="rm-admin-checklist">
                      <label>
                        Case status
                        <select
                          value={resolveDraft(report).caseStatus}
                          onChange={(event) => updateDraftStatus(report.reportId, event.target.value as RescueCaseStatus)}
                        >
                          {CASE_STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <div className="rm-checklist-grid">
                        <label>
                          <input
                            type="checkbox"
                            checked={resolveDraft(report).adminChecklist.rescued}
                            onChange={(event) => updateDraftChecklist(report.reportId, "rescued", event.target.checked)}
                          />
                          Animal rescued
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            checked={resolveDraft(report).adminChecklist.monitored}
                            onChange={(event) => updateDraftChecklist(report.reportId, "monitored", event.target.checked)}
                          />
                          Animal monitored
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            checked={resolveDraft(report).adminChecklist.medicalCompleted}
                            onChange={(event) => updateDraftChecklist(report.reportId, "medicalCompleted", event.target.checked)}
                          />
                          Medical check done
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            checked={resolveDraft(report).adminChecklist.shelterAssigned}
                            onChange={(event) => updateDraftChecklist(report.reportId, "shelterAssigned", event.target.checked)}
                          />
                          Shelter assigned
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            checked={resolveDraft(report).adminChecklist.reporterNotified}
                            onChange={(event) => updateDraftChecklist(report.reportId, "reporterNotified", event.target.checked)}
                          />
                          Reporter notified
                        </label>
                      </div>
                      <button
                        type="button"
                        className="rm-save-checklist-btn"
                        disabled={Boolean(savingByReportId[report.reportId])}
                        onClick={() => void saveAdminChecklist(report)}
                      >
                        {savingByReportId[report.reportId] ? "Saving..." : "Save Checklist"}
                      </button>
                      {saveMessageByReportId[report.reportId] ? <small>{saveMessageByReportId[report.reportId]}</small> : null}
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </ScrollReveal>

          <aside className="rm-side-col">
            <ScrollReveal as="article" className="rm-map-panel" delayMs={140}>
              <div className="rm-panel-head compact">
                <h2>Dispatch Map</h2>
                <small>{selectedReport ? selectedReport.fullName : "Live pins"}</small>
              </div>
              <RescueDispatchMap reports={filteredReports} selectedReportId={selectedReportId} onReportSelect={setSelectedReportId} />
              <p>{filteredReports.length} mapped case{filteredReports.length === 1 ? "" : "s"} are visible on the live feed.</p>
            </ScrollReveal>

            <ScrollReveal as="article" className="rm-detail-panel" delayMs={200}>
              <div className="rm-panel-head compact">
                <h2>Selected Case</h2>
                <small>{selectedReport ? selectedReport.reportId : "No case selected"}</small>
              </div>

              {selectedReport ? (
                <div className="rm-detail-body">
                  {selectedReport.animalImageDataUrl ? (
                    <Image
                      alt={`${selectedReport.species} rescue case image`}
                      className="rm-detail-image"
                      height={220}
                      src={selectedReport.animalImageDataUrl}
                      unoptimized
                      width={380}
                    />
                  ) : null}
                  <strong>{selectedReport.fullName}</strong>
                  <p>
                    {selectedReport.species}
                    {selectedReport.breed ? ` • ${selectedReport.breed}` : ""}
                  </p>
                  <p>{selectedReport.lastSeenAddress}</p>
                  <div className="rm-detail-grid">
                    <span>
                      Urgency
                      <strong>{selectedReport.urgency.toUpperCase()}</strong>
                    </span>
                    <span>
                      Logged
                      <strong>{formatDateLabel(selectedReport.createdAt)}</strong>
                    </span>
                    <span>
                      Reporter
                      <strong>{selectedReport.email}</strong>
                    </span>
                    <span>
                      Contact
                      <strong>{selectedReport.phone}</strong>
                    </span>
                  </div>
                  <p className="rm-detail-notes">{selectedReport.notes || "No notes were added to this report."}</p>
                  <div className="rm-actions-col detail-actions">
                    <button type="button" className="rm-primary-btn" onClick={() => setSelectedReportId(selectedReport.reportId)}>
                      Keep on map
                    </button>
                    <a className="rm-secondary-btn rm-link-btn" href={locationHref(selectedReport)} target="_blank" rel="noreferrer">
                      Navigate to scene
                    </a>
                  </div>
                </div>
              ) : (
                <div className="rm-empty-state">
                  <strong>No selected case yet.</strong>
                  <span>Choose a report to view the live details and map pin.</span>
                </div>
              )}
            </ScrollReveal>

            <ScrollReveal as="article" className="rm-log-panel" delayMs={260}>
              <h2>Operations Log</h2>
              <ul>
                {operationsLog.length > 0 ? (
                  operationsLog.map((entry) => (
                    <li key={entry.note} className={`tone-${entry.tone}`}>
                      <strong>{entry.note}</strong>
                      <small>{entry.time}</small>
                    </li>
                  ))
                ) : (
                  <li className="tone-info">
                    <strong>No rescue log entries yet.</strong>
                    <small>When reports arrive, they appear here automatically.</small>
                  </li>
                )}
              </ul>
            </ScrollReveal>
          </aside>
        </section>
      </main>
    </div>
  );
}
