"use client";

import { ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Hiring } from "../schemas";

interface Props {
  hiring: Hiring | null;
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

export function HiringViewDialog({ hiring, onClose }: Props) {
  if (!hiring) return null;

  return (
    <Dialog open={!!hiring} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex h-[100dvh] w-screen max-w-none flex-col overflow-hidden rounded-none border-0 sm:h-auto sm:max-h-[90vh] sm:w-[94vw] sm:max-w-[640px] sm:overflow-y-auto sm:rounded-3xl sm:border">
        <DialogHeader className="pb-2">
          <DialogTitle>{hiring.title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 overflow-y-auto p-1 pb-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Organization">{hiring.organization}</Field>
            <Field label="Role">{hiring.role}</Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Location">{hiring.location || "—"}</Field>
            <Field label="Duration">{hiring.duration || "—"}</Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Posted Date">{hiring.posted_date || "—"}</Field>
            <Field label="Last Date">{hiring.lastdate}</Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Vacancies">{hiring.vacancies ?? "—"}</Field>
            <Field label="Remuneration">{hiring.remuneration || "—"}</Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Apply Link">
              {hiring.applylink ? (
                <a
                  href={hiring.applylink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  Open
                </a>
              ) : (
                "—"
              )}
            </Field>
            <Field label="Job Description Link">
              {hiring.jdlink ? (
                <a
                  href={hiring.jdlink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  Open
                </a>
              ) : (
                "—"
              )}
            </Field>
          </div>

          {hiring.extracontent && (
            <Field label="Extra Content">
              <p className="whitespace-pre-wrap">{hiring.extracontent}</p>
            </Field>
          )}

          <div className="grid gap-4 sm:grid-cols-2 border-t border-border pt-4">
            <Field label="Created By">{hiring.created_by || "—"}</Field>
            <Field label="Updated By">{hiring.updated_by || "—"}</Field>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
