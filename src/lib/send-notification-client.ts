import type { NotificationChannel } from "@/lib/types";
import type { TemplateVariables } from "@/lib/render-template";

export interface NotificationRecipient {
  email?: string | null;
  phone?: string | null;
}

export interface SendResult {
  configured: boolean;
  sent: boolean;
  error?: string;
}

export async function sendNotification(
  channel: NotificationChannel,
  to: NotificationRecipient,
  body: string,
  variables: TemplateVariables,
  subject?: string
): Promise<SendResult> {
  try {
    const res = await fetch("/api/notifications/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel, to, subject, body, variables }),
    });
    const data = await res.json();
    return { configured: !!data.configured, sent: !!data.sent, error: data.error };
  } catch {
    return { configured: false, sent: false };
  }
}
