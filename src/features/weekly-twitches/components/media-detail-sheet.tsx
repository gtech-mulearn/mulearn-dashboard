"use client";

import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type {
  CampusContentItem,
  ContentStatus,
  OfficeHoursItem,
} from "../schemas";

const STATUS_CLASSES: Record<ContentStatus, string> = {
  upcoming: "app-status-applied",
  ongoing: "app-status-accepted",
  completed: "ig-status-cancelled",
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );
}

function LinkField({ label, href }: { label: string; href?: string | null }) {
  return (
    <Field label={label}>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 break-all text-primary hover:underline"
        >
          <ExternalLink className="h-3 w-3 shrink-0" />
          {href}
        </a>
      ) : (
        <span className="text-muted-foreground">—</span>
      )}
    </Field>
  );
}

function formatDate(date: string): string {
  try {
    return new Date(date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return date;
  }
}

// ─── Office Hours Sheet ───────────────────────────────────────────────────────

interface OfficeHoursSheetProps {
  item: OfficeHoursItem | null;
  onClose: () => void;
}

export function OfficeHoursDetailSheet({
  item,
  onClose,
}: OfficeHoursSheetProps) {
  return (
    <Sheet open={!!item} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader className="pb-2">
          <SheetTitle>Office Hours</SheetTitle>
        </SheetHeader>

        {item && (
          <div className="flex flex-col gap-5 px-4 pb-8">
            <Field label="Title">{item.title}</Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Date">{formatDate(item.date)}</Field>
              <Field label="Status">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_CLASSES[item.status] ?? ""}`}
                >
                  {item.status}
                </span>
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Performer">{item.performer ?? "—"}</Field>
              <Field label="Designation">{item.designation ?? "—"}</Field>
            </div>

            {item.description ? (
              <Field label="Description">
                <p className="whitespace-pre-wrap leading-relaxed">
                  {item.description}
                </p>
              </Field>
            ) : null}

            <LinkField label="Meeting Link" href={item.link} />

            <Field label="Interest Groups">
              {item.interest_groups?.length ? (
                <div className="flex flex-wrap gap-1">
                  {item.interest_groups.map((ig) => (
                    <Badge key={ig} variant="secondary">
                      {ig}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </Field>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ─── Campus Content Sheet (SMT + Inspiration Station) ────────────────────────

const CAMPUS_TITLES = {
  smt: "Salt Mango Tree",
  isr: "Inspiration Station Radio",
} as const;

interface CampusContentSheetProps {
  item: CampusContentItem | null;
  contentType: "smt" | "isr";
  onClose: () => void;
}

export function CampusContentDetailSheet({
  item,
  contentType,
  onClose,
}: CampusContentSheetProps) {
  return (
    <Sheet open={!!item} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader className="pb-2">
          <SheetTitle>{CAMPUS_TITLES[contentType]}</SheetTitle>
        </SheetHeader>

        {item && (
          <div className="flex flex-col gap-5 px-4 pb-8">
            <Field label="Topic">{item.topic}</Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Campus">{item.campus}</Field>
              <Field label="Zone">
                <span className="capitalize">{item.zone ?? "—"}</span>
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Date">{formatDate(item.date)}</Field>
              <Field label="Status">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_CLASSES[item.status] ?? ""}`}
                >
                  {item.status}
                </span>
              </Field>
            </div>

            {item.description ? (
              <Field label="Description">
                <p className="whitespace-pre-wrap leading-relaxed">
                  {item.description}
                </p>
              </Field>
            ) : null}

            <LinkField label="Streaming Link" href={item.link} />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
