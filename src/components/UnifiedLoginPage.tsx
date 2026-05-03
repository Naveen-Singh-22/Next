"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import SiteNav from "@/components/SiteNav";
import { sanitizeAuthNextPath } from "@/lib/auth";

type LoginResponse = {
  ok?: boolean;
  message?: string;
};

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 2.5 4.5 5.3v5.8c0 5.2 3.2 9.8 7.5 11.4 4.3-1.6 7.5-6.2 7.5-11.4V5.3L12 2.5Zm0 2 5.8 2.2v4.4c0 4.4-2.7 8.3-5.8 9.7-3.2-1.4-5.8-5.3-5.8-9.7V6.7L12 4.5Zm0 2.7a4.8 4.8 0 1 0 4.8 4.8A4.8 4.8 0 0 0 12 7.2Zm0 1.8a3 3 0 1 1-3 3 3 3 0 0 1 3-3Zm0 1.1a1.9 1.9 0 1 0 1.9 1.9 1.9 1.9 0 0 0-1.9-1.9Z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedRole = searchParams.get("role");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const credentials = {
        email,
        password,
        rememberMe,
      };

      if (requestedRole === "admin") {
        const adminResponse = await fetch("/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        });

        const adminPayload = (await adminResponse.json().catch(() => null)) as LoginResponse | null;
        if (!adminResponse.ok || !adminPayload?.ok) {
          setErrorMessage(adminPayload?.message ?? "Invalid email or password.");
          return;
        }

        const nextPath = sanitizeAuthNextPath(searchParams.get("next"), "/admin");
        router.replace(nextPath.startsWith("/admin") ? nextPath : "/admin");
        router.refresh();
        return;
      }

      const adminResponse = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const adminPayload = (await adminResponse.json().catch(() => null)) as LoginResponse | null;
      if (adminResponse.ok && adminPayload?.ok) {
        router.replace("/admin");
        router.refresh();
        return;
      }

      const userResponse = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const userPayload = (await userResponse.json().catch(() => null)) as LoginResponse | null;
      if (!userResponse.ok || !userPayload?.ok) {
        setErrorMessage(userPayload?.message ?? "Invalid email or password.");
        return;
      }

      const nextPath = sanitizeAuthNextPath(searchParams.get("next"), "/profile");
      router.replace(nextPath.startsWith("/admin") ? "/" : nextPath);
      router.refresh();
    } catch {
      setErrorMessage("Something went wrong while signing in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = () => {
    setErrorMessage("Google sign-in is not configured yet. Please use email/password.");
  };

  return (
    <div className="login-page-reference">
      <SiteNav className="login-nav" />

      <main className="login-reference-main" aria-label="Sign in page">
        <section className="login-reference-card" aria-label="Sign in form">
          <h1>Welcome back</h1>
          <p className="login-reference-subtitle">Supporting the journey of every canine friend.</p>

          <button type="button" className="login-reference-google" onClick={handleGoogleSignIn}>
            <span aria-hidden="true" className="login-reference-google-icon">G</span>
            Sign in with Google
          </button>

          <p className="login-reference-divider">or sign in with email</p>

          <form className="login-reference-form" onSubmit={handleSubmit}>
            <label htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <div className="login-reference-password-head">
              <label htmlFor="login-password">Password</label>
              <Link href="/forgot-password">Forgot password?</Link>
            </div>
            <div className="login-reference-password-wrapper">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <button
                type="button"
                className="login-reference-eye-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            <label className="login-reference-check">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
              />
              Keep me signed in
            </label>

            {errorMessage ? <p className="login-error" role="alert">{errorMessage}</p> : null}

            <button type="submit" className="login-reference-submit" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="login-reference-signup">
            New to TheCanineHelp? <Link href="/signup">Create an account</Link>
          </p>
        </section>

        <p className="login-reference-security" aria-label="Security note">
          <ShieldIcon />
          Secure encrypted login
        </p>
      </main>
    </div>
  );
}

export default function UnifiedLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
