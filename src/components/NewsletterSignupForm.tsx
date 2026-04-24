"use client";

import { FormEvent, useState } from "react";

type SubmitState = "idle" | "success" | "error";

type NewsletterSignupFormProps = {
  wrapperClassName?: string;
  formClassName?: string;
  inputClassName?: string;
  buttonClassName?: string;
  inputPlaceholder?: string;
  inputAriaLabel?: string;
};

export default function NewsletterSignupForm({
  wrapperClassName = "homev2-newsletter-form-wrap",
  formClassName,
  inputClassName,
  buttonClassName,
  inputPlaceholder = "Enter your email address",
  inputAriaLabel = "Email address",
}: NewsletterSignupFormProps) {
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
    <div className={wrapperClassName}>
      <form onSubmit={handleSubmit} className={formClassName}>
        <input
          type="email"
          placeholder={inputPlaceholder}
          aria-label={inputAriaLabel}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={inputClassName}
          required
        />
        <button type="submit" disabled={isSubmitting} className={buttonClassName}>
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
