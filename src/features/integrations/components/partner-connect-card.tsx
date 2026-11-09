"use client";

import { format } from "date-fns";
import { ExternalLink, Loader2, MoreHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getApiErrorCode } from "@/api/errors";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { authorizePartner, signInPartner } from "../api";
import { useDisconnectPartner, usePartnerConnection } from "../hooks";
import { usePartnerLaunch } from "../hooks/use-partner-launch";
import { type CardState, cardState } from "../lib/card-state";
import {
  PARTNERS,
  type PartnerAccountType,
  type PartnerMeta,
  type PartnerProvider,
} from "../providers";
import type { PartnerConnection } from "../schemas";
import { LaunchStatus } from "./launch-status";
import { PartnerConsentDialog } from "./partner-consent-dialog";
import { PartnerStatusChip } from "./partner-status-chip";
import { SharedDataTable } from "./shared-data-table";

interface PartnerConnectCardProps {
  provider: PartnerProvider;
  accountType: PartnerAccountType;
  title?: string;
  className?: string;
  /** Lets each page match its own card-heading style. */
  titleClassName?: string;
}

// These errors mean "show the consent modal", not "show an error".
const CONSENT_ERRORS = new Set([
  "email_unverified",
  "consent_required",
  "consent_version_mismatch",
]);

const OWNER: Record<PartnerAccountType, string> = {
  candidate: "your",
  company: "your company's",
  college: "your college's",
};

/**
 * One partner, one row. A container query lays it out stacked in a sidebar
 * and as a single row when the page gives it the full width.
 */
export function PartnerConnectCard({
  provider,
  accountType,
  title,
  className,
  titleClassName,
}: PartnerConnectCardProps) {
  const meta = PARTNERS[provider];
  const { data: connection, isLoading } = usePartnerConnection(
    provider,
    accountType,
  );
  const launcher = usePartnerLaunch(provider, accountType, meta.isAllowedHost);
  const disconnect = useDisconnectPartner(provider, accountType);
  const [consentOpen, setConsentOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [disconnectOpen, setDisconnectOpen] = useState(false);
  const { state: launchState, launch, reset } = launcher;

  useEffect(() => {
    if (launchState.phase === "opened") setConsentOpen(false);
    if (
      launchState.phase === "error" &&
      CONSENT_ERRORS.has(getApiErrorCode(launchState.error) ?? "")
    ) {
      reset();
      setConsentOpen(true);
    }
  }, [launchState, reset]);

  // Nothing until the backend says the card applies: most people never see it,
  // and with Futuremug switched off nobody does, so a loading placeholder would
  // flash an empty Futuremug slot at everyone.
  if (isLoading || !connection) return null;
  const state = cardState(connection);
  if (state === "hidden") return null;

  const link = connection.connection;
  const working = launchState.phase === "working";
  // Pre-open a tab only when a sign-in is expected. Futuremug reviews new
  // companies and colleges, and a tab opened for a "pending" answer would only
  // flash and close; a sign-in answer then becomes a ready link instead.
  const expectsLogin = accountType === "candidate" || link?.status === "active";
  const signIn = () =>
    launch(() => signInPartner(provider, accountType), {
      preopen: expectsLogin,
    });
  const checkStatus = async () => {
    const next = await launch(() => signInPartner(provider, accountType), {
      preopen: false,
    });
    if (next.phase === "pending") {
      toast.info(`Still awaiting ${meta.name} approval.`);
    }
  };
  const authorize = (version: string) =>
    launch(() => authorizePartner(provider, accountType, version), {
      preopen: expectsLogin,
    });
  const openConsent = () => {
    reset();
    setConsentOpen(true);
  };
  const onConsentOpenChange = (open: boolean) => {
    setConsentOpen(open);
    // A used or abandoned link, or an error shown in the modal, ends with it.
    // "Pending" stays: the card keeps its View on Futuremug link.
    if (
      !open &&
      (launchState.phase === "ready" || launchState.phase === "error")
    ) {
      reset();
    }
  };

  const action = primaryAction(state, meta.name, {
    connect: openConsent,
    open: signIn,
    check: checkStatus,
  });
  const pendingUrl =
    state === "pending" && launchState.phase === "pending"
      ? launchState.pendingUrl
      : null;
  // Withdrawing is as easy as consenting (spec B §7): a live link can always be
  // disconnected, whatever the card asks for next (new terms, takeover, ...).
  const showMenu = Boolean(
    connection.can_manage && link && link.status !== "disconnected",
  );
  const showChip = Boolean(link) || state === "read_only";

  return (
    <div
      className={cn("@container rounded-2xl bg-card p-4 shadow-sm", className)}
    >
      {title ? (
        <h3
          className={cn(
            "mb-3 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
            titleClassName,
          )}
        >
          {title}
        </h3>
      ) : null}

      <div className="flex items-start gap-3 px-1 @xl:items-center">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-background">
          <meta.Mark className="h-6 w-6" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3 @xl:flex-row @xl:items-center @xl:gap-6">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-sm font-semibold">{meta.name}</span>
              {showChip ? (
                <PartnerStatusChip status={link?.status ?? null} />
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground">
              {describeState(state, connection, meta, accountType)}
            </p>
          </div>

          {action || pendingUrl ? (
            <div className="flex flex-wrap items-center gap-2 @xl:shrink-0">
              {action ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={action.onClick}
                  disabled={working}
                >
                  {working ? (
                    <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                  ) : null}
                  {action.label}
                  {action.external ? (
                    <ExternalLink
                      className="ml-1 h-3.5 w-3.5"
                      aria-hidden="true"
                    />
                  ) : null}
                </Button>
              ) : null}
              {pendingUrl ? (
                <Button asChild size="sm" variant="ghost">
                  <a
                    href={pendingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on {meta.name}
                    <ExternalLink
                      className="ml-1 h-3.5 w-3.5"
                      aria-hidden="true"
                    />
                  </a>
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>

        {showMenu ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8 shrink-0"
                aria-label={`${meta.name} options`}
                disabled={working}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setDetailsOpen(true)}>
                View shared details
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => setDisconnectOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                Disconnect
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>

      {consentOpen ? null : (
        <LaunchStatus
          state={launchState}
          partnerName={meta.name}
          onRetry={signIn}
          onContinue={reset}
          compact
          className="mt-3"
        />
      )}

      {connection.can_manage ? (
        <PartnerConsentDialog
          open={consentOpen}
          onOpenChange={onConsentOpenChange}
          meta={meta}
          connection={connection}
          launchState={launchState}
          opensPartner={expectsLogin}
          onAuthorize={authorize}
          onRetry={signIn}
        />
      ) : null}

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Shared with {meta.name}</DialogTitle>
          </DialogHeader>
          <SharedDataTable rows={connection.shared_data_preview ?? []} />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={disconnectOpen}
        onOpenChange={setDisconnectOpen}
        variant="destructive"
        title={`Disconnect ${meta.name}?`}
        description={`µLearn will stop sharing your details with ${meta.name} and stop signing you in. Your ${meta.name} account isn't deleted; to delete it, contact ${meta.name}.`}
        confirmLabel="Disconnect"
        isPending={disconnect.isPending}
        onConfirm={() =>
          disconnect.mutate(undefined, {
            onSuccess: () => {
              setDisconnectOpen(false);
              toast.success(`Disconnected from ${meta.name}`);
            },
            onError: () =>
              toast.error("Couldn't disconnect. Please try again."),
          })
        }
      />
    </div>
  );
}

function primaryAction(
  state: CardState,
  name: string,
  handlers: { connect: () => void; open: () => void; check: () => void },
): { label: string; onClick: () => void; external?: boolean } | null {
  switch (state) {
    case "not_connected":
      return { label: "Connect", onClick: handlers.connect };
    case "disconnected":
      return { label: "Connect again", onClick: handlers.connect };
    case "needs_consent":
      return { label: "Review updated terms", onClick: handlers.connect };
    case "takeover":
      return { label: "Authorize to take over", onClick: handlers.connect };
    case "consented":
      return {
        label: `Continue to ${name}`,
        onClick: handlers.open,
        external: true,
      };
    case "active":
      return { label: `Open ${name}`, onClick: handlers.open, external: true };
    case "pending":
      return { label: "Check status", onClick: handlers.check };
    default:
      return null;
  }
}

/** One line per state, in our words; the chip carries the status itself. */
function describeState(
  state: CardState,
  connection: PartnerConnection,
  meta: PartnerMeta,
  accountType: PartnerAccountType,
): string {
  const name = meta.name;
  const owner = OWNER[accountType];
  const lastOpened = connection.connection?.last_login_at;
  switch (state) {
    case "active":
      return lastOpened
        ? `Last opened ${format(new Date(lastOpened), "d MMM yyyy")}`
        : `Open ${name} straight from µLearn.`;
    case "pending":
      return `${name} is reviewing ${owner} account. You can open it once they approve.`;
    case "consented":
      return `Finish connecting to open ${name}.`;
    case "blocked":
    case "rejected":
      return `${name} has ${state} this account. Contact ${name} support.`;
    case "needs_consent":
      return `${name} updated its terms. Review them to keep using ${name}.`;
    case "takeover":
      return `${name} lists ${connection.connection?.contact_name ?? "someone else"} as ${owner} contact.`;
    case "disconnected":
      return `${owner.charAt(0).toUpperCase()}${owner.slice(1)} ${name} account still exists. Connect again to open it from µLearn.`;
    case "read_only":
      return `Managed by ${connection.managed_by ?? "your account's owner"}.`;
    case "unavailable":
      return (
        connection.eligibility?.message ??
        `${name} isn't available for this account.`
      );
    default: // not_connected
      return meta.description;
  }
}
