"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import SiteNav from "@/components/SiteNav";

type ResetPasswordResponse = {
  ok?: boolean;
  message?: string;
};

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get("email") ?? "";
  const tokenFromQuery = searchParams.get("token") ?? "";

  const [email, setEmail] = useState(emailFromQuery);
  const [token, setToken] = useState(tokenFromQuery);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password, confirmPassword }),
      });

      const payload = (await response.json().catch(() => null)) as ResetPasswordResponse | null;
      if (!response.ok || !payload?.ok) {
        setError(payload?.message ?? "Failed to reset password.");
        return;
      }

      setMessage(payload.message ?? "Password updated successfully.");
      router.replace("/login");
    } catch {
      setError("Something went wrong while resetting your password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page-reference">
      <SiteNav className="login-nav" />
      <main className="login-reference-main" aria-label="Reset password page">
        <section className="login-reference-card" aria-label="Reset password form">
          <h1>Create a new password</h1>
          <p className="login-reference-subtitle">Use the reset link from your email to finish updating your password.</p>

          <form className="login-reference-form" onSubmit={handleSubmit}>
            <label htmlFor="reset-email">Email address</label>
            <input id="reset-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />

            <label htmlFor="reset-token">Reset token</label>
            <input id="reset-token" type="text" value={token} onChange={(event) => setToken(event.target.value)} required />

            <label htmlFor="reset-password">New password</label>
            <input id="reset-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />

            <label htmlFor="reset-confirm-password">Confirm password</label>
            <input id="reset-confirm-password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />

            {error ? <p className="login-error" role="alert">{error}</p> : null}
            {message ? <p className="login-reference-subtitle">{message}</p> : null}

            <button type="submit" className="login-reference-submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Reset password"}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}