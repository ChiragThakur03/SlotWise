import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  accent = false,
  warn = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
  warn?: boolean;
}) {
  return (
    <Card>
      <p className="label-caption">{label}</p>
      <p
        className={cn(
          "mt-2 text-2xl font-medium tracking-tight",
          accent ? "text-gold" : warn ? "text-destructive" : "text-navy"
        )}
      >
        {value}
      </p>
    </Card>
  );
}
