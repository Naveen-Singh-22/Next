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

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M14.9 3.8a8.8 8.8 0 1 0 5.3 15.8A9 9 0 0 1 12.3 4a9 9 0 0 1 2.6-.2Z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 7.2A4.8 4.8 0 1 0 16.8 12 4.8 4.8 0 0 0 12 7.2Zm0-4.2a.9.9 0 0 1 .9.9v1.4a.9.9 0 1 1-1.8 0V3.9A.9.9 0 0 1 12 3Zm0 15.8a.9.9 0 0 1 .9.9v1.4a.9.9 0 1 1-1.8 0v-1.4a.9.9 0 0 1 .9-.9ZM4 11.1h1.4a.9.9 0 1 1 0 1.8H4a.9.9 0 1 1 0-1.8Zm14.6 0H20a.9.9 0 1 1 0 1.8h-1.4a.9.9 0 1 1 0-1.8ZM6.2 5l1 1a.9.9 0 0 1-1.3 1.3l-1-1A.9.9 0 0 1 6.2 5Zm11.6 11.6 1 1a.9.9 0 1 1-1.3 1.3l-1-1a.9.9 0 1 1 1.3-1.3ZM6.2 19a.9.9 0 0 1-1.3-1.3l1-1a.9.9 0 0 1 1.3 1.3l-1 1Zm11.6-11.6a.9.9 0 0 1-1.3-1.3l1-1a.9.9 0 0 1 1.3 1.3l-1 1Z" />
    </svg>
  );
}

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

  return (
    <header className={`top-nav ${className}`.trim()}>
      <div className="top-nav-inner section-wrap">
        <Link className="brand" href="/">
          <span>thecaninehelp</span>
          <small className="brand-subtitle">Shelter Operations</small>
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
            <span className="theme-nav-icon" aria-hidden="true">
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </span>
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
              <span className="mobile-theme-toggle-icon" aria-hidden="true">
                {theme === "dark" ? <SunIcon /> : <MoonIcon />}
              </span>
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
