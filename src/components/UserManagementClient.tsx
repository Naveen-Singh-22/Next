"use client";

import { useEffect, useMemo, useState } from "react";
import { Briefcase, HeartHandshake, Shield, UserCheck, Users } from "lucide-react";
import Link from "next/link";
import AdminThemeToggle from "@/components/AdminThemeToggle";
import AdminTopNav from "@/components/AdminTopNav";
import AdminTopbarBrand from "@/components/AdminTopbarBrand";
import type { User, UserRole } from "@/lib/usersStore";

type UsersResponse = {
  users?: User[];
  message?: string;
};

const ROLE_OPTIONS: { value: UserRole; label: string; color: string; icon: typeof Shield }[] = [
  { value: "admin", label: "Admin", color: "teal", icon: Shield },
  { value: "staff", label: "Staff", color: "blue", icon: Briefcase },
  { value: "donor", label: "Donor", color: "mint", icon: HeartHandshake },
  { value: "volunteer", label: "Volunteer", color: "orange", icon: Users },
  { value: "adopter", label: "Adopter", color: "purple", icon: UserCheck },
];

function formatDate(isoDate: string) {
  const date = new Date(isoDate);
  if (!Number.isFinite(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatRelativeTime(isoDate: string) {
  const timestamp = new Date(isoDate).getTime();

  if (!Number.isFinite(timestamp)) {
    return "Unknown";
  }

  const secondsDiff = Math.round((Date.now() - timestamp) / 1000);
  const absSeconds = Math.abs(secondsDiff);
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (absSeconds < 60) {
    return formatter.format(-Math.round(secondsDiff / 1), "second");
  }

  if (absSeconds < 3600) {
    return formatter.format(-Math.round(secondsDiff / 60), "minute");
  }

  if (absSeconds < 86400) {
    return formatter.format(-Math.round(secondsDiff / 3600), "hour");
  }

  return formatter.format(-Math.round(secondsDiff / 86400), "day");
}

function getRoleColor(role: UserRole): string {
  return ROLE_OPTIONS.find((r) => r.value === role)?.color ?? "gray";
}

function getRoleOption(role: UserRole) {
  return ROLE_OPTIONS.find((item) => item.value === role);
}

export default function UserManagementClient() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingRoleUserId, setEditingRoleUserId] = useState<string | null>(null);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  // Load users
  useEffect(() => {
    let isMounted = true;

    async function loadUsers() {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch("/api/users", { cache: "no-store" });
        const payload = (await response.json()) as UsersResponse;

        if (!response.ok) {
          throw new Error(payload.message ?? "Failed to load users");
        }

        if (isMounted) {
          setUsers(Array.isArray(payload.users) ? payload.users : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load users");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter users
  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        query.length === 0 ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.id.toLowerCase().includes(query);

      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus =
        statusFilter === "all" || (statusFilter === "active" ? user.isActive : !user.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  // Update role
  async function handleRoleChange(userId: string, newRole: UserRole) {
    setUpdatingIds((prev) => new Set(prev).add(userId));

    try {
      const response = await fetch(`/api/users?id=${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user role");
      }

      const { user: updatedUser } = (await response.json()) as { user: User };

      setUsers((prev) => prev.map((u) => (u.id === userId ? updatedUser : u)));
      setSelectedUser((prev) => (prev?.id === userId ? updatedUser : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user role");
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
      setEditingRoleUserId(null);
    }
  }

  // Update status
  async function handleStatusChange(userId: string, isActive: boolean) {
    setUpdatingIds((prev) => new Set(prev).add(userId));

    try {
      const response = await fetch(`/api/users?id=${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user status");
      }

      const { user: updatedUser } = (await response.json()) as { user: User };

      setUsers((prev) => prev.map((u) => (u.id === userId ? updatedUser : u)));
      setSelectedUser((prev) => (prev?.id === userId ? updatedUser : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user status");
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  }

  // View user profile
  function handleViewProfile(user: User) {
    setSelectedUser(user);
  }

  // Close profile modal
  function handleCloseProfile() {
    setSelectedUser(null);
    setEditingRoleUserId(null);
  }

  function handleRoleCardClick(role: UserRole) {
    setRoleFilter((current) => (current === role ? "all" : role));
  }

  const stats = {
    total: users.length,
    active: users.filter((u) => u.isActive).length,
    byRole: ROLE_OPTIONS.reduce(
      (acc, opt) => {
        acc[opt.value] = users.filter((u) => u.role === opt.value).length;
        return acc;
      },
      {} as Record<UserRole, number>,
    ),
  };

  return (
    <div className="admin-page admin-mobile-shell">
      {/* Header */}
      <div className="admin-topbar">
        <button
          className="admin-menu-btn"
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Open admin menu"
          aria-expanded={isSidebarOpen}
          type="button"
        >
          <span />
          <span />
          <span />
        </button>
        <AdminTopbarBrand />
        <AdminTopNav activeHref="/admin/users" />
        <AdminThemeToggle />
      </div>

      {/* Main Content */}
      <div className="admin-main">
        {/* Sidebar */}
        <aside className={`admin-sidebar admin-mobile-sidebar ${isSidebarOpen ? "open" : ""}`.trim()}>
          <div className="admin-brand">
            <Link href="/" className="admin-brand-link" aria-label="thecaninehelp home">
              <img src="/images/logo3.png" alt="thecaninehelp" className="admin-brand-logo admin-brand-logo-light" />
              <img src="/images/logo3-dark.png" alt="thecaninehelp" className="admin-brand-logo admin-brand-logo-dark" />
              <span className="admin-brand-text">thecaninehelp</span>
            </Link>
            <small>Global Governance</small>
          </div>

          <button className="admin-sidebar-close" type="button" onClick={() => setIsSidebarOpen(false)} aria-label="Close sidebar">
            Close
          </button>

          <nav>
            <ul className="admin-nav">
              <li>
                <a href="/admin">Overview</a>
              </li>
              <li>
                <a href="/admin/rescue">Rescue Management</a>
              </li>
              <li>
                <a href="/admin/adoption">Adoption Pipeline</a>
              </li>
              <li>
                <a href="/admin/inventory">Animal Inventory</a>
              </li>
              <li>
                <a href="/admin/vaccinations">Vaccinations</a>
              </li>
              <li className="active">
                <a href="/admin/users">User Management</a>
              </li>
              <li>
                <a href="/admin/inquiry-management">Inquiries</a>
              </li>
            </ul>
          </nav>

          <button className="alert-btn" type="button">
            Emergency Alert
          </button>
        </aside>

        <div className={`admin-sidebar-backdrop ${isSidebarOpen ? "show" : ""}`.trim()} onClick={() => setIsSidebarOpen(false)} aria-hidden={!isSidebarOpen} />

        {/* Content */}
        <main className="admin-content">
          {/* Page Header */}
          <div className="admin-page-header">
            <div>
              <h1>User &amp; Role Management</h1>
              <p>Oversee system access and delegate responsibilities across the organization.</p>
            </div>
            <button className="primary-btn" type="button">
              INVITE NEW MEMBER
            </button>
          </div>

          {/* Stats */}
          <div className="admin-stats-grid">
            <div className="stat-card">
              <div className="stat-icon"><Users size={28} /></div>
              <div className="stat-content">
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">Total Users</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><UserCheck size={28} /></div>
              <div className="stat-content">
                <div className="stat-value">{stats.active}</div>
                <div className="stat-label">Active Users</div>
              </div>
            </div>
            {ROLE_OPTIONS.map((role) => (
              <button
                key={role.value}
                type="button"
                className={`stat-card stat-card-button ${roleFilter === role.value ? "active" : ""}`}
                onClick={() => handleRoleCardClick(role.value)}
                aria-pressed={roleFilter === role.value}
              >
                <div className={`stat-icon role-${role.color}`}>
                  <role.icon size={28} />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{stats.byRole[role.value]}</div>
                  <div className="stat-label">{role.label}s</div>
                </div>
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="admin-filters">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by name, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as UserRole | "all")} className="filter-select">
              <option value="all">All Roles</option>
              {ROLE_OPTIONS.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")} className="filter-select">
              <option value="all">Status: All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <div className="view-toggle">
              <button
                className={viewMode === "list" ? "active" : ""}
                onClick={() => setViewMode("list")}
                type="button"
                title="List view"
              >
                ☰
              </button>
              <button
                className={viewMode === "grid" ? "active" : ""}
                onClick={() => setViewMode("grid")}
                type="button"
                title="Grid view"
              >
                ⊞
              </button>
            </div>
          </div>

          {roleFilter !== "all" && (
            <div className="filter-chip-row">
              <button className="filter-chip active" type="button" onClick={() => setRoleFilter("all")}>
                Showing {getRoleOption(roleFilter)?.label ?? "Users"}
                <span>Clear</span>
              </button>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="admin-loading">
              <p>Loading users...</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="admin-error">
              <p>{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && filteredUsers.length === 0 && (
            <div className="admin-empty">
              <p>No users found.</p>
            </div>
          )}

          {/* Users List */}
          {!isLoading && !error && filteredUsers.length > 0 && viewMode === "list" && (
            <div className="users-list-container">
              <div className="users-list-header">
                <div className="col-avatar">Avatar</div>
                <div className="col-name">Name</div>
                <div className="col-email">Email</div>
                <div className="col-role">Current Role</div>
                <div className="col-status">Status</div>
                <div className="col-joined">Joined</div>
                <div className="col-actions">Actions</div>
              </div>

              <div className="users-list">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="user-row">
                    <div className="col-avatar">
                      <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
                    </div>
                    <div className="col-name">
                      <div className="user-name">{user.name}</div>
                    </div>
                    <div className="col-email">
                      <div className="user-email">{user.email}</div>
                    </div>
                    <div className="col-role">
                      <div className={`role-badge role-${getRoleColor(user.role)}`}>{ROLE_OPTIONS.find((r) => r.value === user.role)?.label}</div>
                    </div>
                    <div className="col-status">
                      <label className="status-toggle">
                        <input
                          type="checkbox"
                          checked={user.isActive}
                          onChange={(e) => handleStatusChange(user.id, e.target.checked)}
                          disabled={updatingIds.has(user.id)}
                        />
                        <span>{user.isActive ? "Active" : "Inactive"}</span>
                      </label>
                    </div>
                    <div className="col-joined">
                      <div className="joined-date" title={formatDate(user.createdAt)}>
                        {formatRelativeTime(user.createdAt)}
                      </div>
                    </div>
                    <div className="col-actions">
                      <button
                        className="action-btn"
                        onClick={() => handleViewProfile(user)}
                        disabled={updatingIds.has(user.id)}
                        type="button"
                      >
                        VIEW
                      </button>
                      <button
                        className="action-btn edit"
                        onClick={() => setEditingRoleUserId(user.id)}
                        disabled={updatingIds.has(user.id)}
                        type="button"
                      >
                        EDIT
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="users-list-footer">
                <p>Showing 1-{filteredUsers.length} of {filteredUsers.length} users</p>
              </div>
            </div>
          )}

          {/* Users Grid */}
          {!isLoading && !error && filteredUsers.length > 0 && viewMode === "grid" && (
            <div className="users-grid">
              {filteredUsers.map((user) => (
                <div key={user.id} className="user-card">
                  <div className="user-card-header">
                    <div className="user-card-avatar">{user.name.charAt(0).toUpperCase()}</div>
                    <div className={`status-indicator ${user.isActive ? "active" : "inactive"}`} title={user.isActive ? "Active" : "Inactive"} />
                  </div>
                  <div className="user-card-body">
                    <h3 className="user-card-name">{user.name}</h3>
                    <p className="user-card-email">{user.email}</p>
                    <div className="user-card-meta">
                      <span className={`role-badge role-${getRoleColor(user.role)}`}>{ROLE_OPTIONS.find((r) => r.value === user.role)?.label}</span>
                      <span className="joined-badge">Joined {formatRelativeTime(user.createdAt)}</span>
                    </div>
                  </div>
                  <div className="user-card-footer">
                    <button className="card-btn" onClick={() => handleViewProfile(user)} disabled={updatingIds.has(user.id)} type="button">
                      View Profile
                    </button>
                    <button className="card-btn edit" onClick={() => setEditingRoleUserId(user.id)} disabled={updatingIds.has(user.id)} type="button">
                      Edit Role
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Edit Role Modal */}
          {editingRoleUserId && filteredUsers.find((u) => u.id === editingRoleUserId) && (
            <div className="modal-overlay" onClick={() => setEditingRoleUserId(null)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Change Role</h2>
                <p>Select a new role for {filteredUsers.find((u) => u.id === editingRoleUserId)?.name}</p>
                <div className="role-options">
                  {ROLE_OPTIONS.map((role) => (
                    <button
                      key={role.value}
                      className={`role-option ${filteredUsers.find((u) => u.id === editingRoleUserId)?.role === role.value ? "selected" : ""}`}
                      onClick={() => handleRoleChange(editingRoleUserId, role.value)}
                      disabled={updatingIds.has(editingRoleUserId)}
                      type="button"
                    >
                      <div className={`role-option-icon role-${role.color}`} />
                      <div>
                        <div className="role-option-title">{role.label}</div>
                        <div className="role-option-desc">
                          {role.value === "admin" && "Complete architectural oversight, financial spending, and user governance rights."}
                          {role.value === "staff" && "Full operational management including rescue logs, adoption processing, and scheduling."}
                          {role.value === "donor" && "Full operational management including rescue logs, adoption processing, and scheduling."}
                          {role.value === "volunteer" && "Core access to task management, animal profiles, and volunteer coordination."}
                          {role.value === "adopter" && "Read-only access for transparency reports and search & discovery data."}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="modal-actions">
                  <button className="secondary-btn" onClick={() => setEditingRoleUserId(null)} type="button">
                    CANCEL
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* User Profile Modal */}
          {selectedUser && (
            <div className="modal-overlay" onClick={handleCloseProfile}>
              <div className="modal-content user-profile-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={handleCloseProfile} type="button">
                  ✕
                </button>
                <div className="profile-header">
                  <div className="profile-avatar">{selectedUser.name.charAt(0).toUpperCase()}</div>
                  <div>
                    <h2>{selectedUser.name}</h2>
                    <p>{selectedUser.email}</p>
                  </div>
                </div>

                <div className="profile-details">
                  <div className="detail-row">
                    <span className="detail-label">User ID:</span>
                    <span className="detail-value">{selectedUser.id}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Current Role:</span>
                    <span className={`role-badge role-${getRoleColor(selectedUser.role)}`}>{ROLE_OPTIONS.find((r) => r.value === selectedUser.role)?.label}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Account Status:</span>
                    <span className={`status-badge ${selectedUser.isActive ? "active" : "inactive"}`}>{selectedUser.isActive ? "Active" : "Inactive"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Joined:</span>
                    <span className="detail-value">{formatDate(selectedUser.createdAt)}</span>
                  </div>
                  {selectedUser.lastLogin && (
                    <div className="detail-row">
                      <span className="detail-label">Last Login:</span>
                      <span className="detail-value">{formatDate(selectedUser.lastLogin)}</span>
                    </div>
                  )}
                </div>

                <div className="profile-actions">
                  <button
                    className="primary-btn"
                    onClick={() => {
                      setEditingRoleUserId(selectedUser.id);
                    }}
                    disabled={updatingIds.has(selectedUser.id)}
                    type="button"
                  >
                    CHANGE ROLE
                  </button>
                  <button
                    className={`secondary-btn ${selectedUser.isActive ? "danger" : ""}`}
                    onClick={() => handleStatusChange(selectedUser.id, !selectedUser.isActive)}
                    disabled={updatingIds.has(selectedUser.id)}
                    type="button"
                  >
                    {selectedUser.isActive ? "DEACTIVATE" : "ACTIVATE"}
                  </button>
                  <button className="secondary-btn" onClick={handleCloseProfile} type="button">
                    CLOSE
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <style>{`
        .admin-page {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background: var(--background);
          color: var(--foreground);
        }

        .admin-topbar {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: var(--surface);
          border-bottom: 1px solid var(--shell-divider);
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .admin-main {
          display: flex;
          flex: 1;
        }

        .admin-sidebar {
          width: 250px;
          background: var(--surface);
          border-right: 1px solid var(--shell-divider);
          padding: 1.5rem 1rem;
          overflow-y: auto;
        }

        .admin-content {
          flex: 1;
          padding: 2rem;
          overflow-y: auto;
        }

        .admin-page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          gap: 1rem;
        }

        .admin-page-header h1 {
          margin: 0;
          font-size: 2rem;
          font-weight: 600;
        }

        .admin-page-header p {
          margin: 0.5rem 0 0;
          color: var(--muted);
        }

        .admin-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          display: flex;
          gap: 1rem;
          padding: 1.5rem;
          background: var(--surface);
          border: 1px solid var(--shell-divider);
          border-radius: 12px;
        }

        .stat-card-button {
          appearance: none;
          width: 100%;
          cursor: pointer;
          text-align: left;
          font: inherit;
          color: inherit;
          transition: transform 0.2s ease, border-color 0.2s ease;
        }

        .stat-card-button:hover {
          transform: translateY(-1px);
          border-color: var(--primary);
        }

        .stat-card-button.active {
          border-color: var(--primary);
        }

        .stat-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          color: var(--primary);
        }

        .stat-icon.role-teal {
          color: #0c8072;
        }

        .stat-icon.role-blue {
          color: #3b82f6;
        }

        .stat-icon.role-mint {
          color: #10b981;
        }

        .stat-icon.role-orange {
          color: #f97316;
        }

        .stat-icon.role-purple {
          color: #8b5cf6;
        }

        .stat-value {
          font-size: 1.8rem;
          font-weight: 600;
        }

        .stat-label {
          font-size: 0.9rem;
          color: var(--muted);
          margin-top: 0.25rem;
        }

        .admin-filters {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .search-box {
          flex: 1;
          min-width: 250px;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid var(--shell-divider);
          border-radius: 8px;
          background: var(--surface);
          color: var(--foreground);
          font-size: 0.95rem;
        }

        .search-input::placeholder {
          color: var(--muted);
        }

        .filter-select {
          padding: 0.75rem 1rem;
          border: 1px solid var(--shell-divider);
          border-radius: 8px;
          background: var(--surface);
          color: var(--foreground);
          font-size: 0.95rem;
          cursor: pointer;
        }

        .view-toggle {
          display: flex;
          gap: 0.5rem;
        }

        .view-toggle button {
          padding: 0.5rem 0.75rem;
          border: 1px solid var(--shell-divider);
          background: var(--surface);
          color: var(--foreground);
          cursor: pointer;
          border-radius: 6px;
          font-size: 1rem;
        }

        .view-toggle button.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        .filter-chip-row {
          display: flex;
          margin-bottom: 1rem;
        }

        .filter-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.65rem 1rem;
          border-radius: 999px;
          border: 1px solid var(--shell-divider);
          background: var(--surface);
          color: var(--foreground);
          cursor: pointer;
        }

        .filter-chip span {
          color: var(--muted);
          font-size: 0.85rem;
        }

        .filter-chip.active {
          border-color: var(--primary);
        }

        .users-list-container {
          background: var(--surface);
          border: 1px solid var(--shell-divider);
          border-radius: 12px;
          overflow: hidden;
        }

        .users-list-header {
          display: grid;
          grid-template-columns: 50px 150px 200px 120px 100px 120px 140px;
          gap: 1rem;
          padding: 1.25rem;
          background: var(--background);
          border-bottom: 1px solid var(--shell-divider);
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--muted);
        }

        .users-list {
          max-height: 600px;
          overflow-y: auto;
        }

        .user-row {
          display: grid;
          grid-template-columns: 50px 150px 200px 120px 100px 120px 140px;
          gap: 1rem;
          padding: 1.25rem;
          border-bottom: 1px solid var(--shell-divider);
          align-items: center;
          transition: background 0.2s;
        }

        .user-row:hover {
          background: var(--background);
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
        }

        .user-name {
          font-weight: 500;
        }

        .user-email {
          font-size: 0.9rem;
          color: var(--muted);
        }

        .role-badge {
          display: inline-block;
          padding: 0.35rem 0.75rem;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 500;
          text-align: center;
        }

        .role-teal,
        .role-badge.role-teal {
          background: rgba(21, 160, 142, 0.15);
          color: #15a08e;
        }

        :root[data-theme="dark"] .role-teal,
        :root[data-theme="dark"] .role-badge.role-teal {
          background: rgba(21, 160, 142, 0.2);
          color: #15a08e;
        }

        .role-blue,
        .role-badge.role-blue {
          background: rgba(59, 130, 246, 0.15);
          color: #3b82f6;
        }

        :root[data-theme="dark"] .role-blue,
        :root[data-theme="dark"] .role-badge.role-blue {
          background: rgba(59, 130, 246, 0.2);
          color: #3b82f6;
        }

        .role-mint,
        .role-badge.role-mint {
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
        }

        :root[data-theme="dark"] .role-mint,
        :root[data-theme="dark"] .role-badge.role-mint {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }

        .role-orange,
        .role-badge.role-orange {
          background: rgba(249, 115, 22, 0.15);
          color: #f97316;
        }

        :root[data-theme="dark"] .role-orange,
        :root[data-theme="dark"] .role-badge.role-orange {
          background: rgba(249, 115, 22, 0.2);
          color: #f97316;
        }

        .role-purple,
        .role-badge.role-purple {
          background: rgba(168, 85, 247, 0.15);
          color: #a855f7;
        }

        :root[data-theme="dark"] .role-purple,
        :root[data-theme="dark"] .role-badge.role-purple {
          background: rgba(168, 85, 247, 0.2);
          color: #a855f7;
        }

        .status-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          user-select: none;
        }

        .status-toggle input {
          cursor: pointer;
        }

        .status-toggle span {
          font-size: 0.9rem;
        }

        .joined-date {
          font-size: 0.9rem;
          color: var(--muted);
        }

        .action-btn {
          padding: 0.4rem 0.8rem;
          background: var(--background);
          border: 1px solid var(--shell-divider);
          border-radius: 4px;
          color: var(--primary);
          cursor: pointer;
          font-size: 0.8rem;
          font-weight: 500;
          transition: all 0.2s;
          margin-right: 0.5rem;
        }

        .action-btn:hover:not(:disabled) {
          background: var(--primary);
          color: white;
        }

        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .action-btn.edit {
          color: var(--primary);
        }

        .users-list-footer {
          padding: 1rem 1.25rem;
          background: var(--background);
          border-top: 1px solid var(--shell-divider);
          font-size: 0.9rem;
          color: var(--muted);
        }

        .users-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .user-card {
          background: var(--surface);
          border: 1px solid var(--shell-divider);
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          transition: all 0.2s;
        }

        .user-card:hover {
          border-color: var(--primary);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        :root[data-theme="dark"] .user-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .user-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .user-card-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 1.2rem;
        }

        .status-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #ef4444;
        }

        .status-indicator.active {
          background: #10b981;
        }

        .user-card-body {
          flex: 1;
          margin-bottom: 1rem;
        }

        .user-card-name {
          margin: 0 0 0.5rem;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .user-card-email {
          margin: 0 0 1rem;
          font-size: 0.9rem;
          color: var(--muted);
        }

        .user-card-meta {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .joined-badge {
          font-size: 0.85rem;
          color: var(--muted);
        }

        .user-card-footer {
          display: flex;
          gap: 0.5rem;
        }

        .card-btn {
          flex: 1;
          padding: 0.6rem 1rem;
          border: 1px solid var(--primary);
          background: transparent;
          color: var(--primary);
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 500;
          transition: all 0.2s;
        }

        .card-btn:hover:not(:disabled) {
          background: var(--primary);
          color: white;
        }

        .card-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .card-btn.edit {
          border-color: var(--primary);
          color: var(--primary);
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: var(--surface);
          border-radius: 12px;
          padding: 2rem;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
        }

        .modal-content h2 {
          margin: 0 0 0.5rem;
          font-size: 1.5rem;
        }

        .modal-content p {
          margin: 0 0 1.5rem;
          color: var(--muted);
        }

        .role-options {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .role-option {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          border: 2px solid var(--shell-divider);
          background: var(--background);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .role-option:hover:not(:disabled) {
          border-color: var(--primary);
        }

        .role-option.selected {
          border-color: var(--primary);
          background: var(--surface);
        }

        .role-option:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .role-option-icon {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          flex-shrink: 0;
        }

        .role-option-title {
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .role-option-desc {
          font-size: 0.85rem;
          color: var(--muted);
          line-height: 1.4;
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        .primary-btn,
        .secondary-btn {
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .primary-btn {
          background: var(--primary);
          color: white;
        }

        .primary-btn:hover:not(:disabled) {
          background: var(--primary-deep);
        }

        .primary-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .secondary-btn {
          background: transparent;
          border: 1px solid var(--shell-divider);
          color: var(--foreground);
        }

        .secondary-btn:hover:not(:disabled) {
          background: var(--background);
        }

        .secondary-btn.danger:hover:not(:disabled) {
          background: #fee2e2;
          border-color: #fca5a5;
          color: #dc2626;
        }

        :root[data-theme="dark"] .secondary-btn.danger:hover:not(:disabled) {
          background: rgba(220, 38, 38, 0.1);
          border-color: rgba(220, 38, 38, 0.3);
          color: #f87171;
        }

        .secondary-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .user-profile-modal {
          max-width: 600px;
        }

        .modal-close {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          background: transparent;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: var(--muted);
        }

        .modal-close:hover {
          color: var(--foreground);
        }

        .profile-header {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--shell-divider);
        }

        .profile-avatar {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: var(--primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .profile-header h2 {
          margin: 0;
        }

        .profile-header p {
          margin: 0.25rem 0 0;
          color: var(--muted);
        }

        .profile-details {
          margin-bottom: 2rem;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid var(--shell-divider);
        }

        .detail-label {
          font-weight: 500;
          color: var(--muted);
        }

        .detail-value {
          text-align: right;
        }

        .status-badge {
          display: inline-block;
          padding: 0.35rem 0.75rem;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .status-badge.active {
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
        }

        :root[data-theme="dark"] .status-badge.active {
          background: rgba(16, 185, 129, 0.2);
        }

        .status-badge.inactive {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }

        :root[data-theme="dark"] .status-badge.inactive {
          background: rgba(239, 68, 68, 0.2);
        }

        .profile-actions {
          display: flex;
          gap: 0.75rem;
          flex-direction: column;
        }

        .admin-loading,
        .admin-error,
        .admin-empty {
          text-align: center;
          padding: 3rem 1rem;
          background: var(--surface);
          border: 1px solid var(--shell-divider);
          border-radius: 12px;
        }

        .admin-error {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.3);
          color: #ef4444;
        }

        :root[data-theme="dark"] .admin-error {
          background: rgba(239, 68, 68, 0.15);
          color: #f87171;
        }

        .admin-loading p,
        .admin-error p,
        .admin-empty p {
          margin: 0;
        }

        @media (max-width: 1024px) {
          .admin-topbar {
            flex-wrap: wrap;
          }

          .admin-page-header {
            flex-direction: column;
          }

          .admin-stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .admin-filters {
            flex-direction: column;
          }

          .search-box,
          .filter-select,
          .view-toggle {
            width: 100%;
          }

          .view-toggle button {
            flex: 1;
          }

          .users-list-header {
            grid-template-columns: 40px minmax(0, 1fr) 110px 100px;
          }

          .user-row {
            grid-template-columns: 40px minmax(0, 1fr) 110px 100px;
          }

          .col-email,
          .col-joined {
            display: none;
          }

          .users-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 768px) {
          .admin-main {
            flex-direction: column;
          }

          .admin-content {
            padding: 1rem;
          }

          .admin-sidebar {
            width: 100%;
            border-right: none;
            border-bottom: 1px solid var(--shell-divider);
            max-height: 200px;
          }

          .admin-page-header h1 {
            font-size: 1.6rem;
          }

          .admin-stats-grid {
            grid-template-columns: 1fr;
          }

          .stat-card {
            padding: 1rem;
          }

          .stat-value {
            font-size: 1.5rem;
          }

          .filter-chip-row {
            margin-bottom: 0.75rem;
          }

          .filter-chip {
            width: 100%;
            justify-content: center;
          }

          .users-list-container {
            overflow: hidden;
          }

          .users-list-header {
            display: none;
          }

          .user-row {
            grid-template-columns: 44px minmax(0, 1fr);
            gap: 0.75rem;
            padding: 1rem;
          }

          .col-name,
          .col-email,
          .col-role,
          .col-status,
          .col-joined,
          .col-actions {
            grid-column: 1 / -1;
          }

          .col-email,
          .col-joined {
            display: block;
          }

          .col-name {
            display: flex;
            align-items: center;
            min-width: 0;
          }

          .col-actions {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
          }

          .action-btn {
            flex: 1 1 120px;
            margin-right: 0;
          }

          .users-grid {
            grid-template-columns: 1fr;
          }

          .user-card-footer {
            flex-direction: column;
          }

          .card-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
