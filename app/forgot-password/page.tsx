"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import SiteNav from "@/components/SiteNav";

type ForgotPasswordResponse = {
  ok?: boolean;
  message?: string;
  resetUrl?: string;
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const payload = (await response.json().catch(() => null)) as ForgotPasswordResponse | null;
      if (!response.ok || !payload?.ok) {
        setError(payload?.message ?? "Failed to request password reset.");
        return;
      }

      setMessage(payload.message ?? "If an account exists for that email, we sent a reset link.");

      if (payload.resetUrl) {
        setMessage(`${payload.message ?? "Reset link generated."} Local test link: ${payload.resetUrl}`);
      }
    } catch {
      setError("Something went wrong while requesting a reset link.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page-reference">
      <SiteNav className="login-nav" />
      <main className="login-reference-main" aria-label="Forgot password page">
        <section className="login-reference-card" aria-label="Forgot password form">
          <h1>Reset your password</h1>
          <p className="login-reference-subtitle">Enter your email address and we&apos;ll send you a reset link.</p>

          <form className="login-reference-form" onSubmit={handleSubmit}>
            <label htmlFor="forgot-email">Email address</label>
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              placeholder="Enter your Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            {error ? <p className="login-error" role="alert">{error}</p> : null}
            {message ? <p className="login-reference-subtitle">{message}</p> : null}

            <button type="submit" className="login-reference-submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send reset link"}
            </button>
          </form>

          <p className="login-reference-signup">
            Back to <Link href="/login">sign in</Link>
          </p>
        </section>
      </main>
    </div>
  );
}