"use client";

import { FormEvent, useMemo, useState } from "react";
import Script from "next/script";
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

type CreateOrderResponse = {
  ok: boolean;
  order_id?: string;
  amount?: number;
  currency?: string;
  razorpay_key_id?: string;
  message?: string;
};

type VerifyPaymentResponse = {
  ok: boolean;
  message?: string;
  donation?: {
    donationId?: string;
  };
};

export default function DonatePage() {
  const [selectedAmount, setSelectedAmount] = useState<number>(suggestedAmounts[1]);
  const [customAmount, setCustomAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [coverFees, setCoverFees] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckoutReady, setIsCheckoutReady] = useState(false);
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

    if (!isCheckoutReady || typeof window === "undefined" || !window.Razorpay) {
      setStatusMessage("Payment gateway is still loading. Please try again in a moment.");
      return;
    }

    setIsSubmitting(true);
    setStatusMessage("");

    const amountPaise = Math.round(finalAmount * 100);
    const receipt = `donation-${Date.now()}`;

    try {
      const orderResponse = await fetch("/api/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          donorName,
          email,
          phone,
          amount: amountPaise,
          currency: "INR",
          receipt,
          coverFees,
        }),
      });

      const orderResult = (await orderResponse.json()) as CreateOrderResponse;

      if (!orderResponse.ok || !orderResult.order_id) {
        setStatusMessage(orderResult.message ?? "We could not create a payment order right now. Please try again.");
        setIsSubmitting(false);
        return;
      }

      const razorpayKeyId = orderResult.razorpay_key_id ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";

      const checkout = new window.Razorpay({
        key: razorpayKeyId,
        amount: orderResult.amount ?? amountPaise,
        currency: orderResult.currency ?? "INR",
        name: "The Canine Help",
        description: "Donation for rescue, medical care, and shelter support",
        order_id: orderResult.order_id,
        prefill: {
          name: donorName,
          email,
          contact: phone,
        },
        notes: {
          receipt,
          coverFees: String(coverFees),
        },
        method: {
          netbanking: true,
          card: true,
          upi: true,
          wallet: true,
        },
        theme: {
          color: "#0f766e",
        },
        modal: {
          ondismiss: () => {
            setIsSubmitting(false);
            setStatusMessage("Payment window was closed before completion.");
          },
        },
        handler: async (paymentResponse) => {
          try {
            const verifyResponse = await fetch("/api/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                donorName,
                email,
                phone,
                amount: amountPaise,
                currency: "INR",
                receipt,
                coverFees,
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
              }),
            });

            const verifyResult = (await verifyResponse.json()) as VerifyPaymentResponse;

            if (!verifyResponse.ok || !verifyResult.ok) {
              setStatusMessage(verifyResult.message ?? "Payment was received but could not be verified.");
              return;
            }

            setStatusMessage(
              `Payment successful. Reference ${verifyResult.donation?.donationId ?? receipt}.`,
            );
            setCustomAmount("");
            setDonorName("");
            setEmail("");
            setPhone("");
            setCoverFees(true);
          } catch {
            setStatusMessage("Payment was received but could not be verified. Please contact support.");
          } finally {
            setIsSubmitting(false);
          }
        },
      });

      checkout.on("payment.failed", (failureResponse) => {
        setIsSubmitting(false);
        setStatusMessage(
          failureResponse.error?.description ?? "Payment failed. Please try again.",
        );
      });

      checkout.open();
    } catch {
      setIsSubmitting(false);
      setStatusMessage("We could not start the payment flow right now. Please check the Razorpay keys in Next/.env and restart the dev server.");
    }
  }

  return (
    <div className="donate-page">
      <Script
        id="razorpay-checkout-script"
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => setIsCheckoutReady(true)}
      />
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
                  <input
                    type="text"
                    name="name"
                    placeholder="Aman Singh"
                    value={donorName}
                    onChange={(event) => setDonorName(event.target.value)}
                    required
                  />
                </label>
                <label>
                  Email Address
                  <input
                    type="email"
                    name="email"
                    placeholder="amansingh@gmail.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </label>
              </div>

              <label>
                Phone Number
                <input
                  type="tel"
                  name="phone"
                  placeholder="+91 98939 08123"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
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
                <input type="checkbox" checked={coverFees} onChange={(event) => setCoverFees(event.target.checked)} />
                I&apos;d like to cover processing fees so more goes to animal care.
              </label>

              <button className="donate-submit" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : `Pay ${formatInr(finalAmount)}`}
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