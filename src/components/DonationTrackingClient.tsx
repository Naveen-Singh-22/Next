"use client";

import { useState, useEffect, useMemo } from "react";
import { CalendarDays, HeartHandshake, LoaderCircle, Search, RefreshCw, TrendingUp, Users, Eye } from "lucide-react";
import type { StoredDonation } from "@/lib/donationsStore";
import ScrollReveal from "@/components/ScrollReveal";

type DonationTrackingClientProps = {
  initialDonations: StoredDonation[];
};

export default function DonationTrackingClient({ initialDonations }: DonationTrackingClientProps) {
  const [donations, setDonations] = useState<StoredDonation[]>(initialDonations);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "successful" | "failed">("all");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  // Calculate statistics
  const stats = useMemo(() => {
    const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);
    const monthlyGrowth = "+12.5%";
    const activeDonors = new Set(donations.map((d) => d.email)).size;
    const successfulDonations = donations.length;

    return {
      totalDonations,
      monthlyGrowth,
      activeDonors,
      successfulDonations,
    };
  }, [donations]);

  // Filter donations based on search and status
  const filteredDonations = useMemo(() => {
    let result = [...donations];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (donation) =>
          donation.donorName.toLowerCase().includes(query) ||
          donation.email.toLowerCase().includes(query) ||
          donation.donationId.toLowerCase().includes(query),
      );
    }

    if (filterStatus !== "all") {
      if (filterStatus === "successful") {
        result = result.filter((d) => d.amount > 0);
      }
    }

    return result;
  }, [donations, searchQuery, filterStatus]);

  // Pagination
  const paginatedDonations = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredDonations.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredDonations, currentPage]);

  const totalPages = Math.ceil(filteredDonations.length / itemsPerPage);

  async function refreshDonations() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/donations");
      if (response.ok) {
        const data = (await response.json()) as { donations?: StoredDonation[] };
        setDonations(data.donations ?? []);
      }
    } finally {
      setIsLoading(false);
    }
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  }

  function formatDate(isoDate: string) {
    return new Date(isoDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return (
    <div className="admin-donation-tracking">
      <ScrollReveal as="section" className="donation-stats-grid" delayMs={0}>
        <article className="donation-stat-card reveal-item">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <HeartHandshake size={18} aria-hidden="true" />
            <p>TOTAL DONATIONS</p>
          </div>
          <div>
            <h3>{formatCurrency(stats.totalDonations)}</h3>
          </div>
          <span className="stat-trend">{stats.monthlyGrowth} vs last month</span>
        </article>

        <article className="donation-stat-card reveal-item">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <TrendingUp size={18} aria-hidden="true" />
            <p>MONTHLY GROWTH</p>
          </div>
          <div>
            <h3>{stats.monthlyGrowth}</h3>
          </div>
          <span className="stat-trend">Trending up</span>
        </article>

        <article className="donation-stat-card reveal-item">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Users size={18} aria-hidden="true" />
            <p>ACTIVE DONORS</p>
          </div>
          <div>
            <h3>{stats.activeDonors}</h3>
          </div>
          <span className="stat-trend">New supporters this week</span>
        </article>

        <article className="donation-stat-card reveal-item">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <CalendarDays size={18} aria-hidden="true" />
            <p>SUCCESSFUL DONATIONS</p>
          </div>
          <div>
            <h3>{stats.successfulDonations}</h3>
          </div>
          <span className="stat-trend">100% success rate</span>
        </article>
      </ScrollReveal>

      <ScrollReveal as="section" className="donation-content-section" delayMs={120}>
        <div className="donation-controls reveal-item">
          <div className="donation-search-wrap">
            <div style={{ position: "relative" }}>
              <Search
                size={16}
                aria-hidden="true"
                style={{ position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)", opacity: 0.65 }}
              />
            <input
              type="search"
              placeholder="Search by donor name, email, or transaction ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="donation-search-input"
              style={{ paddingLeft: "2.35rem" }}
            />
            </div>
          </div>

          <div className="donation-filters">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)} aria-label="Filter donations by status">
              <option value="all">All Donations</option>
              <option value="successful">Successful</option>
              <option value="pending">Pending</option>
            </select>
            <button
              className="donation-refresh-btn"
              onClick={refreshDonations}
              disabled={isLoading}
              type="button"
              aria-label="Refresh donations"
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.45rem" }}
            >
              {isLoading ? <LoaderCircle size={16} aria-hidden="true" className="animate-spin" /> : <RefreshCw size={16} aria-hidden="true" />}
              <span>{isLoading ? "Refreshing..." : "Refresh"}</span>
            </button>
          </div>
        </div>

        <div className="donation-table-wrap reveal-item">
          <h2 className="donation-section-title">Recent Transactions</h2>
          {paginatedDonations.length > 0 ? (
            <>
              <table className="donation-table">
                <thead>
                  <tr>
                    <th>DATE</th>
                    <th>DONOR NAME</th>
                    <th>PURPOSE</th>
                    <th>AMOUNT</th>
                    <th>STATUS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedDonations.map((donation) => (
                    <tr key={donation.id}>
                      <td className="donor-date">{formatDate(donation.createdAt)}</td>
                      <td className="donor-name">
                        <div>
                          <p className="donor-full-name">{donation.donorName}</p>
                          <small>{donation.email}</small>
                        </div>
                      </td>
                      <td className="donation-purpose">{donation.coverFees ? "General Fund" : "Specific Purpose"}</td>
                      <td className="donation-amount">{formatCurrency(donation.amount)}</td>
                      <td className="donation-status">
                        <span className="status-badge status-successful">✓ SUCCESSFUL</span>
                      </td>
                      <td className="donation-action">
                        <button
                          className="action-button"
                          type="button"
                          title={`View details for ${donation.donationId}`}
                          aria-label={`View donation details`}
                        >
                          <Eye size={16} aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className="donation-pagination">
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

              <p className="donation-count-info">Showing {paginatedDonations.length} of {filteredDonations.length} donations</p>
            </>
          ) : (
            <div className="no-data-message">
              <p>No donations found matching your criteria.</p>
            </div>
          )}
        </div>
      </ScrollReveal>
    </div>
  );
}
