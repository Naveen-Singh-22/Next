export {};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayCheckoutInstance;
  }

  interface RazorpayCheckoutOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description?: string;
    order_id: string;
    prefill?: {
      name?: string;
      email?: string;
      contact?: string;
    };
    notes?: Record<string, string>;
    method?: {
      netbanking?: boolean | 1 | 0 | string;
      card?: boolean | 1 | 0 | string;
      upi?: boolean | 1 | 0 | string;
      wallet?: boolean | 1 | 0 | string;
    };
    theme?: {
      color?: string;
    };
    modal?: {
      ondismiss?: () => void;
    };
    handler?: (response: RazorpaySuccessResponse) => void | Promise<void>;
  }

  interface RazorpayCheckoutInstance {
    open: () => void;
    on: (event: "payment.failed", callback: (response: RazorpayFailureResponse) => void) => void;
  }

  interface RazorpaySuccessResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }

  interface RazorpayFailureResponse {
    error?: {
      code?: string;
      description?: string;
      source?: string;
      step?: string;
      reason?: string;
    };
  }
}