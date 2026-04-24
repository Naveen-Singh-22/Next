"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import AdminThemeToggle from "@/components/AdminThemeToggle";

type PipelineCard = {
  id: string;
  applicant: string;
  pet: string;
  date: string;
  tone: "warm" | "neutral" | "mint" | "blue";
  image: string;
  tag?: string;
  location?: string;
};

type PipelineLane = {
  id: string;
  title: string;
  cards: PipelineCard[];
};

type AdoptionRequest = {
  requestId: string;
  animalName: string;
  animalImage: string;
  applicantName: string;
  city: string;
  homeType: "apartment" | "house" | "farm" | "other";
  status: "pending" | "shortlisted" | "homevisit" | "final" | "adopted";
  createdAt: string;
};

type AdoptionRequestsResponse = {
  ok?: boolean;
  message?: string;
  requests?: AdoptionRequest[];
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

const lanes: PipelineLane[] = [
  {
    id: "pending",
    title: "Pending Review",
    cards: [],
  },
  {
    id: "shortlisted",
    title: "Shortlisted",
    cards: [],
  },
  {
    id: "homevisit",
    title: "Home Visit",
    cards: [],
  },
  {
    id: "final",
    title: "Final Approval",
    cards: [],
  },
  {
    id: "adopted",
    title: "Adopted",
    cards: [],
  },
];

export default function AdoptionPipelinePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [adoptionRequests, setAdoptionRequests] = useState<AdoptionRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [requestsError, setRequestsError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadRequests() {
      try {
        setIsLoadingRequests(true);
        setRequestsError("");

        const response = await fetch("/api/adoption/requests", { cache: "no-store" });
        const payload = (await response.json()) as AdoptionRequestsResponse;

        if (!response.ok || !payload.ok) {
          throw new Error(payload.message ?? "Failed to load adoption requests.");
        }

        if (isMounted) {
          setAdoptionRequests(Array.isArray(payload.requests) ? payload.requests : []);
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

    loadRequests();

    return () => {
      isMounted = false;
    };
  }, []);

  const boardLanes = useMemo<PipelineLane[]>(() => {
    const grouped = new Map<PipelineLane["id"], PipelineCard[]>([
      ["pending", []],
      ["shortlisted", []],
      ["homevisit", []],
      ["final", []],
      ["adopted", []],
    ]);

    adoptionRequests.forEach((request) => {
      const laneId = (request.status === "final" ? "final" : request.status) as PipelineLane["id"];
      const collection = grouped.get(laneId);

      if (!collection) {
        return;
      }

      collection.push({
        id: request.requestId,
        applicant: request.applicantName,
        pet: request.animalName,
        date: formatRelativeTime(request.createdAt),
        tone: request.status === "pending" ? "warm" : request.status === "adopted" ? "mint" : "neutral",
        image: request.animalImage,
        tag: `ID ${request.requestId}`,
        location: `${request.city} • ${request.homeType}`,
      });
    });

    return lanes.map((lane) => ({
      ...lane,
      cards: grouped.get(lane.id) ?? [],
    }));
  }, [adoptionRequests]);

  const monthlyRequestsCount = useMemo(() => {
    const now = new Date();

    return adoptionRequests.filter((request) => {
      const createdAt = new Date(request.createdAt);

      return (
        Number.isFinite(createdAt.getTime()) &&
        createdAt.getMonth() === now.getMonth() &&
        createdAt.getFullYear() === now.getFullYear()
      );
    }).length;
  }, [adoptionRequests]);

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
            <input
              aria-label="Search"
              placeholder="Search applications or animals..."
              type="text"
            />
          </div>
          <div className="admin-top-icons">
            <AdminThemeToggle />
            <span>🔔</span>
            <span>⚙️</span>
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
              <strong>{adoptionRequests.length}</strong>
            </article>
            <article>
              <p>This Month</p>
              <strong>{monthlyRequestsCount}</strong>
            </article>
          </div>
        </section>

        <section className="adoption-toolbar" aria-label="Pipeline filters">
          <button className="filter-pill" type="button">
            All Species
          </button>
          <button className="filter-pill" type="button">
            Urgency: High
          </button>
          <p>Showing priority applications first</p>
          <Link href="/admin/adoption/review" className="adoption-review-link">
            Open Review Page
          </Link>
          <div className="view-switch" role="group" aria-label="Board view options">
            <button className="active" type="button">
              Board View
            </button>
            <button type="button">List View</button>
          </div>
        </section>

        <section className="pipeline-board" aria-label="Adoption pipeline board">
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
                    <small className="pipeline-location">Live request</small>
                    {lane.id === "shortlisted" ? (
                      <Link href="/admin/adoption/review" className="pipeline-review-link">
                        Review Application
                      </Link>
                    ) : null}
                  </div>
                ))}
                {isLoadingRequests ? <p className="pipeline-empty-note">Loading live requests...</p> : null}
                {!isLoadingRequests && requestsError ? <p className="pipeline-empty-note">{requestsError}</p> : null}
                {!isLoadingRequests && !requestsError && lane.cards.length === 0 ? (
                  <p className="pipeline-empty-note">No live requests in this stage yet.</p>
                ) : null}
              </div>
            </article>
          ))}
        </section>

        <button className="pipeline-fab" type="button" aria-label="Create adoption application">
          +
        </button>
      </main>
    </div>
  );
}
