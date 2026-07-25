"use client";

import { ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store/app-store";
import { ACCENT_COLORS } from "@/lib/accent-colors";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";

export function BookingPageTab() {
  const store = useAppStore();
  const { profile } = store;

  return (
    <div className="space-y-4">
      <Card className="space-y-4">
        <div>
          <Label>Booking page username</Label>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">slotwise.io/book/</span>
            <Input
              className="max-w-[200px]"
              defaultValue={profile.username}
              onBlur={(e) => { store.updateProfile({ username: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") }); toast("Saved", "success", "settings"); }}
            />
          </div>
        </div>

        <Button variant="secondary" size="sm" asChild>
          <a href={`/book/${profile.username}`} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3.5 w-3.5" /> Preview booking page
          </a>
        </Button>
      </Card>

      <Card>
        <Label>Page accent color</Label>
        <div className="mt-2 flex flex-wrap gap-3">
          {ACCENT_COLORS.map((c) => (
            <button
              key={c.id}
              onClick={() => { store.updateProfile({ accentColor: c.id }); toast("Saved", "success", "settings"); }}
              className={cn(
                "h-9 w-9 rounded-full border-2 transition-transform",
                profile.accentColor === c.id ? "scale-110 border-navy" : "border-transparent"
              )}
              style={{ backgroundColor: c.hex }}
              aria-label={c.label}
              title={c.label}
            />
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-navy">Show social links</p>
            <p className="text-xs text-muted-foreground">Display your social links on your booking page header.</p>
          </div>
          <Switch checked={profile.showSocialLinks} onCheckedChange={(v) => { store.updateProfile({ showSocialLinks: v }); toast("Saved", "success", "settings"); }} />
        </div>
      </Card>
    </div>
  );
}
