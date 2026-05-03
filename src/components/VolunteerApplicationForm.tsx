"use client";

import { FormEvent, useState } from "react";
import { ensureLoggedIn } from "@/lib/authClient";

type SubmitState = "idle" | "success" | "error";

type VolunteerFormData = {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  interestArea: string;
  availability: string;
};

type VolunteerApiResponse = {
  ok?: boolean;
  message?: string;
};

const INITIAL_FORM: VolunteerFormData = {
  fullName: "",
  email: "",
  phone: "",
  city: "",
  interestArea: "Shelter Assistant",
  availability: "",
};

export default function VolunteerApplicationForm() {
  const [formData, setFormData] = useState<VolunteerFormData>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");

  function updateField<K extends keyof VolunteerFormData>(key: K, value: VolunteerFormData[K]) {
    setFormData((previous) => ({ ...previous, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!(await ensureLoggedIn("/volunteer", "volunteer"))) {
      return;
    }

    const payload = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      city: formData.city.trim(),
      interestArea: formData.interestArea,
      availability: formData.availability.trim(),
    };

    if (
      !payload.fullName ||
      !payload.email ||
      !payload.phone ||
      !payload.city ||
      !payload.interestArea ||
      !payload.availability
    ) {
      setSubmitState("error");
      setMessage("Please complete all required fields before submitting.");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitState("idle");
      setMessage("");

      const response = await fetch("/api/volunteer/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as VolunteerApiResponse;

      if (!response.ok || !result.ok) {
        setSubmitState("error");
        setMessage(result.message ?? "Unable to submit your application. Please try again.");
        return;
      }

      setSubmitState("success");
      setMessage(result.message ?? "Application submitted successfully.");
      setFormData(INITIAL_FORM);
    } catch {
      setSubmitState("error");
      setMessage("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <form className="volunteer-form" onSubmit={handleSubmit} noValidate>
        <div className="field-grid">
          <label>
            Full Name
            <input
              placeholder="John Doe"
              type="text"
              value={formData.fullName}
              onChange={(event) => updateField("fullName", event.target.value)}
              autoComplete="name"
              required
            />
          </label>
          <label>
            Email Address
            <input
              placeholder="john@example.com"
              type="email"
              value={formData.email}
              onChange={(event) => updateField("email", event.target.value)}
              autoComplete="email"
              required
            />
          </label>
        </div>

        <div className="field-grid">
          <label>
            Phone Number
            <input
              placeholder="+1 (555) 000-0000"
              type="tel"
              value={formData.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              autoComplete="tel"
              required
            />
          </label>
          <label>
            City
            <input
              placeholder="San Francisco"
              type="text"
              value={formData.city}
              onChange={(event) => updateField("city", event.target.value)}
              autoComplete="address-level2"
              required
            />
          </label>
        </div>

        <label>
          Interest Area
          <select
            value={formData.interestArea}
            onChange={(event) => updateField("interestArea", event.target.value)}
            required
          >
            <option>Shelter Assistant</option>
            <option>Rescue Dispatcher</option>
            <option>Event Support</option>
          </select>
        </label>

        <label>
          Availability
          <textarea
            rows={4}
            placeholder="Tell us which days and times work best for you..."
            value={formData.availability}
            onChange={(event) => updateField("availability", event.target.value)}
            required
          />
        </label>

        <button className="submit-btn" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Application"}
        </button>
      </form>

      {message ? (
        <p
          className={`volunteer-form-status ${
            submitState === "success" ? "volunteer-form-status-success" : "volunteer-form-status-error"
          }`}
          role="status"
          aria-live="polite"
        >
          {message}
        </p>
      ) : null}
    </>
  );
}
