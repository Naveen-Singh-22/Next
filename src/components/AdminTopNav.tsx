import Link from "next/link";

type AdminTopNavProps = {
  activeHref: string;
};

const ADMIN_NAV_ITEMS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/rescue", label: "Rescue Management" },
  { href: "/admin/adoption", label: "Adoption Pipeline" },
  { href: "/admin/inventory", label: "Animal Inventory" },
  { href: "/admin/vaccinations", label: "Vaccinations" },
  { href: "/admin/inquiry-management", label: "Inquiries" },
] as const;

export default function AdminTopNav({ activeHref }: AdminTopNavProps) {
  return (
    <nav className="admin-top-nav" aria-label="Admin navigation">
      {ADMIN_NAV_ITEMS.map((item) => {
        const isActive = activeHref === item.href;
        return (
          <Link key={item.href} href={item.href} className={isActive ? "active" : undefined} aria-current={isActive ? "page" : undefined}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
