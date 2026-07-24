"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ImpactProjectLink } from "../../schemas";

interface ImpactProjectLinksEditorProps {
  value: ImpactProjectLink[];
  onChange: (value: ImpactProjectLink[]) => void;
}

export function ImpactProjectLinksEditor({
  value,
  onChange,
}: ImpactProjectLinksEditorProps) {
  const addLink = () => onChange([...value, { label: "", url: "" }]);

  const updateLink = (index: number, patch: Partial<ImpactProjectLink>) => {
    onChange(value.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  };

  const removeLink = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">Links</p>
        <Button
          type="button"
          size="sm"
          variant="default"
          onClick={addLink}
          aria-label="Add link"
          className="gap-1"
        >
          <Plus className="size-3" /> Add
        </Button>
      </div>
      <div className="space-y-2">
        {value.map((link, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: links have no stable id until saved
          <div key={index} className="flex items-start gap-2">
            <Input
              value={link.label}
              onChange={(e) => updateLink(index, { label: e.target.value })}
              placeholder="Label (e.g. github)"
              className="w-32 shrink-0 rounded-xl border-border bg-background"
            />
            <Input
              value={link.url}
              onChange={(e) => updateLink(index, { url: e.target.value })}
              placeholder="https://..."
              className="flex-1 rounded-xl border-border bg-background"
            />
            <Button
              type="button"
              size="icon-sm"
              variant="destructive"
              onClick={() => removeLink(index)}
              aria-label="Remove link"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {value.length === 0 && (
          <p className="text-xs italic text-muted-foreground">
            No links added yet.
          </p>
        )}
      </div>
    </div>
  );
}
