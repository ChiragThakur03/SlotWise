"use client";

import { useRef, useState } from "react";
import {
  GripVertical,
  Plus,
  Trash2,
  Type,
  AlignLeft,
  ChevronDownSquare,
  ListChecks,
  Calendar,
  Upload,
  CheckSquare,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useAppStore, generateId } from "@/lib/store/app-store";
import type { IntakeFieldType, IntakeFormField } from "@/lib/types";

const FIELD_TYPE_META: Record<IntakeFieldType, { label: string; icon: typeof Type }> = {
  short_text: { label: "Short text", icon: Type },
  long_text: { label: "Long text", icon: AlignLeft },
  dropdown: { label: "Dropdown", icon: ChevronDownSquare },
  multi_select: { label: "Multi-select", icon: ListChecks },
  date: { label: "Date", icon: Calendar },
  file_upload: { label: "File upload", icon: Upload },
  checkbox: { label: "Checkbox", icon: CheckSquare },
};

export default function IntakeFormsPage() {
  const store = useAppStore();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fields = [...store.intakeForm.fields].sort((a, b) => a.sortOrder - b.sortOrder);

  function commit(updated: IntakeFormField[]) {
    store.setIntakeFormFields(updated.map((f, i) => ({ ...f, sortOrder: i })));
    setSaveState("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      setSaveState("saved");
      saveTimer.current = setTimeout(() => setSaveState("idle"), 1500);
    }, 700);
  }

  function updateField(id: string, patch: Partial<IntakeFormField>) {
    commit(fields.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }

  function removeField(id: string) {
    commit(fields.filter((f) => f.id !== id));
  }

  function addField(type: IntakeFieldType) {
    const isOptionType = type === "dropdown" || type === "multi_select";
    const newField: IntakeFormField = {
      id: generateId("field"),
      formId: store.intakeForm.id,
      label: `New ${FIELD_TYPE_META[type].label.toLowerCase()}`,
      fieldType: type,
      options: isOptionType ? ["Option 1", "Option 2"] : [],
      required: false,
      sortOrder: fields.length,
      isWaiver: false,
      requiresSignature: false,
      waiverText: null,
    };
    commit([...fields, newField]);
  }

  function handleDrop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) return;
    const next = [...fields];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, moved);
    commit(next);
    setDragIndex(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-medium text-navy">Intake form</h1>
          <p className="text-sm text-muted-foreground">Clients fill this in before paying their deposit.</p>
        </div>
        <div className="flex items-center gap-3">
          {saveState !== "idle" && (
            <span className="text-sm text-muted-foreground">
              {saveState === "saving" ? "Saving…" : "Saved ✓"}
            </span>
          )}
          <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" /> Add field
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {Object.entries(FIELD_TYPE_META).map(([type, meta]) => {
              const Icon = meta.icon;
              return (
                <DropdownMenuItem key={type} onClick={() => addField(type as IntakeFieldType)}>
                  <Icon className="h-4 w-4" /> {meta.label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="space-y-2.5">
        {fields.length === 0 && (
          <Card className="py-10 text-center text-sm text-muted-foreground">
            No fields yet. Add your first field above.
          </Card>
        )}
        {fields.map((field, index) => {
          const Icon = FIELD_TYPE_META[field.fieldType].icon;
          return (
            <Card
              key={field.id}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(index)}
              className="cursor-default"
            >
              <div className="flex items-start gap-3">
                <button className="mt-1 cursor-grab text-muted-foreground active:cursor-grabbing" aria-label="Drag to reorder">
                  <GripVertical className="h-4 w-4" />
                </button>

                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="label-caption">{FIELD_TYPE_META[field.fieldType].label}</span>
                  </div>

                  <Input value={field.label} onChange={(e) => updateField(field.id, { label: e.target.value })} placeholder="Field label" />

                  {(field.fieldType === "dropdown" || field.fieldType === "multi_select") && (
                    <div>
                      <Label>Options (comma separated)</Label>
                      <Input
                        className="mt-1.5"
                        defaultValue={field.options.join(", ")}
                        onBlur={(e) =>
                          updateField(field.id, {
                            options: e.target.value.split(",").map((o) => o.trim()).filter(Boolean),
                          })
                        }
                      />
                    </div>
                  )}

                  {field.fieldType === "checkbox" && (
                    <div className="space-y-3 rounded-card border-[0.5px] border-card-border p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-navy">This is a waiver</p>
                        <Switch checked={field.isWaiver} onCheckedChange={(v) => updateField(field.id, { isWaiver: v })} />
                      </div>
                      {field.isWaiver && (
                        <>
                          <Textarea
                            rows={3}
                            value={field.waiverText ?? ""}
                            onChange={(e) => updateField(field.id, { waiverText: e.target.value })}
                            placeholder="Waiver text shown to the client"
                          />
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-navy">Requires digital signature</p>
                            <Switch
                              checked={field.requiresSignature}
                              onCheckedChange={(v) => updateField(field.id, { requiresSignature: v })}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <div className="flex items-center gap-2">
                      <Switch checked={field.required} onCheckedChange={(v) => updateField(field.id, { required: v })} />
                      <span className="text-sm text-muted-foreground">Required</span>
                    </div>
                    <button onClick={() => setDeleteTarget(field.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Remove this field?"
        description="This field will no longer appear on your booking page."
        confirmLabel="Remove"
        onConfirm={() => deleteTarget && removeField(deleteTarget)}
      />
    </div>
  );
}
