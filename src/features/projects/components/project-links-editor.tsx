"use client";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProjectLinkFormValue } from "../schemas";

interface Props {
  value: ProjectLinkFormValue[];
  onChange: (next: ProjectLinkFormValue[]) => void;
}

export function ProjectLinksEditor({ value, onChange }: Props) {
  const add = () => onChange([...value, { label: "", url: "" }]);
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const update = (i: number, patch: Partial<ProjectLinkFormValue>) =>
    onChange(value.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));

  return (
    <div className="space-y-2">
      {value.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No links yet. Optional — add GitHub, demo, docs, etc.
        </p>
      )}
      {value.map((row, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: link rows have no stable id before they're saved
        <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2">
          <Input
            placeholder="Label (e.g. GitHub)"
            value={row.label}
            onChange={(e) => update(i, { label: e.target.value })}
          />
          <Input
            placeholder="https://…"
            value={row.url}
            onChange={(e) => update(i, { url: e.target.value })}
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => remove(i)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button type="button" size="sm" variant="outline" onClick={add}>
        <Plus className="h-3 w-3 mr-1" />
        Add link
      </Button>
    </div>
  );
}
