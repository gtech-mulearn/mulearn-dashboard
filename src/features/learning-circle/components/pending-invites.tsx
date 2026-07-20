"use client";

import { Check, ChevronLeft, Mail, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import { useActiveInvites, useRespondToInvite } from "../hooks";

export function PendingInvites() {
  const { activeInvites, isLoading } = useActiveInvites();
  const respondToInvite = useRespondToInvite();

  const handleRespond = (id: string, isAccepted: boolean) => {
    respondToInvite.mutate({ id, action: isAccepted ? "accept" : "reject" });
  };

  const filteredInvites = activeInvites;

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
          <Spinner className="relative h-6 w-6 text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="space-y-6"
      style={{
        fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
        fontFeatureSettings: "'cv02', 'cv03', 'cv04'",
      }}
    >
      {/* Header */}
      <div>
        <Link
          href="/dashboard/learning-circle"
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-[13px] font-medium text-muted-foreground
            transition-all duration-200 hover:bg-muted hover:text-foreground hover:border-border"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back to Circles
        </Link>
        <h1 className="mt-4 text-[24px] font-bold tracking-[-0.02em] text-foreground">
          My Invitations
        </h1>
        <p className="mt-1 text-[14px] text-muted-foreground">
          Pending circle invitations for you
        </p>
      </div>

      {filteredInvites.length === 0 ? (
        <div className="lc-fade-in flex flex-col items-center justify-center rounded-2xl bg-muted px-8 py-20 text-center">
          <Image
            src="/images/illustrations/no-tasks.svg"
            alt="No pending invitations"
            width={1536}
            height={1024}
            className="h-auto w-full max-w-80 mb-3.5"
          />
          <p className="text-[15px] font-semibold text-foreground">
            No Pending Invitations
          </p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            You don&apos;t have any pending circle invitations.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredInvites.map((invite, index) => {
            const inviteKey =
              invite.id || invite.link_id || `pending-invite-${index}`;
            const targetId = invite.link_id || invite.id || "";
            let inviterName = "";
            if (invite.invited_by) {
              if (typeof invite.invited_by === "object") {
                inviterName = invite.invited_by.full_name || "Unknown";
              } else {
                inviterName = invite.invited_by;
              }
            }

            return (
              <div
                key={String(inviteKey)}
                className="flex items-center justify-between rounded-xl bg-card px-4 py-3.5
                  border border-border
                  shadow-[0_1px_3px_rgba(0,0,0,0.04)]
                  transition-all duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]
                  lc-slide-up"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 shrink-0">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-foreground">
                      Learning Circle
                      {invite.circle_name ||
                      invite.circle_title ||
                      invite.circle ||
                      invite.title
                        ? ` - ${invite.circle_name || invite.circle_title || invite.circle || invite.title}`
                        : ""}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
                      {inviterName && (
                        <span>
                          Invited by{" "}
                          <span className="font-semibold text-foreground">
                            {inviterName}
                          </span>
                        </span>
                      )}
                      {inviterName && invite.created_at && <span>•</span>}
                      {invite.created_at && (
                        <span>
                          {new Date(invite.created_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-destructive
                      transition-all duration-150 hover:bg-destructive/10 active:scale-95
                      disabled:opacity-40"
                    onClick={() => handleRespond(String(targetId), false)}
                    disabled={respondToInvite.isPending}
                    title="Reject"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-success
                      transition-all duration-150 hover:bg-success/10 active:scale-95
                      disabled:opacity-40"
                    onClick={() => handleRespond(String(targetId), true)}
                    disabled={respondToInvite.isPending}
                    title="Accept"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
