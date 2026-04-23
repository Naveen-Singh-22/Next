"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 2.5 4.5 5.3v5.8c0 5.2 3.2 9.8 7.5 11.4 4.3-1.6 7.5-6.2 7.5-11.4V5.3L12 2.5Zm0 2 5.8 2.2v4.4c0 4.4-2.7 8.3-5.8 9.7-3.2-1.4-5.8-5.3-5.8-9.7V6.7L12 4.5Zm0 2.7a4.8 4.8 0 1 0 4.8 4.8A4.8 4.8 0 0 0 12 7.2Zm0 1.8a3 3 0 1 1-3 3 3 3 0 0 1 3-3Zm0 1.1a1.9 1.9 0 1 0 1.9 1.9 1.9 1.9 0 0 0-1.9-1.9Z" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4.6 6.5h14.8a1.6 1.6 0 0 1 1.6 1.6v7.8a1.6 1.6 0 0 1-1.6 1.6H4.6A1.6 1.6 0 0 1 3 15.9V8.1a1.6 1.6 0 0 1 1.6-1.6Zm.2 2v.3l6.7 4.4a1 1 0 0 0 1 0l6.7-4.4v-.3H4.8Zm14.6 7.2V10l-5.8 3.8a2.9 2.9 0 0 1-3.2 0L4.6 10v5.7h14.8Z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 2.8a4.2 4.2 0 0 0-4.2 4.2v1.8H6.5A1.5 1.5 0 0 0 5 10.3v8.9a1.5 1.5 0 0 0 1.5 1.5h11a1.5 1.5 0 0 0 1.5-1.5v-8.9a1.5 1.5 0 0 0-1.5-1.5h-1.3V7A4.2 4.2 0 0 0 12 2.8Zm-2.4 6V7A2.4 2.4 0 1 1 14.4 7v1.8H9.6Zm2.4 3.2a1.9 1.9 0 0 0-1 3.6v1.5h2v-1.5a1.9 1.9 0 0 0-1-3.6Z" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5A8.5 8.5 0 0 0 12 3.5Zm0 2a6.5 6.5 0 1 1-6.5 6.5A6.5 6.5 0 0 1 12 5.5Zm-.1 2.3a1.1 1.1 0 1 0 1.1 1.1 1.1 1.1 0 0 0-1.1-1.1Zm-1 4.1v1.2h.5v3h2.2V15h-.7v-3.1Z" />
    </svg>
  );
}

function sanitizeNextPath(nextPath: string | null): string {
  if (!nextPath || !nextPath.startsWith("/admin") || nextPath.startsWith("/admin/login")) {
    return "/admin";
  }

  return nextPath;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const safeNextPath = useMemo(
    () => sanitizeNextPath(searchParams.get("next")),
    [searchParams],
  );

  const [email, setEmail] = useState("admin@editorialcompassion.org");
  const [password, setPassword] = useState("admin123");
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          rememberMe,
        }),
      });

      const payload = (await response.json()) as { ok?: boolean; message?: string };

      if (!response.ok || !payload.ok) {
        setErrorMessage(payload.message ?? "Unable to sign in. Please try again.");
        return;
      }

      router.replace(safeNextPath);
      router.refresh();
    } catch {
      setErrorMessage("Something went wrong while signing in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-access-page">
      <header className="admin-access-topbar" aria-label="Admin login navigation">
        <div className="admin-access-brand">
          <p>thecaninehelp</p>
          <small>Shelter Operations</small>
        </div>
        <Link href="/" className="admin-access-backlink">
          Back to Website
          <span aria-hidden="true" className="admin-access-backdot">
            <ShieldIcon />
          </span>
        </Link>
      </header>

      <main className="admin-access-main">
        <section className="admin-access-hero" aria-label="Welcome summary">
          <h1>
            Welcome Back,
            <span>Admin</span>
          </h1>
          <p>
            Your dedication ensures that every animal in our care finds the
            compassion and editorial voice they deserve. Thank you for your
            continued service.
          </p>

          <div className="admin-access-kpi-grid" role="list" aria-label="Key admin statistics">
            <article className="admin-access-kpi" role="listitem">
              <strong>12</strong>
              <small>PENDING RESCUES</small>
            </article>
            <article className="admin-access-kpi" role="listitem">
              <strong>5</strong>
              <small>VACCINATIONS DUE</small>
            </article>
          </div>

          <p className="admin-access-status">
            <span aria-hidden="true">
              <InfoIcon />
            </span>
            System status: All services operational. Next scheduled maintenance in 48 hours.
          </p>
        </section>

        <section className="admin-access-auth" aria-label="Admin sign in">
          <section className="admin-login-card" aria-label="Admin login form">
            <span className="admin-login-badge" aria-hidden="true">
              <ShieldIcon />
            </span>

            <h1>Admin Access</h1>
            <p>Secure Administrative Gateway</p>

            <form className="admin-login-form" onSubmit={onSubmit}>
              <label htmlFor="admin-email">Email Address</label>
              <div className="admin-login-input-wrap">
                <span aria-hidden="true">
                  <EmailIcon />
                </span>
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@editorialcompassion.org"
                  required
                />
              </div>

              <label htmlFor="admin-password">Password</label>
              <div className="admin-login-input-wrap">
                <span aria-hidden="true">
                  <LockIcon />
                </span>
                <input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>

              <div className="admin-login-meta-row">
                <label className="admin-login-check">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                  />
                  Remember me
                </label>
                <a href="#" aria-disabled="true" onClick={(event) => event.preventDefault()}>
                  Forgot Password?
                </a>
              </div>

              {errorMessage ? <p className="admin-login-error">{errorMessage}</p> : null}

              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Signing In..." : "Sign In to Dashboard"}
                <span aria-hidden="true">→</span>
              </button>
            </form>

            <Link href="/" className="admin-login-secondary-link">
              Back to Website
            </Link>
          </section>

          <aside className="admin-login-security-note" aria-label="Security notice">
            <span aria-hidden="true">
              <ShieldIcon />
            </span>
            <p>
              This is a restricted area. All access attempts are logged and monitored for
              security purposes. Unauthorized access is strictly prohibited.
            </p>
          </aside>
        </section>
      </main>

      <footer className="admin-access-footer">
        <div>
          <small>© 2024 thecaninehelp. Secure Administrative Gateway.</small>
          <nav aria-label="Administrative footer links">
            <Link href="/">Privacy Policy</Link>
            <Link href="/">Terms of Service</Link>
            <Link href="/">Security Audit</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
