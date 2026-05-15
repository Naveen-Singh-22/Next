"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

interface OtpVerificationProps {
  email: string;
  onSuccess?: () => void;
  onBack?: () => void;
}

export default function OtpVerification({ email, onSuccess, onBack }: OtpVerificationProps) {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Handle OTP input - only allow 4 digits
  const handleOtpChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    setOtp(digits);
  };

  // Handle OTP verification
  const handleVerifyOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    if (otp.length !== 4) {
      setErrorMessage("Please enter a 4-digit verification code.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const payload = (await response.json().catch(() => null)) as any;

      if (!response.ok || !payload?.ok) {
        setErrorMessage(payload?.message ?? "Verification failed. Please try again.");
        if (payload?.attemptsRemaining !== undefined) {
          setAttemptsRemaining(payload.attemptsRemaining);
        }
        return;
      }

      // Success
      if (onSuccess) {
        onSuccess();
      } else {
        router.replace("/profile");
        router.refresh();
      }
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    setErrorMessage("");
    setIsResending(true);
    setResendCooldown(60);

    // Start cooldown timer
    const cooldownInterval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    try {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const payload = (await response.json().catch(() => null)) as any;

      if (!response.ok || !payload?.ok) {
        clearInterval(cooldownInterval);
        setResendCooldown(0);
        setErrorMessage(payload?.message ?? "Failed to resend code. Please try again.");
        return;
      }

      // Success
      setOtp("");
      setErrorMessage("");
    } catch {
      clearInterval(cooldownInterval);
      setResendCooldown(0);
      setErrorMessage("Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="otp-verification-container">
      <div className="otp-verification-card">
        <h2>Verify Your Email</h2>
        <p className="otp-verification-subtitle">
          We've sent a 4-digit code to <strong>{email}</strong>
        </p>

        <form className="otp-verification-form" onSubmit={handleVerifyOtp}>
          <div className="otp-input-group">
            <label htmlFor="otp-input">Verification Code</label>
            <input
              id="otp-input"
              type="text"
              inputMode="numeric"
              placeholder="0000"
              value={otp}
              onChange={(e) => handleOtpChange(e.target.value)}
              maxLength={4}
              className="otp-input"
              disabled={isSubmitting || attemptsRemaining <= 0}
            />
            <p className="otp-input-hint">Enter the 4-digit code</p>
          </div>

          {errorMessage && (
            <div className="otp-error" role="alert">
              {errorMessage}
            </div>
          )}

          {attemptsRemaining > 0 && attemptsRemaining < 3 && (
            <p className="otp-attempts">
              Attempts remaining: {attemptsRemaining}
            </p>
          )}

          <button
            type="submit"
            className="otp-submit"
            disabled={isSubmitting || otp.length !== 4 || attemptsRemaining <= 0}
          >
            {isSubmitting ? "Verifying..." : "Verify Code"}
          </button>
        </form>

        <div className="otp-actions">
          <button
            type="button"
            className="otp-resend"
            onClick={handleResendOtp}
            disabled={isResending || resendCooldown > 0}
          >
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Didn't receive the code? Resend"}
          </button>

          {onBack && (
            <button type="button" className="otp-back" onClick={onBack}>
              Back to Sign Up
            </button>
          )}
        </div>

        <p className="otp-security-note">
          🔒 Your verification code is secure and expires in 10 minutes.
        </p>
      </div>

      <style jsx>{`
        .otp-verification-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100%;
          padding: 20px;
        }

        .otp-verification-card {
          width: 100%;
          max-width: 400px;
          padding: 30px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        h2 {
          margin: 0 0 10px;
          font-size: 24px;
          color: #1f2937;
        }

        .otp-verification-subtitle {
          margin: 0 0 30px;
          color: #666;
          font-size: 14px;
        }

        .otp-verification-form {
          margin-bottom: 20px;
        }

        .otp-input-group {
          margin-bottom: 20px;
        }

        label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #1f2937;
        }

        .otp-input {
          width: 100%;
          padding: 12px;
          font-size: 24px;
          letter-spacing: 8px;
          text-align: center;
          border: 2px solid #e5e7eb;
          border-radius: 6px;
          font-family: 'Courier New', monospace;
          font-weight: bold;
          transition: border-color 0.3s;
        }

        .otp-input:focus {
          outline: none;
          border-color: #8b5cf6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }

        .otp-input:disabled {
          background-color: #f3f4f6;
          cursor: not-allowed;
        }

        .otp-input-hint {
          margin: 6px 0 0;
          font-size: 12px;
          color: #999;
        }

        .otp-error {
          padding: 12px;
          margin-bottom: 16px;
          background-color: #fee2e2;
          border: 1px solid #fca5a5;
          border-radius: 6px;
          color: #dc2626;
          font-size: 14px;
        }

        .otp-attempts {
          margin: 12px 0;
          font-size: 12px;
          color: #f59e0b;
          text-align: center;
        }

        .otp-submit {
          width: 100%;
          padding: 12px;
          margin-bottom: 16px;
          background-color: #8b5cf6;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .otp-submit:hover:not(:disabled) {
          background-color: #7c3aed;
        }

        .otp-submit:disabled {
          background-color: #d1d5db;
          cursor: not-allowed;
        }

        .otp-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .otp-resend,
        .otp-back {
          padding: 10px;
          background: none;
          border: none;
          color: #8b5cf6;
          font-size: 14px;
          cursor: pointer;
          text-align: center;
          transition: color 0.3s;
        }

        .otp-resend:hover:not(:disabled),
        .otp-back:hover {
          color: #7c3aed;
          text-decoration: underline;
        }

        .otp-resend:disabled {
          color: #d1d5db;
          cursor: not-allowed;
        }

        .otp-security-note {
          margin: 20px 0 0;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
      `}</style>
    </div>
  );
}
