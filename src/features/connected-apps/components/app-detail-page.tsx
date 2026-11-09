/**
 * One connected app: details, settings, and enable / disable.
 *
 * 📍 src/features/connected-apps/components/app-detail-page.tsx
 */

"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { StateDisplay } from "@/components/ui/state-display";
import { Textarea } from "@/components/ui/textarea";
import { getApiResponseError } from "@/hooks/use-get-error";
import {
  useConnectedApp,
  useSetConnectedAppEnabled,
  useUpdateConnectedApp,
} from "../hooks";
import { type ConnectedApp, toFormValues, toUpdatePayload } from "../schemas";
import {
  APPS_BASE,
  CopyButton,
  KindBadge,
  StatusBadge,
  formatDate,
  isNotFound,
} from "./app-parts";
import { ClientForm } from "./client-form";

function DisableAppDialog({
  app,
  open,
  onOpenChange,
  pending,
  onConfirm,
}: {
  app: ConnectedApp;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pending: boolean;
  onConfirm: (reason: string) => void;
}) {
  const [typed, setTyped] = useState("");
  const [reason, setReason] = useState("");
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setTyped("");
          setReason("");
        }
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Disable {app.name}?</DialogTitle>
          <DialogDescription>
            Everyone signed in through this app is signed out now: µLearn
            revokes every token it holds. Nobody can sign in through it until
            you enable it again. The registration itself is kept.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="disable-confirm">
              Type <code className="font-mono">{app.client_id}</code> to confirm
            </Label>
            <Input
              id="disable-confirm"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              className="font-mono"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="disable-reason">
              Reason (kept in the audit log)
            </Label>
            <Textarea
              id="disable-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. the client secret leaked"
              maxLength={500}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={typed !== app.client_id || pending}
            onClick={() => onConfirm(reason.trim())}
          >
            {pending ? "Disabling…" : "Disable app"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Detail({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-1 py-2 sm:grid-cols-3">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm sm:col-span-2">{children}</dd>
    </div>
  );
}

export function AppDetailPage({ clientId }: { clientId: string }) {
  const { data: app, isLoading, error, refetch } = useConnectedApp(clientId);
  const update = useUpdateConnectedApp(clientId);
  const setEnabled = useSetConnectedAppEnabled(clientId);
  const [disableOpen, setDisableOpen] = useState(false);
  const [enableOpen, setEnableOpen] = useState(false);

  const back = (
    <Link
      href={APPS_BASE}
      className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ChevronLeft className="h-4 w-4" />
      Back to Connected apps
    </Link>
  );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 py-6">
        {back}
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }
  if (error || !app) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 py-6">
        {back}
        {isNotFound(error) ? (
          <StateDisplay
            variant="not-found"
            title="No app with this client ID"
            description={`Nothing is registered as "${clientId}".`}
          />
        ) : (
          <StateDisplay
            variant="no-results"
            title="Couldn't load the app"
            description={getApiResponseError(error, {
              fallback: "The sign-in service didn't answer.",
            })}
            action={
              <Button variant="outline" onClick={() => refetch()}>
                Try again
              </Button>
            }
          />
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-6">
      {back}
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold tracking-tight">{app.name}</h1>
        <KindBadge app={app} />
        <StatusBadge app={app} />
      </div>

      <section className="rounded-xl border bg-card p-6">
        <h2 className="mb-2 text-lg font-semibold">Details</h2>
        <dl className="divide-y">
          <Detail label="Client ID">
            <span className="inline-flex items-center gap-1">
              <code className="font-mono">{app.client_id}</code>
              <CopyButton value={app.client_id} label="Client ID" />
            </span>
          </Detail>
          <Detail label="Type">
            {app.client_type === "confidential"
              ? "Confidential: signs in with a client secret"
              : "Public: no secret, PKCE only"}
          </Detail>
          <Detail label="Consent">
            {app.skip_authorization
              ? "First-party: people are never asked to approve it"
              : "Partner: people approve it once, and it gets name and email only"}
          </Detail>
          <Detail label="Signs tokens with">{app.algorithm ?? "RS256"}</Detail>
          <Detail label="Registered">{formatDate(app.created)}</Detail>
          <Detail label="Last changed">{formatDate(app.updated)}</Detail>
          {app.disabled_at && (
            <Detail label="Disabled since">
              {formatDate(app.disabled_at)}
            </Detail>
          )}
        </dl>
      </section>

      <section className="rounded-xl border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Settings</h2>
        <ClientForm
          key={app.updated ?? ""}
          mode="edit"
          defaultValues={toFormValues(app)}
          submitLabel="Save changes"
          submitting={update.isPending}
          onSubmit={async (values) => {
            await update.mutateAsync(toUpdatePayload(values));
          }}
        />
      </section>

      <section
        className={`rounded-xl border p-6 ${app.disabled_at ? "bg-card" : "border-destructive/40 bg-destructive/5"}`}
      >
        {app.disabled_at ? (
          <>
            <h2 className="text-lg font-semibold">Disabled</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Nobody can sign in through this app. Enabling it lets people sign
              in again; tokens revoked when it was disabled stay revoked.
            </p>
            <Button className="mt-4" onClick={() => setEnableOpen(true)}>
              Enable app
            </Button>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold">Disable this app</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Use this if the app is compromised or retired. It signs everyone
              out of it at once. Apps are never deleted, so a client ID can't be
              reused.
            </p>
            <Button
              variant="destructive"
              className="mt-4"
              onClick={() => setDisableOpen(true)}
            >
              Disable app
            </Button>
          </>
        )}
      </section>

      <DisableAppDialog
        app={app}
        open={disableOpen}
        onOpenChange={setDisableOpen}
        pending={setEnabled.isPending}
        onConfirm={(reason) =>
          setEnabled.mutate(
            { enabled: false, reason: reason || undefined },
            { onSuccess: () => setDisableOpen(false) },
          )
        }
      />
      <ConfirmDialog
        open={enableOpen}
        onOpenChange={setEnableOpen}
        title={`Enable ${app.name}?`}
        description="People can sign in through this app again."
        confirmLabel="Enable"
        variant="default"
        isPending={setEnabled.isPending}
        onConfirm={() =>
          setEnabled.mutate(
            { enabled: true },
            { onSuccess: () => setEnableOpen(false) },
          )
        }
      />
    </div>
  );
}
