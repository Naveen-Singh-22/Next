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

const operationsLinks = [
  { href: "/inventory", label: "Inventory" },
  { href: "/admin", label: "Admin Dashboard" },
  { href: "/admin/adoption/review", label: "Adoption Review" },
  { href: "/admin/inquiry-management", label: "Inquiry Management" },
  { href: "/admin/rescue", label: "Rescue Management" },
  { href: "/admin/shelter-care-logs", label: "Shelter Care Logs" },
  { href: "/admin/vaccinations", label: "Vaccinations" },
];

const socialLinks = [
  { href: "#", label: "Facebook", icon: FacebookIcon },
  { href: "#", label: "X", icon: XIcon },
  { href: "#", label: "Instagram", icon: InstagramIcon },
  { href: "#", label: "LinkedIn", icon: LinkedInIcon },
  { href: "#", label: "YouTube", icon: YouTubeIcon },
];

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5.5 6.5h13a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Zm0 1.7a.3.3 0 0 0-.3.3v.4l6.8 4.6c.6.4 1.4.4 2 0l6.8-4.6v-.4a.3.3 0 0 0-.3-.3h-13Zm13 8.1a.3.3 0 0 0 .3-.3V10l-5.8 3.9a3.2 3.2 0 0 1-3.6 0L5.5 10v6a.3.3 0 0 0 .3.3h13Z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M7.4 4.8h2.2c.5 0 1 .3 1.2.8l1.2 2.8c.2.5.1 1-.2 1.4l-1.3 1.5a12 12 0 0 0 5.2 5.2l1.5-1.3c.4-.3.9-.4 1.4-.2l2.8 1.2c.5.2.8.7.8 1.2v2.2c0 .7-.5 1.2-1.2 1.2C10.5 22 2 13.5 2 5.9c0-.7.5-1.2 1.2-1.2h2.2c.6 0 1.1.4 1.2 1l.4 1.8c.1.5 0 1-.4 1.3L6 9.8a15.4 15.4 0 0 0 4.2 4.2l1-1.1c.3-.4.8-.5 1.3-.4l1.8.4c.6.1 1 .6 1 1.2v2.2Z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M14 8.7h2.1V6.1H14c-2 0-3.4 1.4-3.4 3.6v1.8H8.8v2.6h1.8V18h2.7v-3.9h2.2l.4-2.6h-2.6v-1.5c0-.8.4-1.3 1.3-1.3Z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M6 5h3.2l4.1 5.5L17.8 5H19l-5 6.7L19.5 19h-3.2l-4.4-5.8L7.4 19H5.6l5.4-7.2L6 5Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M7.5 4.5h9A3 3 0 0 1 19.5 7.5v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9a3 3 0 0 1 3-3Zm0 1.8A1.2 1.2 0 0 0 6.3 7.5v9a1.2 1.2 0 0 0 1.2 1.2h9a1.2 1.2 0 0 0 1.2-1.2v-9a1.2 1.2 0 0 0-1.2-1.2h-9Zm4.5 1.7A4.3 4.3 0 1 1 7.7 12a4.3 4.3 0 0 1 4.3-4.3Zm0 1.7A2.6 2.6 0 1 0 14.6 12a2.6 2.6 0 0 0-2.6-2.6Zm4.7-2.1a1 1 0 1 1-1 1 1 1 0 0 1 1-1Z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M6.3 9.3H4V18h2.3V9.3ZM5.1 5.2a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6Zm8.5 4.2c-1.2 0-2 .6-2.4 1.2V9.3H9V18h2.2v-4.7c0-1.2.5-2 1.6-2 1 0 1.6.7 1.6 2V18h2.2v-4.9c0-2.4-1.4-3.7-3-3.7Z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M19.6 7.3a2.1 2.1 0 0 0-1.5-1.5C16.7 5.5 12 5.5 12 5.5s-4.7 0-6.1.3a2.1 2.1 0 0 0-1.5 1.5A22.1 22.1 0 0 0 4.1 12a22.1 22.1 0 0 0 .3 4.7 2.1 2.1 0 0 0 1.5 1.5c1.4.3 6.1.3 6.1.3s4.7 0 6.1-.3a2.1 2.1 0 0 0 1.5-1.5 22.1 22.1 0 0 0 .3-4.7 22.1 22.1 0 0 0-.3-4.7Zm-9.2 7.5V9.2L15 12l-4.6 2.8Z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M20 12a8 8 0 0 1-11.9 7l-4 1 1.1-3.9A8 8 0 1 1 20 12Zm-8-6.5a6.5 6.5 0 0 0-5.7 9.6l.2.3-.7 2.4 2.5-.6.2.1A6.5 6.5 0 1 0 12 5.5Zm3.6 8.3c-.2-.1-1.2-.6-1.4-.7-.2-.1-.3-.1-.5.1l-.4.5c-.1.1-.2.2-.4.1-.2-.1-.8-.3-1.5-.9-.6-.5-.9-1.1-1-1.3-.1-.2 0-.3.1-.4l.3-.3.2-.3c.1-.1.1-.3 0-.4 0-.1-.5-1.2-.7-1.6-.2-.4-.3-.3-.5-.3h-.4c-.1 0-.4.1-.5.3-.2.2-.7.7-.7 1.8 0 1 .7 2.1.8 2.2.1.1 1.4 2.2 3.4 3 .5.2 1 .4 1.3.5.6.2 1.2.1 1.6.1.5-.1 1.2-.5 1.4-.9.2-.4.2-.8.2-.9 0-.1-.1-.2-.3-.3Z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M6.2 5.2 12 11l5.8-5.8 1 1L13 12l5.8 5.8-1 1L12 13l-5.8 5.8-1-1L11 12 5.2 6.2l1-1Z" />
    </svg>
  );
}

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
                    <item.icon />
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <FooterLinkGroup title="Explore" links={exploreLinks} />
          <FooterLinkGroup title="Get Involved" links={getInvolvedLinks} />
          <FooterLinkGroup title="Operations" links={operationsLinks} />
        </div>

        <div className="site-footer-divider section-wrap" />

        <div className="section-wrap site-footer-contact" id="contact">
          <a href="mailto:help@thecaninehelp.org" aria-label="Email TheCanineHelp">
            <span className="site-footer-contact-icon" aria-hidden="true">
              <MailIcon />
            </span>
            <span>help@thecaninehelp.org</span>
          </a>
          <a href="tel:+919663577758" aria-label="Call TheCanineHelp">
            <span className="site-footer-contact-icon" aria-hidden="true">
              <PhoneIcon />
            </span>
            <span>+91-9663577758</span>
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
          <span aria-hidden="true">
            <WhatsAppIcon />
          </span>
        </button>
      </div>

      {isWhatsAppOpen ? (
        <div className="whatsapp-popup" role="dialog" aria-label="WhatsApp chat preview" aria-modal="false">
          <div className="whatsapp-popup-header">
            <div className="whatsapp-popup-brand">
              <span className="whatsapp-popup-icon" aria-hidden="true">
                <WhatsAppIcon />
              </span>
              <span>WhatsApp</span>
            </div>
            <button
              type="button"
              className="whatsapp-popup-close"
              aria-label="Close WhatsApp popup"
              onClick={() => setIsWhatsAppOpen(false)}
            >
              <CloseIcon />
            </button>
          </div>
          <div className="whatsapp-popup-body">
            <p className="whatsapp-popup-message">Hello, Welcome to TheCanineHelp</p>
            <a
              className="whatsapp-popup-open"
              href="https://wa.me/919663577758?text=Hello%2C%20I%20would%20like%20to%20connect%20with%20TheCanineHelp"
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
