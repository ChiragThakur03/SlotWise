import { Resend } from "resend";

let cached: Resend | null = null;

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!cached) cached = new Resend(key);
  return cached;
}

export interface SendEmailResult {
  sent: boolean;
  configured: boolean;
  error?: string;
}

export async function sendEmail(opts: { to: string; subject: string; html: string }): Promise<SendEmailResult> {
  const resend = getResend();
  const from = process.env.RESEND_FROM_EMAIL;
  if (!resend || !from) {
    return { sent: false, configured: false, error: "Resend isn't configured yet — add RESEND_API_KEY and RESEND_FROM_EMAIL." };
  }

  try {
    const { error } = await resend.emails.send({ from, to: opts.to, subject: opts.subject, html: opts.html });
    if (error) return { sent: false, configured: true, error: error.message };
    return { sent: true, configured: true };
  } catch (err) {
    return { sent: false, configured: true, error: err instanceof Error ? err.message : "Failed to send email." };
  }
}
