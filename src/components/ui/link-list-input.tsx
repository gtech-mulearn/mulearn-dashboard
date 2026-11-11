"use client";

import { Link2, Plus, X } from "lucide-react";
import { type KeyboardEvent, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LinkListInputProps {
  id?: string;
  "aria-label"?: string;
  value: string[];
  onChange: (next: string[]) => void;
  /** Maximum number of links (unlimited when omitted). */
  max?: number;
  placeholder?: string;
  disabled?: boolean;
}

/** Bare domains get https://; anything that isn't an http(s) URL with a real host is rejected. */
function toLink(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const candidate = /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  try {
    const url = new URL(candidate);
    const isHttp = url.protocol === "https:" || url.protocol === "http:";
    return isHttp && url.hostname.includes(".") && !/\s/.test(trimmed)
      ? candidate
      : null;
  } catch {
    return null;
  }
}

/**
 * A list of links entered one at a time (Enter or "Add"), shown as removable
 * rows. Used where we can only accept public links, not uploads.
 */
export function LinkListInput({
  id,
  "aria-label": ariaLabel,
  value,
  onChange,
  max,
  placeholder = "https://…",
  disabled = false,
}: LinkListInputProps) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const errorId = useId();
  const atLimit = max !== undefined && value.length >= max;

  const add = () => {
    const link = toLink(draft);
    if (!link) {
      setError("Enter a valid link (e.g. https://example.com/photo.jpg)");
      return;
    }
    if (value.includes(link)) {
      setError("That link is already added.");
      return;
    }
    onChange([...value, link]);
    setDraft("");
    setError(null);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault(); // don't submit the surrounding form
      add();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          id={id}
          type="url"
          inputMode="url"
          aria-label={ariaLabel}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          placeholder={placeholder}
          value={draft}
          disabled={disabled || atLimit}
          onChange={(event) => {
            setDraft(event.target.value);
            if (error) setError(null);
          }}
          onKeyDown={onKeyDown}
          className="h-11 rounded-xl"
        />
        <Button
          type="button"
          variant="outline"
          onClick={add}
          disabled={disabled || atLimit || !draft.trim()}
          aria-label="Add link"
          className="h-11 shrink-0 rounded-xl"
        >
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      {error && (
        <p id={errorId} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}

      {atLimit && (
        <p className="text-xs text-muted-foreground">
          You can add up to {max} {max === 1 ? "link" : "links"}.
        </p>
      )}

      {value.length > 0 && (
        <ul className="space-y-1.5">
          {value.map((link) => (
            <li
              key={link}
              className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm"
            >
              <Link2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate" title={link}>
                {link}
              </span>
              <button
                type="button"
                onClick={() => onChange(value.filter((item) => item !== link))}
                disabled={disabled}
                aria-label={`Remove ${link}`}
                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
