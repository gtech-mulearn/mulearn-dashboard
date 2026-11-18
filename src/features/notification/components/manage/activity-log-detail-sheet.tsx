"use client";

import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { ActivityLogEntry } from "../../schemas";
import { audienceText, roleLabel } from "./activity-log-format";

/** Lists longer than this show the first items plus "and N more". */
const MAX_LIST_ITEMS = 20;

function itemText(item: unknown): string {
  if (item === null || item === undefined) return "—";
  if (typeof item === "object") {
    const named = item as { title?: unknown; name?: unknown };
    if (typeof named.title === "string") return named.title;
    if (typeof named.name === "string") return named.name;
    return JSON.stringify(item);
  }
  return String(item);
}

function Value({ value }: { value: unknown }) {
  if (Array.isArray(value)) {
    if (value.length === 0) return <span>—</span>;
    const shown = value.slice(0, MAX_LIST_ITEMS);
    const more = value.length - shown.length;
    return (
      <ul className="list-disc space-y-0.5 pl-4">
        {shown.map((item, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static, read-only list
          <li key={i}>{itemText(item)}</li>
        ))}
        {more > 0 && (
          <li className="list-none text-muted-foreground">
            and {more.toLocaleString()} more
          </li>
        )}
      </ul>
    );
  }
  if (value === null || value === undefined) return <span>—</span>;
  return (
    <span>
      {typeof value === "object" ? JSON.stringify(value) : String(value)}
    </span>
  );
}

function DataColumn({
  heading,
  data,
}: {
  heading: string;
  data: Record<string, unknown> | null;
}) {
  const entries = Object.entries(data ?? {});
  return (
    <section className="min-w-0 space-y-2">
      <h3 className="text-sm font-semibold">{heading}</h3>
      {entries.length === 0 ? (
        <p className="text-xs text-muted-foreground">Nothing recorded.</p>
      ) : (
        <dl className="space-y-2">
          {entries.map(([key, value]) => (
            <div key={key}>
              <dt className="text-xs text-muted-foreground">{key}</dt>
              <dd className="break-words text-sm">
                <Value value={value} />
              </dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}

function Summary({ entry }: { entry: ActivityLogEntry }) {
  const campaign = entry.campaign ?? null;
  return (
    <div className="mx-4 space-y-2 rounded-lg border p-3 text-sm">
      <p className="font-medium break-words">{entry.title ?? "—"}</p>
      <div className="flex flex-wrap items-center gap-1.5">
        <span>{entry.actor.full_name}</span>
        <span className="text-xs text-muted-foreground">
          {entry.actor.muid}
        </span>
        {entry.roles.map((role) => (
          <Badge key={role} variant="secondary">
            {roleLabel(role)}
          </Badge>
        ))}
      </div>
      <p className="text-muted-foreground">Audience: {audienceText(entry)}</p>
      {campaign && (
        <p data-testid="campaign-summary">
          <Badge variant="outline" className="mr-2 capitalize">
            {campaign.status}
          </Badge>
          {campaign.sent_count.toLocaleString()} sent /{" "}
          {campaign.skipped_count.toLocaleString()} skipped /{" "}
          {campaign.failed_count.toLocaleString()} failed of{" "}
          {campaign.target_count.toLocaleString()}
        </p>
      )}
    </div>
  );
}

interface ActivityLogDetailSheetProps {
  entry: ActivityLogEntry | null;
  onOpenChange: (open: boolean) => void;
}

export function ActivityLogDetailSheet({
  entry,
  onOpenChange,
}: ActivityLogDetailSheetProps) {
  return (
    <Sheet open={entry !== null} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        {entry && (
          <>
            <SheetHeader>
              <SheetTitle>{entry.label}</SheetTitle>
              <SheetDescription>
                {new Date(entry.created_at).toLocaleString()}
              </SheetDescription>
            </SheetHeader>
            <Summary entry={entry} />
            <div className="grid grid-cols-1 gap-4 px-4 pb-4 sm:grid-cols-2">
              <DataColumn heading="Before" data={entry.old_data} />
              <DataColumn heading="After" data={entry.new_data} />
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
