import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { sendSms } from "@/lib/sms";
import { renderTemplate, type TemplateVariables } from "@/lib/render-template";

interface SendNotificationRequest {
  channel: "email" | "sms" | "both";
  to: { email?: string; phone?: string };
  subject?: string;
  body: string;
  variables: TemplateVariables;
}

// Renders a notification template and sends it over the requested channel(s).
// Used for reminders, no-show follow-ups, and booking confirmations. Returns
// per-channel results so the caller can fall back to a local log entry when
// Resend/Twilio aren't configured yet.
export async function POST(request: Request) {
  const { channel, to, subject, body, variables }: SendNotificationRequest = await request.json();

  const renderedBody = renderTemplate(body, variables);
  const renderedSubject = subject ? renderTemplate(subject, variables) : undefined;

  const results: {
    email?: { sent: boolean; configured: boolean; error?: string };
    sms?: { sent: boolean; configured: boolean; error?: string };
  } = {};

  if ((channel === "email" || channel === "both") && to.email) {
    results.email = await sendEmail({
      to: to.email,
      subject: renderedSubject ?? "Notification from SlotWise",
      html: `<p>${renderedBody.replace(/\n/g, "<br/>")}</p>`,
    });
  }

  if ((channel === "sms" || channel === "both") && to.phone) {
    results.sms = await sendSms({ to: to.phone, body: renderedBody });
  }

  const attempted = Object.values(results);
  const anySent = attempted.some((r) => r?.sent);
  const anyConfigured = attempted.some((r) => r?.configured);
  const errors = attempted.map((r) => r?.error).filter(Boolean);

  return NextResponse.json({ sent: anySent, configured: anyConfigured, results, error: errors[0] });
}
