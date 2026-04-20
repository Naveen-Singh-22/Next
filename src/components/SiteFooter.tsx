import Link from "next/link";

const exploreLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/impact", label: "Impact" },
  { href: "/adopt", label: "Adopt" },
];

const getInvolvedLinks = [
  { href: "/volunteer", label: "Volunteer" },
  { href: "/rescue", label: "Rescue Form" },
  { href: "#donate", label: "Donate" },
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
  { href: "#", label: "Facebook", short: "f" },
  { href: "#", label: "X", short: "x" },
  { href: "#", label: "Instagram", short: "ig" },
  { href: "#", label: "LinkedIn", short: "in" },
  { href: "#", label: "YouTube", short: "yt" },
];

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
                    <span aria-hidden="true">{item.short}</span>
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
              @
            </span>
            <span>help@thecaninehelp.org</span>
          </a>
          <a href="tel:+919663577758" aria-label="Call TheCanineHelp">
            <span className="site-footer-contact-icon" aria-hidden="true">
              tel
            </span>
            <span>+91-9663577758</span>
          </a>
        </div>

        <div className="site-footer-divider section-wrap" />

        <p className="site-footer-copyright">
          © 2026 TheCanineHelp. All rights reserved.
        </p>
      </div>

      <a className="site-footer-fab site-footer-fab-chat" href="#contact" aria-label="Chat on WhatsApp">
        <span aria-hidden="true">WA</span>
      </a>
      <a className="site-footer-fab site-footer-fab-top" href="#top" aria-label="Scroll to top">
        <span aria-hidden="true">^</span>
      </a>
    </footer>
  );
}
