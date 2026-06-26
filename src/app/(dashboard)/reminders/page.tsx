"use client";

import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Avatar } from "@/components/ui/avatar";
import { useAppStore } from "@/lib/store/app-store";
import { formatDateTime } from "@/lib/format";
import type { NotificationChannel, NotificationTemplate, NotificationType } from "@/lib/types";

const VARIABLES = "{client_name} {service} {date} {time} {deposit_amount} {booking_link}";

const CHANNEL_LABELS: Record<NotificationChannel, string> = {
  email: "Email",
  sms: "SMS",
  both: "Email + SMS",
};

const STATUS_VARIANT: Record<string, "confirmed" | "pending" | "cancelled"> = {
  delivered: "confirmed",
  sent: "confirmed",
  failed: "cancelled",
};

export default function RemindersPage() {
  const store = useAppStore();

  function templateFor(type: NotificationType) {
    return store.notificationTemplates.find((t) => t.type === type);
  }

  const reminderTypes: { type: NotificationType; title: string }[] = [
    { type: "reminder_48h", title: "48 hours before" },
    { type: "reminder_24h", title: "24 hours before" },
    { type: "reminder_2h", title: "2 hours before" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-medium text-navy">Reminders & notifications</h1>

      <div>
        <p className="mb-3 text-sm font-medium text-navy">Reminder schedule</p>
        <div className="space-y-3">
          {reminderTypes.map(({ type, title }) => {
            const template = templateFor(type);
            if (!template) return null;
            return <ReminderCard key={type} title={title} template={template} />;
          })}
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-navy">No-show follow-up</p>
        <p className="mb-3 text-sm text-muted-foreground">Sent automatically 15 minutes after a missed appointment.</p>
        {(() => {
          const template = templateFor("no_show_followup");
          return template ? <ReminderCard title="No-show follow-up" template={template} /> : null;
        })()}
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-navy">Notification log</p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Sent</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {store.notificationLog.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  No notifications sent yet.
                </TableCell>
              </TableRow>
            )}
            {store.notificationLog.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <Avatar name={entry.clientName ?? "?"} size="sm" />
                    {entry.clientName ?? "—"}
                  </div>
                </TableCell>
                <TableCell className="capitalize">{entry.type.replace(/_/g, " ")}</TableCell>
                <TableCell>{CHANNEL_LABELS[entry.channel]}</TableCell>
                <TableCell>{formatDateTime(entry.sentAt)}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[entry.status] ?? "pending"}>{entry.status}</Badge>
                  {entry.errorMessage && <p className="mt-1 text-xs text-destructive">{entry.errorMessage}</p>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function ReminderCard({ title, template }: { title: string; template: NotificationTemplate }) {
  const store = useAppStore();

  return (
    <Card>
      <div className="flex items-center justify-between">
        <p className="font-medium text-navy">{title}</p>
        <Switch
          checked={template.enabled}
          onCheckedChange={(v) => store.updateNotificationTemplate(template.id, { enabled: v })}
        />
      </div>

      {template.enabled && (
        <div className="mt-3 space-y-3">
          <div>
            <Label>Channel</Label>
            <Select
              value={template.channel}
              onValueChange={(v) => store.updateNotificationTemplate(template.id, { channel: v as NotificationChannel })}
            >
              <SelectTrigger className="mt-1.5 w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {template.subject !== "" && (
            <div>
              <Label>Subject</Label>
              <Textarea
                className="mt-1.5"
                rows={1}
                defaultValue={template.subject}
                onBlur={(e) => store.updateNotificationTemplate(template.id, { subject: e.target.value })}
              />
            </div>
          )}

          <div>
            <Label>Message</Label>
            <Textarea
              className="mt-1.5"
              rows={4}
              defaultValue={template.body}
              onBlur={(e) => store.updateNotificationTemplate(template.id, { body: e.target.value })}
            />
            <p className="mt-1.5 text-xs text-muted-foreground">Variables: {VARIABLES}</p>
          </div>
        </div>
      )}
    </Card>
  );
}
