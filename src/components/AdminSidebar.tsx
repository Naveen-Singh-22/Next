"use client";

import Link from "next/link";

const adminNavItems = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/rescue", label: "Rescue Management" },
  { href: "/admin/adoption", label: "Adoption Pipeline" },
  { href: "/admin/inventory", label: "Animal Inventory" },
  { href: "/admin/vaccinations", label: "Vaccinations" },
  { href: "/admin/users", label: "User Management" },
  { href: "/admin/inquiry-management", label: "Inquiries" },
] as const;

type AdminSidebarProps = {
  activeHref: string;
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  userRole?: string;
};

export default function AdminSidebar({
  activeHref,
  isOpen,
  onClose,
  userName = "Admin Profile",
  userRole = "Shelter Operations",
}: AdminSidebarProps) {
  return (
    <>
      <aside className={`admin-sidebar admin-mobile-sidebar ${isOpen ? "open" : ""}`.trim()}>
        <div className="admin-brand">
          <Link href="/" className="admin-brand-link" aria-label="thecaninehelp home">
            <img src="/images/logo3.png" alt="thecaninehelp logo" className="admin-brand-logo admin-brand-logo-light" />
            <img src="/images/logo3-dark.png" alt="thecaninehelp logo" className="admin-brand-logo admin-brand-logo-dark" />
            <span className="admin-brand-text">thecaninehelp</span>
          </Link>
          <small>{userRole}</small>
        </div>

        <button className="admin-sidebar-close" type="button" onClick={onClose} aria-label="Close admin menu">
          Close
        </button>

        <nav>
          <ul className="admin-nav">
            {adminNavItems.map((item) => (
              <li key={item.href} className={activeHref === item.href ? "active" : undefined}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <button className="alert-btn" type="button">
          Emergency Alert
        </button>

        <div className="admin-user">
          <span>👩🏽‍💻</span>
          <div>
            <p>{userName}</p>
            <small>{userRole}</small>
          </div>
        </div>
      </aside>

      <div className={`admin-sidebar-backdrop ${isOpen ? "show" : ""}`.trim()} onClick={onClose} aria-hidden={!isOpen} />
    </>
  );
}
