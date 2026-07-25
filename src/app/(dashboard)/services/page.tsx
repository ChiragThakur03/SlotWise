"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ServiceModal } from "@/components/services/service-modal";
import { useAppStore } from "@/lib/store/app-store";
import { formatCents, formatDuration } from "@/lib/format";
import { toast } from "@/lib/toast";
import type { Service } from "@/lib/types";

export default function ServicesPage() {
  const store = useAppStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }
  function openEdit(service: Service) {
    setEditing(service);
    setModalOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-medium text-navy">Services</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add service
        </Button>
      </div>

      {store.services.length === 0 ? (
        <Card className="py-10 text-center text-sm text-muted-foreground">
          No services yet. Add your first one to start taking bookings.
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...store.services]
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((service) => (
              <Card key={service.id} className={!service.active ? "opacity-60" : undefined}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-navy">{service.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{formatDuration(service.durationMinutes)}</p>
                  </div>
                  <Switch checked={service.active} onCheckedChange={(v) => { store.updateService(service.id, { active: v }); toast(v ? "Service activated" : "Service deactivated", "success", "service-toggle"); }} />
                </div>

                {service.description && <p className="mt-2 text-sm text-muted-foreground">{service.description}</p>}

                {service.extra.styleTags && service.extra.styleTags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {service.extra.styleTags.map((tag) => (
                      <Badge key={tag} variant="neutral">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <div>
                    <p className="text-base font-medium text-navy">{formatCents(service.priceCents)}</p>
                    {service.depositRequired && (
                      <p className="text-xs text-muted-foreground">{formatCents(service.depositAmountCents)} deposit</p>
                    )}
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => openEdit(service)}>
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                </div>
              </Card>
            ))}
        </div>
      )}

      <ServiceModal open={modalOpen} onOpenChange={setModalOpen} service={editing} />
    </div>
  );
}
