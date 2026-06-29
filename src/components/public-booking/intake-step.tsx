"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { IntakeForm, IntakeFormField } from "@/lib/types";

export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
}

export type IntakeAnswers = Record<string, string | string[] | boolean>;
export type SignatureAnswers = Record<string, string>;

export function IntakeStep({
  intakeForm,
  contact,
  onContactChange,
  answers,
  onAnswerChange,
  signatures,
  onSignatureChange,
}: {
  intakeForm?: IntakeForm;
  contact: ContactInfo;
  onContactChange: (patch: Partial<ContactInfo>) => void;
  answers: IntakeAnswers;
  onAnswerChange: (fieldId: string, value: string | string[] | boolean) => void;
  signatures: SignatureAnswers;
  onSignatureChange: (fieldId: string, name: string) => void;
}) {
  return (
    <div className="space-y-5">
      <h2 className="text-base font-medium text-navy">A few details</h2>

      <div className="space-y-3 rounded-card border-[0.5px] border-card-border p-4">
        <p className="label-caption">Your info</p>
        <div>
          <Label>
            Name <span className="text-destructive">*</span>
          </Label>
          <Input className="mt-1.5" value={contact.name} onChange={(e) => onContactChange({ name: e.target.value })} />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <Label>
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              className="mt-1.5"
              type="email"
              value={contact.email}
              onChange={(e) => onContactChange({ email: e.target.value })}
            />
          </div>
          <div>
            <Label>
              Phone <span className="text-destructive">*</span>
            </Label>
            <Input className="mt-1.5" type="tel" value={contact.phone} onChange={(e) => onContactChange({ phone: e.target.value })} />
          </div>
        </div>
      </div>

      {[...(intakeForm?.fields ?? [])]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((field) => (
          <IntakeField
            key={field.id}
            field={field}
            value={answers[field.id]}
            onChange={(v) => onAnswerChange(field.id, v)}
            signature={signatures[field.id] ?? ""}
            onSignatureChange={(name) => onSignatureChange(field.id, name)}
          />
        ))}
    </div>
  );
}

function IntakeField({
  field,
  value,
  onChange,
  signature,
  onSignatureChange,
}: {
  field: IntakeFormField;
  value: string | string[] | boolean | undefined;
  onChange: (value: string | string[] | boolean) => void;
  signature: string;
  onSignatureChange: (name: string) => void;
}) {
  const label = (
    <Label>
      {field.label} {field.required && <span className="text-destructive">*</span>}
    </Label>
  );

  if (field.isWaiver) {
    return (
      <div className="space-y-3 rounded-card border-[0.5px] border-card-border p-4">
        <p className="text-sm font-medium text-navy">{field.label}</p>
        {field.waiverText && <p className="text-xs leading-relaxed text-muted-foreground">{field.waiverText}</p>}
        <div className="flex items-center gap-2">
          <Checkbox checked={value === true} onCheckedChange={(v) => onChange(v === true)} id={field.id} />
          <label htmlFor={field.id} className="text-sm text-navy">
            I agree {field.required && <span className="text-destructive">*</span>}
          </label>
        </div>
        {field.requiresSignature && value === true && (
          <div>
            <Label>Type your full name to sign</Label>
            <Input className="mt-1.5" value={signature} onChange={(e) => onSignatureChange(e.target.value)} />
          </div>
        )}
      </div>
    );
  }

  switch (field.fieldType) {
    case "short_text":
      return (
        <div>
          {label}
          <Input className="mt-1.5" value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />
        </div>
      );
    case "long_text":
      return (
        <div>
          {label}
          <Textarea className="mt-1.5" rows={3} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />
        </div>
      );
    case "date":
      return (
        <div>
          {label}
          <Input className="mt-1.5" type="date" value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />
        </div>
      );
    case "checkbox":
      return (
        <div className="flex items-center gap-2">
          <Checkbox checked={value === true} onCheckedChange={(v) => onChange(v === true)} id={field.id} />
          <label htmlFor={field.id} className="text-sm text-navy">
            {field.label} {field.required && <span className="text-destructive">*</span>}
          </label>
        </div>
      );
    case "dropdown":
      return (
        <div>
          {label}
          <Select value={(value as string) ?? ""} onValueChange={(v) => onChange(v)}>
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Select…" />
            </SelectTrigger>
            <SelectContent>
              {field.options.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    case "multi_select": {
      const selected = Array.isArray(value) ? value : [];
      return (
        <div>
          {label}
          <div className="mt-1.5 flex flex-wrap gap-2">
            {field.options.map((opt) => {
              const active = selected.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onChange(active ? selected.filter((o) => o !== opt) : [...selected, opt])}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    active ? "border-teal bg-teal text-navy" : "border-input text-muted-foreground hover:border-teal"
                  )}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      );
    }
    case "file_upload":
      return <FileUploadField field={field} value={value} onChange={onChange} />;
    default:
      return null;
  }
}

function FileUploadField({
  field,
  value,
  onChange,
}: {
  field: IntakeFormField;
  value: string | string[] | boolean | undefined;
  onChange: (value: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "bin";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("intake-uploads").upload(path, file);
      if (error) {
        setUploadError("Upload failed: " + error.message);
        return;
      }
      const { data: { publicUrl } } = supabase.storage.from("intake-uploads").getPublicUrl(path);
      onChange(publicUrl);
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <Label>
        {field.label} {field.required && <span className="text-destructive">*</span>}
      </Label>
      <input
        type="file"
        disabled={uploading}
        className="mt-1.5 block w-full text-sm text-muted-foreground file:mr-3 file:rounded-btn file:border-0 file:bg-teal-light file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-accent-foreground disabled:opacity-50"
        onChange={handleFile}
      />
      {uploading && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-teal border-t-transparent" />
          Uploading…
        </p>
      )}
      {uploadError && <p className="mt-1.5 text-xs text-destructive">{uploadError}</p>}
      {!uploading && !uploadError && typeof value === "string" && value && (
        <p className="mt-1.5 text-xs text-teal">✓ File uploaded successfully</p>
      )}
    </div>
  );
}
