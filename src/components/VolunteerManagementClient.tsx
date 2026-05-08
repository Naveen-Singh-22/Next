"use client";

import { useState, useEffect, useMemo } from "react";
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
          <div>
            <p>ACTIVE VOLUNTEERS</p>
            <h3>{stats.activeVolunteers}</h3>
          </div>
          <span className="stat-trend">↑ {stats.monthlyGrowth}</span>
        </article>

        <article className="volunteer-stat-card reveal-item">
          <div>
            <p>PENDING APPLICATIONS</p>
            <h3>{stats.pendingApplications}</h3>
          </div>
          <span className="stat-trend">⚠️ NEEDS REVIEW</span>
        </article>

        <article className="volunteer-stat-card reveal-item">
          <div>
            <p>HOURS LOGGED</p>
            <h3>{stats.hoursLogged}</h3>
          </div>
          <span className="stat-trend">Current Month Performance</span>
        </article>
      </ScrollReveal>

      <ScrollReveal as="section" className="volunteer-content-section" delayMs={120}>
        <div className="volunteer-controls reveal-item">
          <div className="volunteer-search-wrap">
            <input
              type="search"
              placeholder="Search registry..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="volunteer-search-input"
            />
          </div>

          <div className="volunteer-filters">
            <select value={filterSkill} onChange={(e) => setFilterSkill(e.target.value as typeof filterSkill)}>
              <option value="all">All Skills</option>
              <option value="Shelter Assistant">Shelter Assistant</option>
              <option value="Rescue Dispatcher">Rescue Dispatcher</option>
              <option value="Event Support">Event Support</option>
            </select>

            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}>
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
            >
              {isLoading ? "Refreshing..." : "Refresh"}
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
                          📋
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
                ✕
              </button>

              <h3>{selectedApplication.fullName}</h3>

              <div className="modal-detail-grid">
                <div>
                  <p className="detail-label">Email</p>
                  <p>{selectedApplication.email}</p>
                </div>
                <div>
                  <p className="detail-label">Phone</p>
                  <p>{selectedApplication.phone}</p>
                </div>
                <div>
                  <p className="detail-label">City</p>
                  <p>{selectedApplication.city}</p>
                </div>
                <div>
                  <p className="detail-label">Interest Area</p>
                  <p>{selectedApplication.interestArea}</p>
                </div>
              </div>

              <div className="modal-detail-section">
                <p className="detail-label">Availability</p>
                <p>{selectedApplication.availability}</p>
              </div>

              {selectedApplication.status === "pending" && (
                <div className="modal-actions">
                  <button
                    className="action-btn-approve"
                    type="button"
                    onClick={() => updateApplicationStatus(selectedApplication.applicationId, "approved")}
                  >
                    Approve
                  </button>
                  <button
                    className="action-btn-review"
                    type="button"
                    onClick={() => updateApplicationStatus(selectedApplication.applicationId, "reviewing")}
                  >
                    Mark as Reviewing
                  </button>
                  <button
                    className="action-btn-decline"
                    type="button"
                    onClick={() => updateApplicationStatus(selectedApplication.applicationId, "declined")}
                  >
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
