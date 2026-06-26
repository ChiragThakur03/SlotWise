import { Badge } from "@/components/ui/badge";
import type { BookingStatus } from "@/lib/types";

const STATUS_CONFIG: Record<BookingStatus, { label: string; variant: "confirmed" | "pending" | "cancelled" | "no-show" | "completed" }> = {
  confirmed: { label: "Confirmed", variant: "confirmed" },
  pending: { label: "Pending", variant: "pending" },
  completed: { label: "Completed", variant: "completed" },
  cancelled: { label: "Cancelled", variant: "cancelled" },
  no_show: { label: "No-show", variant: "no-show" },
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const config = STATUS_CONFIG[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
