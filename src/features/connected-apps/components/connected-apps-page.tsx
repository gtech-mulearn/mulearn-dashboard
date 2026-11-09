/**
 * Connected apps: every app that may use "Sign in with µLearn".
 *
 * 📍 src/features/connected-apps/components/connected-apps-page.tsx
 */

"use client";

import { ChevronLeft, Plus, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
import { useConnectedApps } from "../hooks";
import { APPS_BASE, KindBadge, StatusBadge, formatDate } from "./app-parts";

export function ConnectedAppsPage() {
  const { data: apps, isLoading, error, refetch } = useConnectedApps();

  return (
    <div className="space-y-6 py-6">
      <Link
        href="/dashboard/management/system"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to System & Configurations
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Connected apps</h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            Apps that use "Sign in with µLearn". An app must be registered here
            before anyone can sign in to it, and disabling it signs everyone out
            of it at once.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/management/system/sign-in">
              <ShieldCheck className="mr-2 h-4 w-4" />
              Sign-in security
            </Link>
          </Button>
          <Button asChild>
            <Link href={`${APPS_BASE}/new`}>
              <Plus className="mr-2 h-4 w-4" />
              Register app
            </Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : error ? (
        <StateDisplay
          variant="no-results"
          title="Couldn't load the apps"
          description={getApiResponseError(error, {
            fallback: "The sign-in service didn't answer.",
          })}
          action={
            <Button variant="outline" onClick={() => refetch()}>
              Try again
            </Button>
          }
        />
      ) : !apps?.length ? (
        <StateDisplay
          variant="no-results"
          title="No apps are registered yet"
          description="Register the first app to let people sign in to it with their µLearn account."
          action={
            <Button asChild>
              <Link href={`${APPS_BASE}/new`}>Register app</Link>
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>App</TableHead>
                <TableHead>Kind</TableHead>
                <TableHead className="hidden md:table-cell">
                  Redirect URIs
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">
                  Registered
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apps.map((app) => (
                <TableRow
                  key={app.client_id}
                  className={app.disabled_at ? "opacity-70" : undefined}
                >
                  <TableCell>
                    <Link
                      href={`${APPS_BASE}/${encodeURIComponent(app.client_id)}`}
                      className="font-medium hover:underline"
                    >
                      {app.name}
                    </Link>
                    <div className="font-mono text-xs text-muted-foreground">
                      {app.client_id}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col items-start gap-1">
                      <KindBadge app={app} />
                      <span className="text-xs text-muted-foreground">
                        {app.client_type}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden max-w-xs md:table-cell">
                    <span
                      className="block truncate font-mono text-xs"
                      title={app.redirect_uris.join("\n")}
                    >
                      {app.redirect_uris[0] ?? "—"}
                    </span>
                    {app.redirect_uris.length > 1 && (
                      <span className="text-xs text-muted-foreground">
                        +{app.redirect_uris.length - 1} more
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge app={app} />
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                    {formatDate(app.created)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
