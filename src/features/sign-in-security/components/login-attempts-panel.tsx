/**
 * Recent sign-in attempts, newest first, with "Load older".
 *
 * 📍 src/features/sign-in-security/components/login-attempts-panel.tsx
 */

"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getApiResponseError } from "@/hooks/use-get-error";
import { useLoginAttempts } from "../hooks";
import type { LoginAttemptFilters } from "../schemas";

const RESULTS: { value: LoginAttemptFilters["result"]; label: string }[] = [
  { value: "", label: "All" },
  { value: "success", label: "Succeeded" },
  { value: "failure", label: "Failed" },
];

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });

export function LoginAttemptsPanel() {
  const [draft, setDraft] = useState<LoginAttemptFilters>({
    identifier: "",
    result: "",
  });
  const [filters, setFilters] = useState<LoginAttemptFilters>({
    identifier: "",
    result: "",
  });
  const {
    data,
    isLoading,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useLoginAttempts(filters);
  const rows = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <section className="space-y-4 rounded-xl border bg-card p-6">
      <div>
        <h2 className="text-lg font-semibold">Recent sign-ins</h2>
        <p className="text-sm text-muted-foreground">
          Every attempt, on every sign-in path, newest first.
        </p>
      </div>

      <form
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          setFilters({ ...draft, identifier: draft.identifier.trim() });
        }}
      >
        <div className="flex-1 space-y-2">
          <Label htmlFor="attempts-identifier">Email or µID</Label>
          <Input
            id="attempts-identifier"
            value={draft.identifier}
            onChange={(e) => setDraft({ ...draft, identifier: e.target.value })}
            placeholder="exact match"
            spellCheck={false}
          />
        </div>
        <fieldset className="flex gap-1">
          <legend className="sr-only">Result</legend>
          {RESULTS.map((r) => (
            <Button
              key={r.value || "all"}
              type="button"
              variant={draft.result === r.value ? "default" : "outline"}
              aria-pressed={draft.result === r.value}
              onClick={() => setDraft({ ...draft, result: r.value })}
            >
              {r.label}
            </Button>
          ))}
        </fieldset>
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : error ? (
        <p className="text-sm text-destructive">
          {getApiResponseError(error, {
            fallback: "Couldn't load sign-in attempts.",
          })}
        </p>
      ) : rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No sign-ins match
        </p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Who</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead className="hidden sm:table-cell">Method</TableHead>
                  <TableHead className="hidden md:table-cell">From</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((a) => (
                  // created_at has microseconds, so these four fields identify one attempt.
                  <TableRow
                    key={`${a.created_at}|${a.identifier}|${a.status}|${a.ip_address ?? ""}`}
                  >
                    <TableCell className="whitespace-nowrap text-sm">
                      {when(a.created_at)}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {a.identifier}
                    </TableCell>
                    <TableCell>
                      {a.succeeded ? (
                        <Badge className="border-emerald-500/30 bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400">
                          Succeeded
                        </Badge>
                      ) : (
                        <span className="flex flex-col items-start gap-0.5">
                          <Badge variant="destructive">Failed</Badge>
                          {a.status && a.status !== "Failure" && (
                            <span className="text-xs text-muted-foreground">
                              {a.status}
                            </span>
                          )}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="hidden text-sm sm:table-cell">
                      {a.type ?? "—"}
                    </TableCell>
                    <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                      {[
                        a.ip_address,
                        [a.browser, a.os].filter(Boolean).join(" on "),
                        [a.city, a.country].filter(Boolean).join(", "),
                      ]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {hasNextPage && (
            <Button
              variant="outline"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? "Loading…" : "Load older"}
            </Button>
          )}
        </>
      )}
    </section>
  );
}
