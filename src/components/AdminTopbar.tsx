"use client";

import AdminThemeToggle from "@/components/AdminThemeToggle";
import AdminTopNav from "@/components/AdminTopNav";
import AdminTopbarBrand from "@/components/AdminTopbarBrand";

type AdminTopbarProps = {
  activeHref: string;
  isSidebarOpen: boolean;
  onOpenMenu: () => void;
  className?: string;
};

export default function AdminTopbar({ activeHref, isSidebarOpen, onOpenMenu, className }: AdminTopbarProps) {
  const topbarClassName = ["admin-topbar", className].filter(Boolean).join(" ");

  return (
    <header className={topbarClassName}>
      <div className="admin-topbar-start">
        <button
          className="admin-menu-btn"
          type="button"
          onClick={onOpenMenu}
          aria-label="Open admin menu"
          aria-expanded={isSidebarOpen}
        >
          <span />
          <span />
          <span />
        </button>
        <AdminTopbarBrand />
      </div>
      <AdminTopNav activeHref={activeHref} />
      <div className="admin-top-icons">
        <AdminThemeToggle />
      </div>
    </header>
  );
}