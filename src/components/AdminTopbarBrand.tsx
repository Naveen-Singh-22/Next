import Link from "next/link";

export default function AdminTopbarBrand() {
  return (
    <Link href="/admin" className="admin-topbar-brand" aria-label="thecaninehelp admin home">
      <img src="/images/logo3.png" alt="thecaninehelp logo" className="admin-topbar-logo admin-topbar-logo-light" />
      <img src="/images/logo3-dark.png" alt="thecaninehelp logo" className="admin-topbar-logo admin-topbar-logo-dark" />
      <span className="admin-topbar-text">
        <span className="admin-topbar-name">thecaninehelp</span>
        <span className="admin-topbar-subtitle">Rescue Care Love</span>
      </span>
    </Link>
  );
}
