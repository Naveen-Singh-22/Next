"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import SiteNav from "@/components/SiteNav";

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

function SignupContent() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    if (!agreeTerms) {
      setErrorMessage("Please agree to the Terms of Service and Privacy Policy");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          email,
          password,
        }),
      });

      const payload = (await response.json().catch(() => null)) as { ok?: boolean; message?: string } | null;
      if (!response.ok || !payload?.ok) {
        setErrorMessage(payload?.message ?? "Failed to create account. Please try again.");
        return;
      }

      router.replace("/profile");
      router.refresh();
    } catch {
      setErrorMessage("Something went wrong while creating your account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = () => {
    setErrorMessage("Google sign-up is not configured yet. Please use email/password.");
  };

  return (
    <div className="login-page-reference">
      <SiteNav className="login-nav" />

      <main className="login-reference-main" aria-label="Sign up page">
        <section className="login-reference-card" aria-label="Sign up form">
          <h1>Join our mission</h1>
          <p className="login-reference-subtitle">Create an account to support our rescue and adoption efforts.</p>

          <button type="button" className="login-reference-google" onClick={handleGoogleSignUp}>
            <span aria-hidden="true" className="login-reference-google-icon">G</span>
            Sign up with Google
          </button>

          <p className="login-reference-divider">or sign up with email</p>

          <form className="login-reference-form" onSubmit={handleSubmit}>
            <label htmlFor="signup-fullname">Full Name</label>
            <input
              id="signup-fullname"
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
            />

            <label htmlFor="signup-email">Email address</label>
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <div className="login-reference-password-head">
              <label htmlFor="signup-password">Password</label>
            </div>
            <div className="login-reference-password-wrapper">
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Create a strong password"
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
                checked={agreeTerms}
                onChange={(event) => setAgreeTerms(event.target.checked)}
              />
              I agree to the{" "}
              <Link href="/terms">Terms of Service</Link>
              {" "}and{" "}
              <Link href="/privacy">Privacy Policy</Link>
            </label>

            {errorMessage ? <p className="login-error" role="alert">{errorMessage}</p> : null}

            <button type="submit" className="login-reference-submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="login-reference-signup">
            Already have an account? <Link href="/login">Sign In</Link>
          </p>
        </section>
      </main>
    </div>
  );
}

export default function SignupForm() {
  return (
    <Suspense fallback={null}>
      <SignupContent />
    </Suspense>
  );
}
