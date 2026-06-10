"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import SiteNav from "@/components/SiteNav";

type OtpResponse = {
  ok?: boolean;
  message?: string;
  attemptsRemaining?: number;
};

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
  const searchParams = useSearchParams();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // default to general account. Prefer explicit ?role=... param, otherwise infer from referrer path
  const [role, setRole] = useState(() => {
    const q = searchParams.get("role");
    if (q === "volunteer" || q === "adopter" || q === "donor") return q;
    return "general";
  });

  useEffect(() => {
    // If role provided explicitly in query params, respect it
    const q = searchParams.get("role");
    if (q === "volunteer" || q === "adopter" || q === "donor") {
      setRole(q);
      return;
    }

    // Infer role from referring page path (client-only)
    try {
      const ref = typeof document !== "undefined" ? document.referrer : "";
      if (ref) {
        const url = new URL(ref);
        const path = url.pathname.toLowerCase();
        if (path.includes("/volunteer")) {
          setRole("volunteer");
          return;
        }
        if (path.includes("/adopt") || path.includes("/adoptions") || path.includes("/adopt/")) {
          setRole("adopter");
          return;
        }
      }
    } catch (e) {
      // ignore
    }

    // fallback to general role
    setRole((r) => r || "general");
  }, [searchParams]);
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [signupEmail, setSignupEmail] = useState(""); // For OTP verification
  const [showOtpField, setShowOtpField] = useState(false);
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);

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
          confirmPassword: password,
        }),
      });

      const payload = (await response.json().catch(() => null)) as { ok?: boolean; message?: string; email?: string } | null;
      if (!response.ok || !payload?.ok) {
        setErrorMessage(payload?.message ?? "Failed to create account. Please try again.");
        return;
      }

      // Show OTP field on the same form
      setSignupEmail(email);
      setShowOtpField(true);
    } catch {
      setErrorMessage("Something went wrong while creating your account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    setOtp(digits);
  };

  const handleOtpSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setIsVerifying(true);

    if (otp.length !== 4) {
      setErrorMessage("Please enter a 4-digit verification code.");
      setIsVerifying(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: signupEmail, otp }),
      });

      const payload = (await response.json().catch(() => null)) as OtpResponse | null;

      if (!response.ok || !payload?.ok) {
        setErrorMessage(payload?.message ?? "Verification failed. Please try again.");
        if (payload?.attemptsRemaining !== undefined) {
          setAttemptsRemaining(payload.attemptsRemaining);
        }
        return;
      }

      // Success - redirect to profile
      router.replace("/profile");
      router.refresh();
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setErrorMessage("");

    try {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: signupEmail }),
      });

      const payload = (await response.json().catch(() => null)) as OtpResponse | null;

      if (!response.ok || !payload?.ok) {
        setErrorMessage(payload?.message ?? "Failed to resend code. Please try again.");
        return;
      }

      setOtp("");
      setErrorMessage("");
    } catch {
      setErrorMessage("Failed to resend code. Please try again.");
    }
  };

  const handleGoogleSignUp = () => {
    setErrorMessage("Google sign-up is not configured yet. Please use email/password.");
  };

  if (showOtpField) {
    return (
      <div className="login-page-reference">
        <SiteNav className="login-nav" />

        <main className="login-reference-main" aria-label="Email verification page">
          <section className="login-reference-card" aria-label="Email verification form">
            <h1>Verify Your Email</h1>
            <p className="login-reference-subtitle">We&apos;ve sent a 4-digit code to <strong>{signupEmail}</strong></p>

            <form className="login-reference-form" onSubmit={handleOtpSubmit}>
              <label htmlFor="otp-input">Verification Code</label>
              <input
                id="otp-input"
                type="text"
                inputMode="numeric"
                placeholder="0000"
                value={otp}
                onChange={(e) => handleOtpChange(e.target.value)}
                maxLength={4}
                disabled={isVerifying || attemptsRemaining <= 0}
                required
              />
              <p style={{ fontSize: "12px", color: "#999", margin: "6px 0 0" }}>Enter the 4-digit code</p>

              {errorMessage ? <p className="login-error" role="alert">{errorMessage}</p> : null}

              {attemptsRemaining > 0 && attemptsRemaining < 3 && (
                <p style={{ fontSize: "14px", color: "#666", margin: "8px 0" }}>
                  Attempts remaining: {attemptsRemaining}
                </p>
              )}

              <button 
                type="submit" 
                className="login-reference-submit" 
                disabled={isVerifying || otp.length !== 4 || attemptsRemaining <= 0}
              >
                {isVerifying ? "Verifying..." : "Verify Code"}
              </button>
            </form>

            <div style={{ marginTop: "20px", textAlign: "center" }}>
              <button
                type="button"
                className="login-reference-signup"
                onClick={handleResendOtp}
                style={{ background: "none", border: "none", color: "#8B5CF6", cursor: "pointer", textDecoration: "underline" }}
              >
                Didn&apos;t receive the code? Resend
              </button>
            </div>

            <p style={{ fontSize: "12px", color: "#999", marginTop: "20px", textAlign: "center" }}>
              🔒 Your verification code is secure and expires in 10 minutes.
            </p>
          </section>
        </main>
      </div>
    );
  }

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
              placeholder="Enter your Email "
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            {/* Account type is inferred and hidden from the user */}

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
