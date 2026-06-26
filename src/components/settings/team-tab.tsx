"use client";

import { useState } from "react";
import { Plus, Trash2, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useAppStore } from "@/lib/store/app-store";

export function TeamTab() {
  const store = useAppStore();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  if (store.profile.subscriptionPlan !== "studio") {
    return (
      <Card className="flex flex-col items-center gap-3 py-10 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <Lock className="h-4 w-4 text-muted-foreground" />
        </div>
        <p className="font-medium text-navy">Team management is a Studio feature</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Upgrade to Studio to invite staff, assign services, and see per-staff booking counts.
        </p>
        <Button size="sm" onClick={() => store.updateProfile({ subscriptionPlan: "studio" })}>
          Upgrade to Studio
        </Button>
      </Card>
    );
  }

  function serviceNames(ids: string[]) {
    return store.services.filter((s) => ids.includes(s.id)).map((s) => s.name);
  }

  async function handleInvite() {
    if (!name.trim() || !email.trim() || saving) return;
    setSaving(true);
    try {
      await store.addStaff({ name: name.trim(), email: email.trim(), serviceIds: [] });
      setName("");
      setEmail("");
      setInviteOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{store.staff.length} of 5 staff members</p>
        <Button size="sm" onClick={() => setInviteOpen(true)} disabled={store.staff.length >= 5}>
          <Plus className="h-3.5 w-3.5" /> Invite staff
        </Button>
      </div>

      {store.staff.length === 0 ? (
        <Card className="py-8 text-center text-sm text-muted-foreground">No team members yet.</Card>
      ) : (
        <div className="space-y-2.5">
          {store.staff.map((member) => (
            <Card key={member.id} className="flex items-center gap-3">
              <Avatar name={member.name} />
              <div className="flex-1">
                <p className="text-sm font-medium text-navy">{member.name}</p>
                <p className="text-xs text-muted-foreground">{member.email}</p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {serviceNames(member.serviceIds).length === 0 ? (
                    <span className="text-xs text-muted-foreground">No services assigned</span>
                  ) : (
                    serviceNames(member.serviceIds).map((n) => (
                      <Badge key={n} variant="neutral">
                        {n}
                      </Badge>
                    ))
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-navy">{member.bookingCount ?? 0}</p>
                <p className="text-xs text-muted-foreground">bookings</p>
              </div>
              <button onClick={() => setRemoveTarget(member.id)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite staff member</DialogTitle>
            <DialogDescription>They&apos;ll get an email invite to join your SlotWise team.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input className="mt-1.5" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>Email</Label>
              <Input className="mt-1.5" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite} disabled={!name.trim() || !email.trim() || saving}>
              {saving ? "Sending…" : "Send invite"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(o) => !o && setRemoveTarget(null)}
        title="Remove this team member?"
        description="They'll lose access to your SlotWise dashboard immediately."
        confirmLabel="Remove"
        onConfirm={() => removeTarget && store.removeStaff(removeTarget)}
      />
    </div>
  );
}
