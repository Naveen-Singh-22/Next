import crypto from "node:crypto";
import Razorpay from "razorpay";

let razorpayClient: Razorpay | null = null;

export function getRazorpayConfig() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials are not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Next/.env and restart the dev server.");
  }

  return { keyId, keySecret };
}

export function getRazorpayClient() {
  const { keyId, keySecret } = getRazorpayConfig();

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials are not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Next/.env and restart the dev server.");
  }

  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  return razorpayClient;
}

export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string) {
  const { keySecret } = getRazorpayConfig();

  const generatedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return generatedSignature === signature;
}

export function paiseToRupees(amountInPaise: number) {
  return Math.round(amountInPaise / 100);
}