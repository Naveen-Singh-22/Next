"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type SiteNavProps = {
  className?: string;
};

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/impact", label: "Impact" },
  { href: "/adopt", label: "Adopt" },
  { href: "/volunteer", label: "Volunteer" },
  { href: "/rescue", label: "Rescue Form" },
  { href: "/admin", label: "Admin" },
];

export default function SiteNav({ className = "" }: SiteNavProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <header className={`top-nav section-wrap ${className}`.trim()}>
      <Link className="brand" href="/">
        thecaninehelp
      </Link>

      <nav aria-label="Main navigation" className="desktop-nav">
        <ul className="menu-list">
          {NAV_LINKS.map((item) => {
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={isActive ? "active-link" : undefined}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="nav-actions">
        <button className="pill-btn solid" type="button">
          Donate
        </button>
        <button
          className="nav-toggle"
          type="button"
          aria-label="Open menu"
          aria-expanded={isOpen}
          aria-controls="mobile-drawer"
          onClick={() => setIsOpen(true)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div
        className={`mobile-backdrop ${isOpen ? "show" : ""}`.trim()}
        onClick={() => setIsOpen(false)}
        aria-hidden={!isOpen}
      />

      <aside
        id="mobile-drawer"
        className={`mobile-drawer ${isOpen ? "show" : ""}`.trim()}
        aria-hidden={!isOpen}
      >
        <div className="mobile-drawer-head">
          <p>Menu</p>
          <button
            type="button"
            className="drawer-close"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          >
            Close
          </button>
        </div>

        <ul className="mobile-menu-list">
          {NAV_LINKS.map((item) => {
            const isActive = pathname === item.href;

            return (
              <li key={`${item.href}-mobile`}>
                <Link
                  href={item.href}
                  className={isActive ? "active-link" : undefined}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </aside>
    </header>
  );
}
