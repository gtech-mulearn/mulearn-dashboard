"use client";

import { Building2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatShortDate } from "@/lib/datetime";
import {
  useMyCompanyInvitations,
  useRespondCompanyAdminInvitation,
} from "../../hooks/use-company-admin-links";

/**
 * Pending co-admin invitations for the signed-in user. Shown wherever a
 * non-member lands on a company page; renders nothing when there are none
 * (or the lookup fails), so it never blocks the page it sits on.
 */
export function CompanyInvitationsPanel() {
  const { data: invitations = [], isError } = useMyCompanyInvitations();
  const respond = useRespondCompanyAdminInvitation();

  if (isError || invitations.length === 0) return null;

  return (
    <section
      aria-labelledby="company-invitations-heading"
      className="w-full max-w-md space-y-3 text-left"
    >
      <h3
        id="company-invitations-heading"
        className="text-sm font-semibold text-foreground"
      >
        {invitations.length === 1
          ? "You've been invited to help manage a company"
          : `You've been invited to help manage ${invitations.length} companies`}
      </h3>
      <ul className="space-y-2">
        {invitations.map((invite) => {
          const busy =
            respond.isPending && respond.variables?.linkId === invite.id;
          return (
            <li
              key={invite.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3">
                {invite.company_logo ? (
                  // biome-ignore lint/performance/noImgElement: external logo URL, next/image would require configuring all possible domains
                  <img
                    src={invite.company_logo}
                    alt=""
                    className="h-9 w-9 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <Building2
                      className="h-4 w-4 text-primary"
                      aria-hidden="true"
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {invite.company_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {invite.invited_by_name
                      ? `Invited by ${invite.invited_by_name} · `
                      : ""}
                    {formatShortDate(invite.invited_at)}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  size="sm"
                  className="gap-1"
                  disabled={busy}
                  onClick={() =>
                    respond.mutate({ linkId: invite.id, accept: true })
                  }
                >
                  <Check className="h-4 w-4" aria-hidden="true" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1"
                  disabled={busy}
                  onClick={() =>
                    respond.mutate({ linkId: invite.id, accept: false })
                  }
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                  Decline
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
