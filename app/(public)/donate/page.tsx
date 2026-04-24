"use client";

import { FormEvent, useMemo, useState } from "react";
import SiteNav from "@/components/SiteNav";
import ScrollReveal from "@/components/ScrollReveal";

const reasons = [
  {
    title: "Rescue Operations",
    text: "Funds emergency transport, on-site response, and field rescues for animals in immediate danger.",
  },
  {
    title: "Medical Care",
    text: "Supports surgeries, diagnostics, vaccinations, and rehabilitation for fragile and injured animals.",
  },
  {
    title: "Shelter Upkeep",
    text: "Maintains safe, clean shelter environments with food, utilities, and daily care resources.",
  },
];

const suggestedAmounts = [499, 999, 1999, 4999];

const formatInr = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

export default function DonatePage() {
  const [selectedAmount, setSelectedAmount] = useState<number>(suggestedAmounts[1]);
  const [customAmount, setCustomAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const finalAmount = useMemo(() => {
    if (customAmount.trim()) {
      const parsed = Number(customAmount);

      if (Number.isFinite(parsed) && parsed > 0) {
        return Math.round(parsed);
      }
    }

    return selectedAmount;
  }, [customAmount, selectedAmount]);

  async function handleDonate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!Number.isFinite(finalAmount) || finalAmount <= 0) {
      setStatusMessage("Please select a valid donation amount in rupees.");
      return;
    }

    setIsSubmitting(true);
    setStatusMessage("");

    try {
      await new Promise((resolve) => {
        window.setTimeout(resolve, 900);
      });

      setStatusMessage(
        `Thank you for your donation of ${formatInr(finalAmount)}. Your support helps rescued animals receive care quickly.`,
      );
      setCustomAmount("");
    } catch {
      setStatusMessage("We could not process your donation right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="donate-page">
      <SiteNav />

      <main className="section-wrap donate-main">
        <header className="donate-hero donate-fade-in">
          <h1>Support Our Mission</h1>
          <p>
            Your generosity helps us rescue, heal, and rehome animals in need.
            Choose an amount below and stand with our rescue teams.
          </p>
        </header>

        <section className="donate-grid donate-fade-in" aria-label="Donation details">
          <ScrollReveal as="article" className="donate-info-card" delayMs={40}>
            <h2>Why Donate?</h2>
            <ul className="donate-reason-list">
              {reasons.map((reason) => (
                <li key={reason.title}>
                  <h3>{reason.title}</h3>
                  <p>{reason.text}</p>
                </li>
              ))}
            </ul>

            <figure className="donate-photo-card">
              <img
                src="/images/unsplash/05.jpg"
                alt="Two rescued dogs"
                loading="lazy"
              />
              <figcaption>Over 1,200 animals successfully rehomed last year.</figcaption>
            </figure>
          </ScrollReveal>

          <ScrollReveal as="article" className="donate-form-card" delayMs={120}>
            <h2>Make a Donation</h2>
            <form className="donate-form" onSubmit={handleDonate}>
              <div className="donate-form-grid">
                <label>
                  Full Name
                  <input type="text" name="name" placeholder="Jane Doe" required />
                </label>
                <label>
                  Email Address
                  <input type="email" name="email" placeholder="jane@example.com" required />
                </label>
              </div>

              <label>
                Phone Number
                <input type="tel" name="phone" placeholder="+91 98765 43210" />
              </label>

              <div className="donate-amount-row" role="group" aria-label="Suggested donation amounts">
                {suggestedAmounts.map((amount) => {
                  const isActive = !customAmount && selectedAmount === amount;

                  return (
                    <button
                      type="button"
                      key={amount}
                      className={isActive ? "active donate-amount-selected" : undefined}
                      aria-pressed={isActive}
                      onClick={() => {
                        setSelectedAmount(amount);
                        setCustomAmount("");
                      }}
                    >
                      {formatInr(amount)}
                    </button>
                  );
                })}
              </div>

              <label>
                Custom Amount (Optional)
                <input
                  type="number"
                  name="amount"
                  min="1"
                  step="1"
                  value={customAmount}
                  onChange={(event) => setCustomAmount(event.target.value)}
                  placeholder="Enter amount in INR"
                  inputMode="numeric"
                />
              </label>

              <p className="donate-live-amount" aria-live="polite">
                Selected Amount: <strong>{formatInr(finalAmount)}</strong>
              </p>

              <label className="donate-check">
                <input type="checkbox" defaultChecked />
                I&apos;d like to cover processing fees so more goes to animal care.
              </label>

              <button className="donate-submit" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : `Donate ${formatInr(finalAmount)}`}
              </button>

              {statusMessage ? (
                <p className="donate-status" role="status" aria-live="polite">
                  {statusMessage}
                </p>
              ) : null}

              <p className="donate-note">Secure SSL encrypted. Donation records available for tax reporting.</p>
            </form>
          </ScrollReveal>
        </section>
      </main>
    </div>
  );
}