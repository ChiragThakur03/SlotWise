"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";

export interface BusinessDraft {
  businessName: string;
  bio: string;
}

export function StepBusiness({
  draft,
  onChange,
}: {
  draft: BusinessDraft;
  onChange: (patch: Partial<BusinessDraft>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Avatar name={draft.businessName || "?"} size="lg" />
        <div>
          <Button variant="secondary" size="sm" disabled>
            Upload photo
          </Button>
          <p className="mt-1 text-xs text-muted-foreground">Photo uploads require storage setup.</p>
        </div>
      </div>
      <div>
        <Label>Business name</Label>
        <Input
          className="mt-1.5"
          value={draft.businessName}
          onChange={(e) => onChange({ businessName: e.target.value })}
          placeholder="e.g. Ink & Iron Tattoo"
          autoFocus
        />
      </div>
      <div>
        <Label>Short bio</Label>
        <Textarea
          className="mt-1.5"
          rows={3}
          value={draft.bio}
          onChange={(e) => onChange({ bio: e.target.value })}
          placeholder="Tell clients what makes your work different"
        />
      </div>
    </div>
  );
}
