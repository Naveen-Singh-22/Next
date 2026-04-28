"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import AdminThemeToggle from "@/components/AdminThemeToggle";
import AdminTopNav from "@/components/AdminTopNav";
import AdminTopbarBrand from "@/components/AdminTopbarBrand";
import type { AdoptionApplication, AdoptionStatus } from "@/lib/adoptionApplicationTypes";

type PipelineCard = {
  id: number;
  applicationId: string;
  applicant: string;
  pet: string;
  date: string;
  tone: "warm" | "neutral" | "mint" | "blue";
  image: string;
  tag?: string;
  location?: string;
  status: AdoptionStatus;
};

type PipelineLane = {
  id: AdoptionStatus;
  title: string;
  cards: PipelineCard[];
};

type AdoptionsResponse = {
  applications?: AdoptionApplication[];
  message?: string;
};

function formatRelativeTime(isoDate: string) {
  const timestamp = new Date(isoDate).getTime();

  if (!Number.isFinite(timestamp)) {
    return "Recently";
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

function formatTime(isoDate: string) {
  const date = new Date(isoDate);
  if (!Number.isFinite(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

const lanes: PipelineLane[] = [
  {
    id: "applied",
    title: "Applied",
    cards: [],
  },
  {
    id: "shortlisted",
    title: "Shortlisted",
    cards: [],
  },
  {
    id: "home_visit",
    title: "Home Visit",
    cards: [],
  },
  {
    id: "approved",
    title: "Approved",
    cards: [],
  },
  {
    id: "adopted",
    title: "Adopted",
    cards: [],
  },
  {
    id: "rejected",
    title: "Rejected",
    cards: [],
  },
];

const statusOptions: { value: "all" | AdoptionStatus; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "applied", label: "Applied" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "home_visit", label: "Home Visit" },
  { value: "approved", label: "Approved" },
  { value: "adopted", label: "Adopted" },
  { value: "rejected", label: "Rejected" },
];

const cardAvatar = "/images/unsplash/photo-1543466835-00a7907e9de1.jpg";

export default function AdoptionPipelinePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [applications, setApplications] = useState<AdoptionApplication[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [requestsError, setRequestsError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AdoptionStatus>("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [notesDraft, setNotesDraft] = useState("");
  const [notesForId, setNotesForId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [savingNotes, setSavingNotes] = useState(false);
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [pendingStatusById, setPendingStatusById] = useState<Record<number, AdoptionStatus>>({});

  useEffect(() => {
    let isMounted = true;

    async function loadRequests() {
      try {
        setIsLoadingRequests(true);
        setRequestsError("");

        const response = await fetch("/api/adoptions", { cache: "no-store" });
        const payload = (await response.json()) as AdoptionsResponse;

        if (!response.ok) {
          throw new Error(payload.message ?? "Failed to load adoption requests.");
        }

        if (isMounted) {
          setApplications(Array.isArray(payload.applications) ? payload.applications : []);
        }
      } catch (error) {
        if (isMounted) {
          setRequestsError(error instanceof Error ? error.message : "Failed to load adoption requests.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingRequests(false);
        }
      }
    }

    void loadRequests();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredApplications = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return applications.filter((application) => {
      const matchesSearch =
        query.length === 0 ||
        application.applicantName.toLowerCase().includes(query) ||
        application.animalName.toLowerCase().includes(query) ||
        application.applicationId.toLowerCase().includes(query) ||
        (application.animalCode ?? "").toLowerCase().includes(query) ||
        String(application.animalId).includes(query);
      const matchesStatus = statusFilter === "all" || application.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [applications, searchTerm, statusFilter]);

  const boardLanes = useMemo<PipelineLane[]>(() => {
    const grouped = new Map<PipelineLane["id"], PipelineCard[]>([
      ["applied", []],
      ["shortlisted", []],
      ["home_visit", []],
      ["approved", []],
      ["adopted", []],
      ["rejected", []],
    ]);

    filteredApplications.forEach((application) => {
      const collection = grouped.get(application.status as PipelineLane["id"]);

      if (!collection) {
        return;
      }

      collection.push({
        id: application.id,
        applicationId: application.applicationId,
        applicant: application.applicantName,
        pet: application.animalName,
        date: formatRelativeTime(application.createdAt),
        tone:
          application.status === "applied"
            ? "warm"
            : application.status === "adopted"
              ? "mint"
              : application.status === "rejected"
                ? "neutral"
              : application.status === "approved"
                ? "blue"
                : "neutral",
        image: cardAvatar,
        tag: application.applicationId,
        location: `${application.city} | ${application.housing}`,
        status: application.status,
      });
    });

    return lanes.map((lane) => ({
      ...lane,
      cards: grouped.get(lane.id) ?? [],
    }));
  }, [filteredApplications]);

  const monthlyRequestsCount = useMemo(() => {
    const now = new Date();

    return applications.filter((request) => {
      const createdAt = new Date(request.createdAt);

      return (
        Number.isFinite(createdAt.getTime()) &&
        createdAt.getMonth() === now.getMonth() &&
        createdAt.getFullYear() === now.getFullYear()
      );
    }).length;
  }, [applications]);

  const selectedApplication = useMemo(() => {
    if (selectedId === null) {
      return null;
    }

    return applications.find((application) => application.id === selectedId) ?? null;
  }, [applications, selectedId]);

  function ensureNotesDraft(application: AdoptionApplication) {
    if (notesForId === application.id) {
      return;
    }

    setNotesForId(application.id);
    setNotesDraft(application.adminNotes ?? "");
  }

  async function moveStatus(applicationId: number, status: AdoptionStatus) {
    const previous = applications;

    setUpdatingId(applicationId);
    setApplications((current) =>
      current.map((application) =>
        application.id === applicationId
          ? {
              ...application,
              status,
            }
          : application,
      ),
    );

    try {
      const response = await fetch(`/api/adoptions/${applicationId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const payload = (await response.json()) as {
        application?: AdoptionApplication;
        message?: string;
      };

      if (!response.ok || !payload.application) {
        throw new Error(payload.message ?? "Failed to update application status.");
      }

      setApplications((current) =>
        current.map((application) =>
          application.id === applicationId ? payload.application ?? application : application,
        ),
      );
    } catch (error) {
      setApplications(previous);
      setRequestsError(error instanceof Error ? error.message : "Failed to update application status.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function saveNotes() {
    if (!selectedApplication) {
      return;
    }

    setSavingNotes(true);

    try {
      const response = await fetch(`/api/adoptions/${selectedApplication.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adminNotes: notesDraft }),
      });

      const payload = (await response.json()) as {
        application?: AdoptionApplication;
        message?: string;
      };

      if (!response.ok || !payload.application) {
        throw new Error(payload.message ?? "Failed to save admin notes.");
      }

      setApplications((current) =>
        current.map((application) =>
          application.id === selectedApplication.id ? payload.application ?? application : application,
        ),
      );
    } catch (error) {
      setRequestsError(error instanceof Error ? error.message : "Failed to save admin notes.");
    } finally {
      setSavingNotes(false);
    }
  }

  function renderStatusActions(applicationId: number, status: AdoptionStatus) {
    const isBusy = updatingId === applicationId;
    const pendingStatus = pendingStatusById[applicationId] ?? status;

    return (
      <div className="adoption-status-actions-wrap" role="group" aria-label="Status actions">
        <div className="adoption-status-actions adoption-status-actions-desktop">
          <button
            type="button"
            disabled={isBusy || status === "applied"}
            onClick={(event) => {
              event.stopPropagation();
              void moveStatus(applicationId, "applied");
            }}
          >
            Applied
          </button>
          <button
            type="button"
            disabled={isBusy || status === "shortlisted"}
            onClick={(event) => {
              event.stopPropagation();
              void moveStatus(applicationId, "shortlisted");
            }}
          >
            Shortlist
          </button>
          <button
            type="button"
            disabled={isBusy || status === "home_visit"}
            onClick={(event) => {
              event.stopPropagation();
              void moveStatus(applicationId, "home_visit");
            }}
          >
            Visit
          </button>
          <button
            type="button"
            disabled={isBusy || status === "approved"}
            onClick={(event) => {
              event.stopPropagation();
              void moveStatus(applicationId, "approved");
            }}
          >
            Approve
          </button>
          <button
            type="button"
            disabled={isBusy || status === "rejected"}
            onClick={(event) => {
              event.stopPropagation();
              void moveStatus(applicationId, "rejected");
            }}
          >
            Reject
          </button>
        </div>

        <div className="adoption-status-actions-mobile">
          <select
            aria-label="Choose next status"
            value={pendingStatus}
            onClick={(event) => event.stopPropagation()}
            onChange={(event) => {
              setPendingStatusById((current) => ({
                ...current,
                [applicationId]: event.target.value as AdoptionStatus,
              }));
            }}
          >
            <option value="applied">Applied</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="home_visit">Home Visit</option>
            <option value="approved">Approved</option>
            <option value="adopted">Adopted</option>
            <option value="rejected">Rejected</option>
          </select>
          <button
            type="button"
            disabled={isBusy || pendingStatus === status}
            onClick={(event) => {
              event.stopPropagation();
              void moveStatus(applicationId, pendingStatus);
            }}
          >
            {isBusy ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page admin-mobile-shell adoption-page">
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
              <Link href="/admin/inventory">Animal Inventory</Link>
            </li>
            <li>
              <Link href="/admin/vaccinations">Vaccinations</Link>
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
          <span>ADM</span>
          <div>
            <p>Admin Portal</p>
            <small>Adoption Team</small>
          </div>
        </div>
      </aside>

      <div
        className={`admin-sidebar-backdrop ${isSidebarOpen ? "show" : ""}`.trim()}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden={!isSidebarOpen}
      />

      <main className="admin-main adoption-main">
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
            <AdminTopbarBrand />
            <input
              aria-label="Search"
              placeholder="Search applicant, animal name, or application ID..."
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <AdminTopNav activeHref="/admin/adoption" />
          <div className="admin-top-icons">
            <AdminThemeToggle />
            <span>Bell</span>
            <span>Settings</span>
            <span className="avatar">AR</span>
          </div>
        </header>

        <section className="adoption-head">
          <div>
            <h1>Adoption Pipeline</h1>
            <p>
              Monitor every stage of rescue-to-home applications and keep approvals
              moving.
            </p>
          </div>
          <div className="adoption-kpis">
            <article>
              <p>Active Apps</p>
              <strong>{applications.length}</strong>
            </article>
            <article>
              <p>This Month</p>
              <strong>{monthlyRequestsCount}</strong>
            </article>
          </div>
        </section>

        <section className="adoption-toolbar" aria-label="Pipeline filters">
          <select
            className="filter-pill"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as "all" | AdoptionStatus)}
            aria-label="Filter by status"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button className="filter-pill" type="button" onClick={() => setSearchTerm("")}>
            Clear Search
          </button>
          <p>Live API-backed applications</p>
          <Link href="/admin/adoption/review" className="adoption-review-link">
            Open Review Page
          </Link>
          <div className="view-switch" role="group" aria-label="Board view options">
            <button className={viewMode === "board" ? "active" : ""} type="button" onClick={() => setViewMode("board")}>
              Board View
            </button>
            <button className={viewMode === "list" ? "active" : ""} type="button" onClick={() => setViewMode("list")}>
              List View
            </button>
          </div>
        </section>

        {requestsError ? <p className="pipeline-empty-note">{requestsError}</p> : null}

        {viewMode === "board" ? (
          <div className="adoption-board-scroll">
            <section
              className="pipeline-board adoption-pipeline-board"
              aria-label="Adoption pipeline board"
            >
              {boardLanes.map((lane, laneIndex) => (
                <article
                  key={lane.id}
                  className="pipeline-column motion-rise"
                  style={{ ["--stagger-index" as string]: laneIndex } as CSSProperties}
                >
                  <h2>
                    {lane.title} <span>({lane.cards.length})</span>
                  </h2>
                  <div className="pipeline-stack">
                    {lane.cards.map((card, cardIndex) => (
                      <div
                        key={card.id}
                        className={`pipeline-card ${card.tone} motion-fade`}
                        style={{ ["--stagger-index" as string]: cardIndex + 1 } as CSSProperties}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          const found = applications.find((entry) => entry.id === card.id);
                          if (!found) {
                            return;
                          }

                          setSelectedId(found.id);
                          ensureNotesDraft(found);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            const found = applications.find((entry) => entry.id === card.id);
                            if (!found) {
                              return;
                            }

                            setSelectedId(found.id);
                            ensureNotesDraft(found);
                          }
                        }}
                      >
                        <div className="pipeline-person">
                          <img
                            className="pipeline-avatar"
                            src={card.image}
                            alt={`${card.applicant} profile photo`}
                            loading="lazy"
                          />
                          <div>
                            <strong>{card.applicant}</strong>
                            <small>
                              Adopting <em>{card.pet}</em>
                            </small>
                          </div>
                        </div>
                        {card.tag ? <p className="pipeline-tag">{card.tag}</p> : null}
                        <p className="pipeline-date">{card.date}</p>
                        {card.location ? <small className="pipeline-location">{card.location}</small> : null}

                        {renderStatusActions(card.id, card.status)}
                      </div>
                    ))}
                    {isLoadingRequests ? <p className="pipeline-empty-note">Loading live requests...</p> : null}
                    {!isLoadingRequests && !requestsError && lane.cards.length === 0 ? (
                      <p className="pipeline-empty-note">No live requests in this stage yet.</p>
                    ) : null}
                  </div>
                </article>
              ))}
            </section>
          </div>
        ) : (
          <section className="pipeline-board adoption-list-board" aria-label="Adoption list view">
            <article className="pipeline-column adoption-list-column">
              <h2>
                Application List <span>({filteredApplications.length})</span>
              </h2>
              {isLoadingRequests ? <p className="pipeline-empty-note">Loading live requests...</p> : null}
              {!isLoadingRequests && filteredApplications.length === 0 ? (
                <p className="pipeline-empty-note">No applications found for the current filters.</p>
              ) : null}
              {!isLoadingRequests && filteredApplications.length > 0 ? (
                <div className="adoption-list-grid">
                  {filteredApplications.map((application) => (
                    <div
                      key={application.id}
                      className="pipeline-card neutral"
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        setSelectedId(application.id);
                        ensureNotesDraft(application);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setSelectedId(application.id);
                          ensureNotesDraft(application);
                        }
                      }}
                    >
                      <p className="pipeline-tag">{application.applicationId} - {application.applicantName}</p>
                      <small className="pipeline-location">{application.animalName}{application.animalCode ? ` (${application.animalCode})` : ""}</small>
                      <small className="pipeline-location">{application.city} | {application.housing}</small>
                      <small className="pipeline-location">Status: {application.status.replace("_", " ")}</small>
                      <small className="pipeline-location">Submitted: {formatTime(application.createdAt)}</small>
                      {renderStatusActions(application.id, application.status)}
                    </div>
                  ))}
                </div>
              ) : null}
            </article>
          </section>
        )}

        <section className="pipeline-board adoption-details-board" aria-label="Application details">
          <article className="pipeline-column">
            <h2>
              Application Details
              {selectedApplication ? <span> ({selectedApplication.applicationId})</span> : null}
            </h2>
            {!selectedApplication ? (
              <p className="pipeline-empty-note">Select a card from the board to view full application details.</p>
            ) : (
              <div className="pipeline-stack">
                <div className="pipeline-card neutral">
                  <p className="pipeline-tag">{selectedApplication.applicantName}</p>
                  <small className="pipeline-location">{selectedApplication.email}</small>
                  <small className="pipeline-location">{selectedApplication.phone}</small>
                  <small className="pipeline-location">
                    {selectedApplication.city} | {selectedApplication.housing}
                  </small>
                  <small className="pipeline-location">
                    {selectedApplication.animalName}
                    {selectedApplication.animalCode ? ` (${selectedApplication.animalCode})` : ""}
                  </small>
                </div>

                <div className="pipeline-card warm">
                  <strong>Why adopt</strong>
                  <p className="pipeline-date">{selectedApplication.whyAdopt}</p>
                </div>

                <div className="pipeline-card warm">
                  <strong>Pet experience</strong>
                  <p className="pipeline-date">{selectedApplication.petExperience}</p>
                </div>

                <div className="pipeline-card neutral">
                  <strong>Admin notes</strong>
                  <textarea
                    value={notesDraft}
                    onChange={(event) => setNotesDraft(event.target.value)}
                    placeholder="Write internal notes here"
                    rows={4}
                    style={{ width: "100%", marginTop: "0.7rem" }}
                  />
                  <button
                    className="pipeline-review-link"
                    type="button"
                    onClick={() => {
                      void saveNotes();
                    }}
                    style={{ marginTop: "0.8rem", display: "inline-flex" }}
                    disabled={savingNotes}
                  >
                    {savingNotes ? "Saving..." : "Save Notes"}
                  </button>
                </div>

                <div className="pipeline-card mint">
                  <strong>Timeline</strong>
                  <div className="pipeline-stack" style={{ marginTop: "0.8rem" }}>
                    {selectedApplication.timeline.map((entry, index) => (
                      <div key={`${entry.type}-${entry.time}-${index}`} className="pipeline-card neutral">
                        <p className="pipeline-tag">{entry.type}</p>
                        <small className="pipeline-location">{formatTime(entry.time)}</small>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </article>
        </section>

        <button className="pipeline-fab" type="button" aria-label="Create adoption application">
          +
        </button>
      </main>
    </div>
  );
}
