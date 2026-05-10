"use client";

import { useState, useEffect, useMemo } from "react";
import { BadgeCheck, CalendarDays, ClipboardList, Eye, Filter, LoaderCircle, MapPin, Phone, RefreshCw, Search, Users, X } from "lucide-react";
import type { StoredVolunteerApplication } from "@/lib/volunteerApplicationsStore";
import ScrollReveal from "@/components/ScrollReveal";

type VolunteerManagementClientProps = {
  initialApplications: StoredVolunteerApplication[];
};

export default function VolunteerManagementClient({ initialApplications }: VolunteerManagementClientProps) {
  const [applications, setApplications] = useState<StoredVolunteerApplication[]>(initialApplications);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "reviewing" | "approved" | "declined">("all");
  const [filterSkill, setFilterSkill] = useState<"all" | "Shelter Assistant" | "Rescue Dispatcher" | "Event Support">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedApplication, setSelectedApplication] = useState<StoredVolunteerApplication | null>(null);

  const itemsPerPage = 10;

  // Calculate statistics
  const stats = useMemo(() => {
    const activeVolunteers = applications.filter((a) => a.status === "approved").length;
    const pendingApplications = applications.filter((a) => a.status === "pending").length;
    const hoursLogged = activeVolunteers * 8.5; // Mock data
    const monthlyGrowth = "+12% from last month";

    return {
      activeVolunteers,
      pendingApplications,
      hoursLogged: hoursLogged.toFixed(1),
      monthlyGrowth,
    };
  }, [applications]);

  // Filter applications
  const filteredApplications = useMemo(() => {
    let result = [...applications];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (app) =>
          app.fullName.toLowerCase().includes(query) ||
          app.email.toLowerCase().includes(query) ||
          app.applicationId.toLowerCase().includes(query),
      );
    }

    if (filterStatus !== "all") {
      result = result.filter((app) => app.status === filterStatus);
    }

    if (filterSkill !== "all") {
      result = result.filter((app) => app.interestArea === filterSkill);
    }

    return result;
  }, [applications, searchQuery, filterStatus, filterSkill]);

  // Pagination
  const paginatedApplications = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredApplications.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredApplications, currentPage]);

  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);

  async function refreshApplications() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/volunteer");
      if (response.ok) {
        const data = (await response.json()) as { applications?: StoredVolunteerApplication[] };
        setApplications(data.applications ?? []);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function updateApplicationStatus(
    applicationId: string,
    newStatus: StoredVolunteerApplication["status"],
  ) {
    try {
      const response = await fetch(`/api/volunteer/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setApplications((prev) =>
          prev.map((app) => (app.applicationId === applicationId ? { ...app, status: newStatus } : app)),
        );
        if (selectedApplication?.applicationId === applicationId) {
          setSelectedApplication({ ...selectedApplication, status: newStatus });
        }
      }
    } catch (error) {
      console.error("Failed to update application status:", error);
    }
  }

  function formatDate(isoDate: string) {
    return new Date(isoDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function getStatusColor(status: StoredVolunteerApplication["status"]) {
    switch (status) {
      case "approved":
        return "status-approved";
      case "pending":
        return "status-pending";
      case "reviewing":
        return "status-reviewing";
      case "declined":
        return "status-declined";
      default:
        return "";
    }
  }

  function getStatusLabel(status: StoredVolunteerApplication["status"]) {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  return (
    <div className="admin-volunteer-management">
      <ScrollReveal as="section" className="volunteer-stats-grid" delayMs={0}>
        <article className="volunteer-stat-card reveal-item">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Users size={18} aria-hidden="true" />
            <p>ACTIVE VOLUNTEERS</p>
          </div>
          <div>
            <h3>{stats.activeVolunteers}</h3>
          </div>
          <span className="stat-trend">{stats.monthlyGrowth}</span>
        </article>

        <article className="volunteer-stat-card reveal-item">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ClipboardList size={18} aria-hidden="true" />
            <p>PENDING APPLICATIONS</p>
          </div>
          <div>
            <h3>{stats.pendingApplications}</h3>
          </div>
          <span className="stat-trend">Needs review</span>
        </article>

        <article className="volunteer-stat-card reveal-item">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <CalendarDays size={18} aria-hidden="true" />
            <p>HOURS LOGGED</p>
          </div>
          <div>
            <h3>{stats.hoursLogged}</h3>
          </div>
          <span className="stat-trend">Current month performance</span>
        </article>
      </ScrollReveal>

      <ScrollReveal as="section" className="volunteer-content-section" delayMs={120}>
        <div className="volunteer-controls reveal-item">
          <div className="volunteer-search-wrap">
            <div style={{ position: "relative" }}>
              <Search
                size={16}
                aria-hidden="true"
                style={{ position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)", opacity: 0.65 }}
              />
            <input
              type="search"
              placeholder="Search registry..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="volunteer-search-input"
              style={{ paddingLeft: "2.35rem" }}
            />
            </div>
          </div>

          <div className="volunteer-filters">
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", width: "100%", color: "var(--muted)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              <Filter size={14} aria-hidden="true" />
              <span>Filters</span>
            </div>
            <select value={filterSkill} onChange={(e) => setFilterSkill(e.target.value as typeof filterSkill)} aria-label="Filter volunteers by skill">
              <option value="all">All Skills</option>
              <option value="Shelter Assistant">Shelter Assistant</option>
              <option value="Rescue Dispatcher">Rescue Dispatcher</option>
              <option value="Event Support">Event Support</option>
            </select>

            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)} aria-label="Filter volunteers by status">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewing">Reviewing</option>
              <option value="approved">Approved</option>
              <option value="declined">Declined</option>
            </select>

            <button
              className="volunteer-refresh-btn"
              onClick={refreshApplications}
              disabled={isLoading}
              type="button"
              aria-label="Refresh applications"
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.45rem" }}
            >
              {isLoading ? <LoaderCircle size={16} aria-hidden="true" className="animate-spin" /> : <RefreshCw size={16} aria-hidden="true" />}
              <span>{isLoading ? "Refreshing..." : "Refresh"}</span>
            </button>
          </div>
        </div>

        <div className="volunteer-registry-wrap reveal-item">
          <h2 className="volunteer-section-title">Volunteer Registry</h2>
          {paginatedApplications.length > 0 ? (
            <>
              <table className="volunteer-table">
                <thead>
                  <tr>
                    <th>VOLUNTEER NAME</th>
                    <th>PRIMARY SKILL</th>
                    <th>STATUS</th>
                    <th>JOINED DATE</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedApplications.map((application) => (
                    <tr key={application.id}>
                      <td className="volunteer-name">
                        <div>
                          <p className="volunteer-full-name">{application.fullName}</p>
                          <small>{application.email}</small>
                        </div>
                      </td>
                      <td className="volunteer-skill">
                        <span className="skill-badge">{application.interestArea}</span>
                      </td>
                      <td className="volunteer-status">
                        <span className={`status-badge ${getStatusColor(application.status)}`}>
                          {getStatusLabel(application.status)}
                        </span>
                      </td>
                      <td className="volunteer-date">{formatDate(application.createdAt)}</td>
                      <td className="volunteer-actions">
                        <button
                          className="action-button"
                          type="button"
                          onClick={() => setSelectedApplication(application)}
                          title={`View details for ${application.fullName}`}
                          aria-label={`View volunteer details`}
                        >
                          <Eye size={16} aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className="volunteer-pagination">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    type="button"
                    className="pagination-btn"
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      type="button"
                      className={`pagination-btn ${currentPage === i + 1 ? "active" : ""}`}
                      aria-current={currentPage === i + 1 ? "page" : undefined}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    type="button"
                    className="pagination-btn"
                  >
                    Next
                  </button>
                </div>
              )}

              <p className="volunteer-count-info">Showing {paginatedApplications.length} of {filteredApplications.length} volunteers</p>
            </>
          ) : (
            <div className="no-data-message">
              <p>No volunteers found matching your criteria.</p>
            </div>
          )}
        </div>

        {selectedApplication && (
          <div className="volunteer-detail-modal-backdrop" onClick={() => setSelectedApplication(null)}>
            <div className="volunteer-detail-modal" onClick={(e) => e.stopPropagation()}>
              <button
                className="modal-close-btn"
                type="button"
                onClick={() => setSelectedApplication(null)}
                aria-label="Close detail modal"
              >
                <X size={18} aria-hidden="true" />
              </button>

              <h3>{selectedApplication.fullName}</h3>

              <div className="modal-detail-grid">
                <div>
                  <p className="detail-label" style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                    <Search size={14} aria-hidden="true" />
                    <span>Email</span>
                  </p>
                  <p>{selectedApplication.email}</p>
                </div>
                <div>
                  <p className="detail-label" style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                    <Phone size={14} aria-hidden="true" />
                    <span>Phone</span>
                  </p>
                  <p>{selectedApplication.phone}</p>
                </div>
                <div>
                  <p className="detail-label" style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                    <MapPin size={14} aria-hidden="true" />
                    <span>City</span>
                  </p>
                  <p>{selectedApplication.city}</p>
                </div>
                <div>
                  <p className="detail-label" style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                    <BadgeCheck size={14} aria-hidden="true" />
                    <span>Interest Area</span>
                  </p>
                  <p>{selectedApplication.interestArea}</p>
                </div>
              </div>

              <div className="modal-detail-section">
                <p className="detail-label" style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <CalendarDays size={14} aria-hidden="true" />
                  <span>Availability</span>
                </p>
                <p>{selectedApplication.availability}</p>
              </div>

              {selectedApplication.status === "pending" && (
                <div className="modal-actions">
                  <button
                    className="action-btn-approve"
                    type="button"
                    onClick={() => updateApplicationStatus(selectedApplication.applicationId, "approved")}
                  >
                    <BadgeCheck size={16} aria-hidden="true" />
                    Approve
                  </button>
                  <button
                    className="action-btn-review"
                    type="button"
                    onClick={() => updateApplicationStatus(selectedApplication.applicationId, "reviewing")}
                  >
                    <ClipboardList size={16} aria-hidden="true" />
                    Mark as Reviewing
                  </button>
                  <button
                    className="action-btn-decline"
                    type="button"
                    onClick={() => updateApplicationStatus(selectedApplication.applicationId, "declined")}
                  >
                    <X size={16} aria-hidden="true" />
                    Decline
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </ScrollReveal>
    </div>
  );
}
