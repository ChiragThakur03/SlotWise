import twilio from "twilio";

let cached: ReturnType<typeof twilio> | null = null;

function getTwilioClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return null;
  if (!cached) cached = twilio(sid, token);
  return cached;
}

export interface SendSmsResult {
  sent: boolean;
  configured: boolean;
  error?: string;
}

export async function sendSms(opts: { to: string; body: string }): Promise<SendSmsResult> {
  const client = getTwilioClient();
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!client || !from) {
    return { sent: false, configured: false, error: "Twilio isn't configured yet — add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER." };
  }

  try {
    await client.messages.create({ from, to: opts.to, body: opts.body });
    return { sent: true, configured: true };
  } catch (err) {
    return { sent: false, configured: true, error: err instanceof Error ? err.message : "Failed to send SMS." };
  }
}
