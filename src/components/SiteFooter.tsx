"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const exploreLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/impact", label: "Impact" },
  { href: "/adopt", label: "Adopt" },
];

const getInvolvedLinks = [
  { href: "/volunteer", label: "Volunteer" },
  { href: "/rescue", label: "Rescue Form" },
  { href: "/donate", label: "Donate" },
  { href: "#contact", label: "Contact" },
];

const resourcesLinks = [
  { href: "/impact", label: "Success Stories" },
  { href: "/adopt", label: "Adoption Guide" },
  { href: "/rescue", label: "Emergency Rescue Help" },
  { href: "/impact", label: "Where Donations Go" },
];

const socialLinks = [
  { href: "https://www.facebook.com/thecaninehelp", label: "Facebook", icon: "facebook" },
  { href: "https://www.instagram.com/thecaninehelp/", label: "Instagram", icon: "instagram" },
  { href: "https://www.linkedin.com/company/thecaninehelp", label: "LinkedIn", icon: "linkedin" },
  { href: "https://www.youtube.com/@TheCanineHelpindore", label: "YouTube", icon: "youtube" },
];

// Replaced inline SVG icon helpers with Bootstrap Icon CSS classes.

function FooterLinkGroup({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <section>
      <h2 className="site-footer-title">{title}</h2>
      <ul className="site-footer-links">
        {links.map((item) => (
          <li key={item.label}>
            <Link href={item.href}>{item.label}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function SiteFooter() {
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsWhatsAppOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <footer className="site-footer" aria-label="Footer">
      <div className="site-footer-top-strip" aria-hidden="true" />

      <div className="site-footer-main">
        <div className="section-wrap site-footer-grid">
          <section className="site-footer-brand" aria-label="Brand information">
            <h2>THECANINEHELP</h2>
            <p>
              TheCanineHelp is a rescue-first platform dedicated to transforming
              animal care through modern advocacy and direct operational support.
            </p>
            <ul className="site-footer-social" aria-label="Social media links">
              {socialLinks.map((item) => (
                <li key={item.label}>
                  <a href={item.href} aria-label={item.label}>
                    <i className={`bi bi-${item.icon}`} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <FooterLinkGroup title="Explore" links={exploreLinks} />
          <FooterLinkGroup title="Get Involved" links={getInvolvedLinks} />
          <FooterLinkGroup title="Resources" links={resourcesLinks} />
        </div>

        <div className="site-footer-divider section-wrap" />

        <div className="section-wrap site-footer-contact" id="contact">
          <a href="mailto:help@thecaninehelp.org" aria-label="Email TheCanineHelp">
            <i className="bi bi-envelope site-footer-contact-icon" aria-hidden="true" />
            <span>help@thecaninehelp.org</span>
          </a>
          <a href="tel:+917460456575" aria-label="Call TheCanineHelp">
            <i className="bi bi-telephone site-footer-contact-icon" aria-hidden="true" />
            <span>+91-98939 08123</span>
          </a>
        </div>

        <div className="site-footer-divider section-wrap" />

        <p className="site-footer-copyright">
          © 2026 TheCanineHelp. All rights reserved.
        </p>
      </div>

        <div className="site-footer-fab-stack" aria-label="Floating actions">
        <a className="site-footer-fab site-footer-fab-top" href="#top" aria-label="Scroll to top">
          <span aria-hidden="true">↑</span>
        </a>
        <button
          type="button"
          className="site-footer-fab site-footer-fab-chat"
          aria-label="Open WhatsApp chat"
          aria-expanded={isWhatsAppOpen}
          onClick={() => setIsWhatsAppOpen((value) => !value)}
        >
            <i className="bi bi-whatsapp" aria-hidden="true" />
        </button>
      </div>

      {isWhatsAppOpen ? (
        <div className="whatsapp-popup" role="dialog" aria-label="WhatsApp chat preview" aria-modal="false">
          <div className="whatsapp-popup-header">
            <div className="whatsapp-popup-brand">
              <i className="bi bi-whatsapp whatsapp-popup-icon" aria-hidden="true" />
              <span>WhatsApp</span>
            </div>
            <button
              type="button"
              className="whatsapp-popup-close"
              aria-label="Close WhatsApp popup"
              onClick={() => setIsWhatsAppOpen(false)}
            >
              <i className="bi bi-x" aria-hidden="true" />
            </button>
          </div>
          <div className="whatsapp-popup-body">
            <p className="whatsapp-popup-message">Hello, Welcome to TheCanineHelp</p>
            <a
              className="whatsapp-popup-open"
              href="https://wa.me/98939 08123?text=Hello%2C%20I%20would%20like%20to%20connect%20with%20TheCanineHelp"
              target="_blank"
              rel="noreferrer"
            >
              Open Chat <span aria-hidden="true">›</span>
            </a>
            <small className="whatsapp-popup-meta">Typically replies in minutes</small>
          </div>
        </div>
      ) : null}
    </footer>
  );
}
