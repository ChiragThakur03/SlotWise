"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store/app-store";
import { PROFESSIONS } from "@/lib/verticals";
import { toast } from "@/lib/toast";

export function ProfileTab() {
  const store = useAppStore();
  const { profile } = store;

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center gap-4">
          <Avatar name={profile.businessName} size="lg" />
          <div>
            <Button variant="secondary" size="sm" disabled>
              Change photo
            </Button>
            <p className="mt-1 text-xs text-muted-foreground">Photo uploads require storage setup.</p>
          </div>
        </div>
      </Card>

      <Card className="space-y-4">
        <div>
          <Label>Business name</Label>
          <Input
            className="mt-1.5"
            defaultValue={profile.businessName}
            onBlur={(e) => { store.updateProfile({ businessName: e.target.value }); toast("Saved", "success", "settings"); }}
          />
        </div>
        <div>
          <Label>Bio</Label>
          <Textarea
            className="mt-1.5"
            rows={3}
            defaultValue={profile.bio}
            onBlur={(e) => { store.updateProfile({ bio: e.target.value }); toast("Saved", "success", "settings"); }}
          />
        </div>
        <div>
          <Label>Profession</Label>
          <div className="mt-1.5">
            <Badge variant="confirmed">{PROFESSIONS[profile.profession].label}</Badge>
          </div>
        </div>
        <div>
          <Label>Location</Label>
          <Input
            className="mt-1.5"
            defaultValue={profile.location ?? ""}
            onBlur={(e) => { store.updateProfile({ location: e.target.value }); toast("Saved", "success", "settings"); }}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>Contact email</Label>
            <Input
              className="mt-1.5"
              type="email"
              defaultValue={profile.contactEmail ?? ""}
              onBlur={(e) => { store.updateProfile({ contactEmail: e.target.value }); toast("Saved", "success", "settings"); }}
            />
          </div>
          <div>
            <Label>Contact phone</Label>
            <Input
              className="mt-1.5"
              type="tel"
              defaultValue={profile.contactPhone ?? ""}
              onBlur={(e) => { store.updateProfile({ contactPhone: e.target.value }); toast("Saved", "success", "settings"); }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
