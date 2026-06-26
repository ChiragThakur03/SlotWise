import { Card } from "@/components/ui/card";
import { formatCents, formatDuration } from "@/lib/format";
import type { Service } from "@/lib/types";

export function ServiceStep({
  services,
  onSelect,
}: {
  services: Service[];
  onSelect: (service: Service) => void;
}) {
  return (
    <div className="space-y-3">
      <h2 className="text-base font-medium text-navy">Pick a service</h2>
      {services.length === 0 && (
        <p className="text-sm text-muted-foreground">This pro hasn&apos;t published any services yet.</p>
      )}
      {services
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((service) => (
          <button key={service.id} onClick={() => onSelect(service)} className="block w-full text-left">
            <Card className="transition-colors hover:border-teal active:bg-teal-light/30">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-navy">{service.name}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{formatDuration(service.durationMinutes)}</p>
                  {service.description && <p className="mt-1.5 text-sm text-muted-foreground">{service.description}</p>}
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-medium text-navy">{formatCents(service.priceCents)}</p>
                  {service.depositRequired && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{formatCents(service.depositAmountCents)} deposit</p>
                  )}
                </div>
              </div>
            </Card>
          </button>
        ))}
    </div>
  );
}
