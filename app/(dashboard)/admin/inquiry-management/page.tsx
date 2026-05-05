"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import AdminTopbar from "@/components/AdminTopbar";
import type { InquiryStatus, InquiryType, StoredInquiry } from "@/lib/inquiryStore";

const typeLabels: Record<InquiryType, string> = {
  rescue: "Rescue",
  adoption: "Adoption",
  donation: "Donation",
  general: "General",
};

const typeLinks: Record<InquiryType, string> = {
  rescue: "/admin/rescue",
  adoption: "/admin/adoption",
  donation: "/donate",
  general: "/admin/inquiry-management",
};

const statusLabels: Record<InquiryStatus, string> = {
  new: "New",
  assigned: "Assigned",
  resolved: "Resolved",
};

const typeOptions: Array<InquiryType | "all"> = ["all", "rescue", "adoption", "donation", "general"];
const statusOptions: Array<InquiryStatus | "all"> = ["all", "new", "assigned", "resolved"];

function formatInboxTime(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getStatusClass(status: InquiryStatus) {
  return `status-${status}`;
}

function getTypeClass(type: InquiryType) {
  return type;
}

export default function InquiryManagementPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [inquiries, setInquiries] = useState<StoredInquiry[]>([]);
  const [selectedInquiryId, setSelectedInquiryId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState<InquiryType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | "all">("all");

  useEffect(() => {
    let active = true;

    async function loadInquiries() {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch("/api/inquiries", { cache: "no-store" });
        const result = (await response.json()) as { inquiries?: StoredInquiry[]; message?: string };

        if (!response.ok || !result.inquiries) {
          throw new Error(result.message ?? "Unable to load inquiries.");
        }

        const loadedInquiries = result.inquiries;

        if (!active) {
          return;
        }

        setInquiries(loadedInquiries);
        setSelectedInquiryId((currentSelected) => currentSelected ?? loadedInquiries[0]?.id ?? null);
      } catch (loadError) {
        if (!active) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : "Unable to load inquiries.");
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadInquiries();

    return () => {
      active = false;
    };
  }, []);

  const filteredInquiries = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    return inquiries.filter((inquiry) => {
      if (typeFilter !== "all" && inquiry.type !== typeFilter) {
        return false;
      }

      if (statusFilter !== "all" && inquiry.status !== statusFilter) {
        return false;
      }

      if (!search) {
        return true;
      }

      return [inquiry.title, inquiry.preview, String(inquiry.referenceId), inquiry.type, inquiry.status]
        .join(" ")
        .toLowerCase()
        .includes(search);
    });
  }, [inquiries, searchText, statusFilter, typeFilter]);

  const selectedInquiry = filteredInquiries.find((inquiry) => inquiry.id === selectedInquiryId) ?? filteredInquiries[0] ?? null;

  const stats = useMemo(() => {
    const openCount = inquiries.filter((inquiry) => inquiry.status !== "resolved").length;

    return {
      total: inquiries.length,
      openCount,
      rescueCount: inquiries.filter((inquiry) => inquiry.type === "rescue").length,
      newCount: inquiries.filter((inquiry) => inquiry.status === "new").length,
    };
  }, [inquiries]);

  async function changeInquiryStatus(status: InquiryStatus) {
    if (!selectedInquiry) {
      return;
    }

    try {
      const response = await fetch(`/api/inquiries/${selectedInquiry.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const result = (await response.json()) as { inquiry?: StoredInquiry; message?: string };

      if (!response.ok || !result.inquiry) {
        throw new Error(result.message ?? "Unable to update inquiry status.");
      }

      setInquiries((currentInquiries) =>
        currentInquiries.map((inquiry) => (inquiry.id === result.inquiry?.id ? result.inquiry : inquiry)),
      );
      setSelectedInquiryId(result.inquiry.id);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Unable to update inquiry status.");
    }
  }

  return (
    <div className="admin-page admin-mobile-shell inquiry-page">
      <AdminSidebar activeHref="/admin/inquiry-management" isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="admin-main inquiry-main">
        <AdminTopbar
          activeHref="/admin/inquiry-management"
          isSidebarOpen={isSidebarOpen}
          onOpenMenu={() => setIsSidebarOpen(true)}
        />

        <section className="inq-head">
          <div>
            <h1>Unified Inbox</h1>
            <p>
              Rescue reports, adoption applications, and donations now land in one reference-only inbox.
              Open each item from its original module without duplicating the source data.
            </p>
          </div>

          <div className="inq-stats">
            <article>
              <span>Total Inquiries</span>
              <strong>{stats.total}</strong>
              <small>{stats.openCount} still active</small>
            </article>
            <article>
              <span>New Items</span>
              <strong>{stats.newCount}</strong>
              <small>{stats.rescueCount} rescue cases</small>
            </article>
          </div>
        </section>

        <section className="inq-layout">
          <aside className="inq-inbox-card">
            <div className="inq-card-head">
              <h2>Inbox</h2>
              <div className="inq-card-tools">
                <button type="button" aria-label="Reload inbox" onClick={() => window.location.reload()}>
                  ↻
                </button>
              </div>
            </div>

            <div className="inq-filter-row" aria-label="Inquiry filters">
              <div className="inq-filter-group">
                {typeOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`inq-filter-pill ${typeFilter === option ? "active" : ""}`.trim()}
                    onClick={() => setTypeFilter(option)}
                  >
                    {option === "all" ? "All types" : typeLabels[option]}
                  </button>
                ))}
              </div>

              <div className="inq-filter-group">
                {statusOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`inq-filter-pill ${statusFilter === option ? "active" : ""}`.trim()}
                    onClick={() => setStatusFilter(option)}
                  >
                    {option === "all" ? "All statuses" : statusLabels[option]}
                  </button>
                ))}
              </div>
            </div>

            {error ? <p className="inq-note inq-note-error">{error}</p> : null}

            {isLoading ? <p className="inq-note">Loading inbox...</p> : null}

            {!isLoading && filteredInquiries.length === 0 ? (
              <div className="inq-empty-state">
                <strong>No inquiries match the current filters.</strong>
                <p>Clear the filters or search another term to bring items back into view.</p>
              </div>
            ) : null}

            <div className="inq-list">
              {filteredInquiries.map((inquiry) => {
                const isSelected = inquiry.id === selectedInquiry?.id;

                return (
                  <button
                    key={inquiry.id}
                    type="button"
                    className={`inq-item ${isSelected ? "selected" : ""}`.trim()}
                    onClick={() => setSelectedInquiryId(inquiry.id)}
                  >
                    <span className={`inq-tag ${getTypeClass(inquiry.type)}`}>{typeLabels[inquiry.type]}</span>
                    <span className={`inq-tag ${getStatusClass(inquiry.status)}`}>{statusLabels[inquiry.status]}</span>
                    <strong>{inquiry.title}</strong>
                    <p>{inquiry.preview}</p>
                    <div className="inq-assignee-row">
                      <span className="inq-initials">#{String(inquiry.referenceId).slice(-2).padStart(2, "0")}</span>
                      <small>{formatInboxTime(inquiry.createdAt)}</small>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <article className="inq-detail-card">
            {selectedInquiry ? (
              <>
                <div className="inq-detail-top">
                  <div className="inq-contact">
                    <span className="inq-avatar">{typeLabels[selectedInquiry.type].slice(0, 2).toUpperCase()}</span>
                    <div>
                      <h2>{selectedInquiry.title}</h2>
                      <p>
                        {typeLabels[selectedInquiry.type]} • Reference #{selectedInquiry.referenceId} •{" "}
                        {formatInboxTime(selectedInquiry.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="inq-detail-actions">
                    <Link className="inq-secondary-btn" href={typeLinks[selectedInquiry.type]}>
                      Open source module
                    </Link>
                    <button type="button" className="inq-secondary-btn" onClick={() => changeInquiryStatus("assigned")}>
                      Assign
                    </button>
                    <button type="button" className="inq-primary-btn" onClick={() => changeInquiryStatus("resolved")}>
                      Mark Resolved
                    </button>
                  </div>
                </div>

                <div className="inq-message-body">
                  <div className="inq-meta-row">
                    <span className={`inq-tag ${getTypeClass(selectedInquiry.type)}`}>{typeLabels[selectedInquiry.type]}</span>
                    <span className={`inq-tag ${getStatusClass(selectedInquiry.status)}`}>{statusLabels[selectedInquiry.status]}</span>
                    <small>Reference #{selectedInquiry.referenceId}</small>
                  </div>

                  <h3>{selectedInquiry.preview}</h3>

                  <p>
                    This entry is a lightweight inbox reference. The source rescue, adoption, or donation record stays
                    in its original module, and this view only tracks coordination status.
                  </p>
                  <p>
                    Use the source module link to review the full record, then update the inbox status once the task is
                    assigned or closed.
                  </p>

                  <div className="inq-detail-grid">
                    <div>
                      <span>Type</span>
                      <strong>{typeLabels[selectedInquiry.type]}</strong>
                    </div>
                    <div>
                      <span>Status</span>
                      <strong>{statusLabels[selectedInquiry.status]}</strong>
                    </div>
                    <div>
                      <span>Created</span>
                      <strong>{formatInboxTime(selectedInquiry.createdAt)}</strong>
                    </div>
                    <div>
                      <span>Reference</span>
                      <strong>#{selectedInquiry.referenceId}</strong>
                    </div>
                  </div>

                  {selectedInquiry.updatedAt ? (
                    <p className="inq-signature">Last updated {formatInboxTime(selectedInquiry.updatedAt)}</p>
                  ) : null}
                </div>
              </>
            ) : (
              <div className="inq-empty-detail">
                <strong>No inquiry selected.</strong>
                <p>Pick an item from the inbox to review the linked source record.</p>
              </div>
            )}
          </article>
        </section>
      </main>
    </div>
  );
}