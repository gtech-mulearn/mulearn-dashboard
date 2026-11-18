"use client";

import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { StateDisplay } from "@/components/ui/state-display";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getApiResponseError } from "@/hooks/use-get-error";
import { useActivityLog } from "../../hooks";
import type { ActivityLogEntry } from "../../schemas";
import { ACTIVITY_ACTIONS } from "../../schemas";
import { audienceText, roleLabel } from "./activity-log-format";
import { ActivityLogDetailSheet } from "./activity-log-detail-sheet";

const PER_PAGE = 20;
const ALL_ACTIONS = "all";

export function ActivityLogCard() {
  const [pageIndex, setPageIndex] = useState(1);
  const [action, setAction] = useState(ALL_ACTIONS);
  const [actorDraft, setActorDraft] = useState("");
  const [actor, setActor] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selected, setSelected] = useState<ActivityLogEntry | null>(null);

  const { data, isLoading, isError, error, refetch } = useActivityLog({
    pageIndex,
    perPage: PER_PAGE,
    action: action === ALL_ACTIONS ? undefined : action,
    actor: actor || undefined,
    from: from || undefined,
    to: to || undefined,
  });
  const entries = data?.data ?? [];
  const pagination = data?.pagination;
  const hasFilters = action !== ALL_ACTIONS || !!actor || !!from || !!to;

  function changeFilter(apply: () => void) {
    apply();
    setPageIndex(1);
  }

  /** Trim and lower-case the muid, then filter (a no-op if unchanged). */
  function applyActor(raw: string) {
    const next = raw.trim().toLowerCase();
    if (next === actor) return;
    changeFilter(() => setActor(next));
  }

  function clearFilters() {
    setAction(ALL_ACTIONS);
    setActorDraft("");
    setActor("");
    setFrom("");
    setTo("");
    setPageIndex(1);
  }

  return (
    <Card>
      <CardHeader className="space-y-3">
        <CardTitle className="text-base">Activity log</CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={action}
            onValueChange={(v) => changeFilter(() => setAction(v))}
          >
            <SelectTrigger className="w-60" aria-label="Action">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_ACTIONS}>All actions</SelectItem>
              {ACTIVITY_ACTIONS.map((a) => (
                <SelectItem key={a.value} value={a.value}>
                  {a.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            className="w-44"
            placeholder="Actor muid"
            aria-label="Actor muid"
            value={actorDraft}
            onChange={(e) => {
              setActorDraft(e.target.value);
              if (e.target.value.trim() === "") applyActor("");
            }}
            onBlur={() => applyActor(actorDraft)}
            onKeyDown={(e) => {
              if (e.key === "Enter") applyActor(actorDraft);
            }}
          />
          <Input
            type="date"
            className="w-40"
            aria-label="From date"
            value={from}
            onChange={(e) => changeFilter(() => setFrom(e.target.value))}
          />
          <Input
            type="date"
            className="w-40"
            aria-label="To date"
            value={to}
            onChange={(e) => changeFilter(() => setTo(e.target.value))}
          />
        </div>
        <p className="text-xs text-muted-foreground">Dates are in UTC.</p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {["sk-1", "sk-2", "sk-3"].map((id) => (
              <Skeleton key={id} className="h-10 w-full rounded" />
            ))}
          </div>
        ) : isError ? (
          <StateDisplay
            variant="no-results"
            title="Couldn't load the activity log."
            description={getApiResponseError(error, {
              fallback: "Something went wrong. Try again.",
            })}
            action={
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            }
          />
        ) : entries.length === 0 ? (
          hasFilters ? (
            <StateDisplay
              variant="no-results"
              title="No activity matches these filters"
              action={
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <StateDisplay variant="no-results" title="Nothing logged yet." />
          )
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Who</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>What</TableHead>
                  <TableHead>Audience</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow
                    key={entry.id}
                    className="cursor-pointer"
                    tabIndex={0}
                    onClick={() => setSelected(entry)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelected(entry);
                      }
                    }}
                  >
                    <TableCell className="whitespace-nowrap text-sm">
                      <span title={new Date(entry.created_at).toLocaleString()}>
                        {formatDistanceToNow(new Date(entry.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-1.5 text-sm">
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
                    </TableCell>
                    <TableCell className="text-sm">{entry.label}</TableCell>
                    <TableCell className="max-w-64 truncate text-sm">
                      {entry.title ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {audienceText(entry)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-3 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination?.isPrev}
                onClick={() => setPageIndex((p) => Math.max(1, p - 1))}
              >
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination?.isNext}
                onClick={() => setPageIndex((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </CardContent>
      <ActivityLogDetailSheet
        entry={selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      />
    </Card>
  );
}
