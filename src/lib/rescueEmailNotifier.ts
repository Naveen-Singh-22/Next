import type { StoredRescueReport } from "@/lib/rescueReportsDb";

type MailResult = {
  sent: boolean;
  reason?: string;
};

function isConfigured() {
  return (
    Boolean(process.env.RESCUE_SMTP_HOST) &&
    Boolean(process.env.RESCUE_SMTP_PORT) &&
    Boolean(process.env.RESCUE_SMTP_USER) &&
    Boolean(process.env.RESCUE_SMTP_PASS) &&
    Boolean(process.env.RESCUE_MAIL_FROM)
  );
}

export async function sendRescueChecklistCompletionEmail(report: StoredRescueReport): Promise<MailResult> {
  if (!isConfigured()) {
    return {
      sent: false,
      reason: "SMTP is not configured. Set RESCUE_SMTP_HOST, RESCUE_SMTP_PORT, RESCUE_SMTP_USER, RESCUE_SMTP_PASS, and RESCUE_MAIL_FROM.",
    };
  }

  let createTransportFn:
    | ((options: {
      host: string;
      port: number;
      secure: boolean;
      auth: { user: string; pass: string };
    }) => { sendMail: (input: { from: string; to: string; subject: string; text: string }) => Promise<unknown> })
    | undefined;

  try {
    const mailerModule = (await import("nodemailer")) as {
      createTransport?: typeof createTransportFn;
      default?: {
        createTransport?: typeof createTransportFn;
      };
    };

    createTransportFn = mailerModule.createTransport ?? mailerModule.default?.createTransport;
  } catch {
    return {
      sent: false,
      reason: "Mailer module could not be loaded in this runtime.",
    };
  }

  if (!createTransportFn) {
    return {
      sent: false,
      reason: "Mailer transport factory is unavailable.",
    };
  }

  const host = process.env.RESCUE_SMTP_HOST as string;
  const port = Number(process.env.RESCUE_SMTP_PORT);
  const user = process.env.RESCUE_SMTP_USER as string;
  const pass = process.env.RESCUE_SMTP_PASS as string;
  const from = process.env.RESCUE_MAIL_FROM as string;

  const transporter = createTransportFn({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  const statusLabel = report.caseStatus.replace("_", " ").toUpperCase();

  try {
    await transporter.sendMail({
      from,
      to: report.email,
      subject: `Rescue update for case ${report.reportId}`,
      text: [
        `Hello ${report.fullName},`,
        "",
        `Your rescue report (${report.reportId}) has been updated by our admin team.`,
        `Current status: ${statusLabel}`,
        "",
        "Checklist completed by rescue operations:",
        "- Animal rescued",
        "- Monitoring started",
        "- Medical check completed",
        "- Shelter/placement arranged",
        "- Reporter notified",
        "",
        `Last seen location: ${report.lastSeenAddress}`,
        "",
        "Thank you for helping us rescue animals.",
        "thecaninehelp Shelter Operations",
      ].join("\n"),
    });
  } catch (error) {
    return {
      sent: false,
      reason: error instanceof Error ? error.message : "Failed to send reporter email.",
    };
  }

  return { sent: true as const };
}
