/**
 * Email service for sending OTP verification emails
 * Uses Nodemailer for SMTP email transmission
 */

type EmailResult = {
  sent: boolean;
  messageId?: string;
  reason?: string;
};

/**
 * Check if email configuration is available
 */
function isEmailConfigured(): boolean {
  const hasSmtp = Boolean(
    process.env.EMAIL_SMTP_HOST &&
    process.env.EMAIL_SMTP_PORT &&
    process.env.EMAIL_SMTP_USER &&
    process.env.EMAIL_SMTP_PASS
  );

  const hasFrom = Boolean(process.env.EMAIL_FROM);

  return hasSmtp && hasFrom;
}

/**
 * Send OTP verification email
 */
export async function sendOtpEmail(email: string, otp: string): Promise<EmailResult> {
  if (!isEmailConfigured()) {
    return {
      sent: false,
      reason: "Email SMTP is not configured. Set EMAIL_SMTP_HOST, EMAIL_SMTP_PORT, EMAIL_SMTP_USER, EMAIL_SMTP_PASS, and EMAIL_FROM.",
    };
  }

  let createTransportFn: any;

  try {
    const mailerModule = (await import("nodemailer")) as any;
    createTransportFn = mailerModule.createTransport ?? mailerModule.default?.createTransport;
  } catch {
    return {
      sent: false,
      reason: "Nodemailer module could not be loaded in this runtime.",
    };
  }

  if (!createTransportFn) {
    return {
      sent: false,
      reason: "Email transport factory is unavailable.",
    };
  }

  const host = process.env.EMAIL_SMTP_HOST as string;
  const port = Number(process.env.EMAIL_SMTP_PORT);
  const user = process.env.EMAIL_SMTP_USER as string;
  const pass = process.env.EMAIL_SMTP_PASS as string;
  const from = process.env.EMAIL_FROM as string;

  const transporter = createTransportFn({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  try {
    const info = await transporter.sendMail({
      from,
      to: email,
      subject: "Your TheCanineHelp Email Verification Code",
      html: generateOtpEmailHtml(otp),
      text: generateOtpEmailText(otp),
    });

    return {
      sent: true,
      messageId: info.messageId,
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown email error";
    return {
      sent: false,
      reason,
    };
  }
}

/**
 * Generate HTML email template
 */
function generateOtpEmailHtml(otp: string): string {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        line-height: 1.6;
        color: #333;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      }
      .header {
        text-align: center;
        margin-bottom: 30px;
      }
      .logo {
        font-size: 24px;
        font-weight: bold;
        color: #8B5CF6;
      }
      .content {
        background-color: #f9fafb;
        padding: 30px;
        border-radius: 8px;
        text-align: center;
      }
      .otp-code {
        font-size: 48px;
        font-weight: bold;
        letter-spacing: 4px;
        color: #8B5CF6;
        margin: 30px 0;
        font-family: 'Courier New', monospace;
      }
      .otp-note {
        font-size: 14px;
        color: #666;
        margin: 20px 0;
      }
      .footer {
        text-align: center;
        font-size: 12px;
        color: #999;
        margin-top: 30px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo">🐕 TheCanineHelp</div>
      </div>

      <div class="content">
        <h2>Email Verification</h2>
        <p>Thank you for creating an account with TheCanineHelp. To complete your registration, please use the verification code below:</p>

        <div class="otp-code">${otp}</div>

        <p class="otp-note">
          This code will expire in <strong>10 minutes</strong>.<br>
          If you didn't request this verification, please ignore this email.
        </p>
      </div>

      <div class="footer">
        <p>© ${new Date().getFullYear()} TheCanineHelp. Supporting the journey of every canine friend.</p>
      </div>
    </div>
  </body>
</html>
  `;
}

/**
 * Generate plain text email template
 */
function generateOtpEmailText(otp: string): string {
  return `
TheCanineHelp Email Verification

Your verification code is:

${otp}

This code will expire in 10 minutes.

If you didn't request this verification, please ignore this email.

---
TheCanineHelp - Supporting the journey of every canine friend.
  `;
}
