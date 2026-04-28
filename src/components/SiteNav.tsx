"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { initializeTheme, setThemePreference, type Theme } from "@/lib/theme";

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
];

// Theme icons replaced by Bootstrap Icons classes

export default function SiteNav({ className = "" }: SiteNavProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme(initializeTheme());

    const onThemeChange = (event: Event) => {
      const customEvent = event as CustomEvent<Theme>;
      if (customEvent.detail === "light" || customEvent.detail === "dark") {
        setTheme(customEvent.detail);
      }
    };

    window.addEventListener("themechange", onThemeChange);
    return () => {
      window.removeEventListener("themechange", onThemeChange);
    };
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle("mobile-menu-open", isOpen);
    return () => {
      document.body.classList.remove("mobile-menu-open");
    };
  }, [isOpen]);

  useEffect(() => {
    document.body.classList.add("site-nav-present");
    return () => {
      document.body.classList.remove("site-nav-present");
    };
  }, []);

  useEffect(() => {
    const updateTopState = () => {
      document.body.classList.toggle("page-at-top", window.scrollY < 20);
    };

    updateTopState();
    window.addEventListener("scroll", updateTopState, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateTopState);
      document.body.classList.remove("page-at-top");
    };
  }, []);

  const handleThemeToggle = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    setThemePreference(nextTheme);
    setTheme(nextTheme);
  };

  const brandLogoSrc = theme === "dark" ? "/images/logo3-dark.png" : "/images/logo3.png";

  return (
    <header className={`top-nav ${className}`.trim()}>
      <div className="top-nav-inner section-wrap">
        <Link className="brand" href="/" aria-label="thecaninehelp home">
          <img src={brandLogoSrc} alt="thecaninehelp logo" className="brand-logo" />
          <span className="brand-text">
            <span className="brand-name">THE CANINE HELP</span>
            <small className="brand-subtitle">RESCUE  CARE  LOVE</small>
          </span>
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
          <button
            className="theme-nav-toggle"
            type="button"
            aria-label="Toggle dark mode"
            aria-pressed={theme === "dark"}
            onClick={handleThemeToggle}
          >
            <i className={`bi ${theme === "dark" ? "bi-sun" : "bi-moon"} theme-nav-icon`} aria-hidden="true" />
            <span className="theme-nav-label">{theme === "dark" ? "Light" : "Dark"}</span>
          </button>
          <Link className="pill-btn solid pill-link" href="/donate">
            Donate
          </Link>
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

        <div className="mobile-theme-toggle-wrap">
          <button
            type="button"
            className="mobile-theme-toggle"
            aria-label="Toggle dark mode"
            aria-pressed={theme === "dark"}
            onClick={handleThemeToggle}
          >
            <span className="mobile-theme-toggle-main">
              <i className={`bi ${theme === "dark" ? "bi-sun" : "bi-moon"} mobile-theme-toggle-icon`} aria-hidden="true" />
              <span className="mobile-theme-toggle-title">Dark mode</span>
            </span>
            <span className="mobile-theme-toggle-value">{theme === "dark" ? "On" : "Off"}</span>
          </button>

          <Link className="mobile-donate-cta" href="/donate" onClick={() => setIsOpen(false)}>
            Donate Now
          </Link>
        </div>
      </aside>
    </header>
  );
}
