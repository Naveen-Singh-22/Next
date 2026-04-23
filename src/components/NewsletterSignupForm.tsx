"use client";

import { FormEvent, useState } from "react";

type SubmitState = "idle" | "success" | "error";

export default function NewsletterSignupForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setSubmitState("error");
      setMessage("Please enter your email address.");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitState("idle");
      setMessage("");

      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const payload = (await response.json()) as { ok?: boolean; message?: string };

      if (!response.ok || !payload.ok) {
        setSubmitState("error");
        setMessage(payload.message ?? "Subscription failed. Please try again.");
        return;
      }

      setSubmitState("success");
      setMessage(payload.message ?? "You are subscribed. Thank you!");
      setEmail("");
    } catch {
      setSubmitState("error");
      setMessage("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="homev2-newsletter-form-wrap">
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email address"
          aria-label="Email address"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Subscribing..." : "Subscribe"}
        </button>
      </form>
      {message ? (
        <p
          className={`homev2-newsletter-status ${
            submitState === "success" ? "homev2-newsletter-status-success" : "homev2-newsletter-status-error"
          }`}
          role="status"
          aria-live="polite"
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
