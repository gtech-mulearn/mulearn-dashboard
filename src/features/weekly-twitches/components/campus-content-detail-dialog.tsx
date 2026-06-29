"use client";

import { ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CampusContentItem, CampusContentType } from "../schemas";

const STATUS_COLORS: Record<string, string> = {
  upcoming: "app-status-applied",
  ongoing: "app-status-accepted",
  completed: "ig-status-cancelled",
};

const TITLES: Record<CampusContentType, string> = {
  smt: "Salt Mango Tree",
  isr: "Inspiration Station Radio",
};

interface Props {
  item: CampusContentItem | null;
  contentType: CampusContentType;
  onClose: () => void;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );
}

export function CampusContentDetailDialog({
  item,
  contentType,
  onClose,
}: Props) {
  if (!item) return null;

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex h-[100dvh] w-screen max-w-none flex-col overflow-hidden rounded-none border-0 sm:h-auto sm:w-[94vw] sm:max-w-[560px] sm:rounded-2xl sm:border">
        <DialogHeader className="pb-2">
          <DialogTitle>{TITLES[contentType]}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 overflow-y-auto p-1 pb-4">
          <Field label="Topic">{item.topic}</Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Campus">{item.campus}</Field>
            <Field label="Zone">
              <span className="capitalize">{item.zone ?? "—"}</span>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Date">{item.date}</Field>
            <Field label="Status">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[item.status] ?? ""}`}
              >
                {item.status}
              </span>
            </Field>
          </div>

          {item.description && (
            <Field label="Description">
              <p className="whitespace-pre-wrap">{item.description}</p>
            </Field>
          )}

          <Field label="Streaming Link">
            {item.link ? (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline break-all"
              >
                <ExternalLink className="h-3 w-3 shrink-0" />
                {item.link}
              </a>
            ) : (
              "—"
            )}
          </Field>
        </div>
      </DialogContent>
    </Dialog>
  );
}
