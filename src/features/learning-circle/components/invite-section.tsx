/**
 * Unified Invite & Join Requests Manager Component
 *
 * 📍 src/features/learning-circle/components/invite-section.tsx
 *
 * Studio-quality unified component combining invite sending, outgoing sent invites,
 * and incoming join requests with tabbed navigation and refined styling.
 */

"use client";

import { Check, Mail, Search, Send, UserCheck, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { type UserResult, useSearch } from "@/hooks/use-search";
import {
  type CirclePermissions,
  useJoinRequests,
  useRespondToJoinRequest,
  useRevokeInvite,
  useSendInvite,
  useSentInvites,
} from "../hooks";

interface InviteProps {
  circleId: string;
}

export interface InviteManagerCardProps {
  circleId: string;
  permissions?: CirclePermissions;
}

function getInitials(name: string): string {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function InviteSearchForm({
  onSubmit,
  isPending,
}: {
  onSubmit: (muid: string) => void;
  isPending: boolean;
}) {
  const [selectedUser, setSelectedUser] = useState<UserResult | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const {
    query: searchQuery,
    results: searchResults,
    isLoading: isSearchLoading,
    handleSearch,
    clearResults,
  } = useSearch();

  const handleSelectUser = (user: UserResult) => {
    setSelectedUser(user);
    setPopoverOpen(false);
    clearResults();
  };

  const handleClearUser = () => {
    setSelectedUser(null);
    clearResults();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetMuid = selectedUser?.muid || searchQuery.trim();
    if (!targetMuid) return;
    onSubmit(targetMuid);
    handleClearUser();
  };

  return (
    <form onSubmit={handleFormSubmit} className="flex items-start gap-2 w-full">
      <div className="flex-1 min-w-0">
        <Label className="sr-only">User MUID</Label>
        {selectedUser ? (
          <div className="flex items-center justify-between p-2 px-3.5 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl shadow-xs transition-all duration-300 w-full min-w-0 h-11">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar className="h-7 w-7 shrink-0 shadow-xs">
                <AvatarImage src={selectedUser.profile_pic ?? undefined} />
                <AvatarFallback className="bg-primary/20 text-[10px] font-bold text-primary">
                  {getInitials(selectedUser.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground truncate">
                  {selectedUser.full_name}
                </p>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate flex items-center gap-1 font-mono">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary/60" />
                  {selectedUser.muid}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClearUser}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 size-7 rounded-full transition-all duration-200"
              aria-label="Remove selected user"
            >
              <X className="size-3.5" />
            </Button>
          </div>
        ) : (
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
            <Input
              id="send-muid"
              placeholder="Search user by name or MUID..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setPopoverOpen(true)}
              onBlur={() => {
                setTimeout(() => setPopoverOpen(false), 200);
              }}
              className="pl-11 h-11 bg-background/50 border-border/50 font-medium rounded-xl focus-visible:ring-brand-blue transition-all duration-200"
            />
            {isSearchLoading && (
              <Spinner className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />
            )}
            {popoverOpen && searchQuery.trim().length > 0 && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1.5 bg-card/95 backdrop-blur-md border border-border/40 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto animate-in fade-in-50 slide-in-from-top-2 duration-200">
                {searchResults.length === 0 && !isSearchLoading ? (
                  <p className="p-3 text-xs text-muted-foreground text-center">
                    No users found.
                  </p>
                ) : (
                  searchResults.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelectUser(user);
                      }}
                      className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 hover:bg-primary/5 text-left transition-colors border-b border-border/10 last:border-0 cursor-pointer"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <Avatar className="h-7 w-7 shrink-0">
                          <AvatarImage src={user.profile_pic ?? undefined} />
                          <AvatarFallback className="text-[10px] font-bold">
                            {getInitials(user.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-foreground">
                            {user.full_name}
                          </p>
                          <p className="text-[11px] text-muted-foreground font-mono">
                            @{user.muid}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <Button
        type="submit"
        disabled={(!selectedUser && !searchQuery.trim()) || isPending}
        className="h-11 px-4 gap-1.5 rounded-xl font-semibold text-[13px] shrink-0 cursor-pointer"
      >
        {isPending ? (
          <Spinner className="h-4 w-4" />
        ) : (
          <>
            <Send className="h-3.5 w-3.5" />
            <span>Send</span>
          </>
        )}
      </Button>
    </form>
  );
}

/**
 * Single unified card component for managing all circle invitations & join requests
 */
export function InviteManagerCard({
  circleId,
  permissions,
}: InviteManagerCardProps) {
  const [activeTab, setActiveTab] = useState<"sent" | "requests">("sent");
  const sendInvite = useSendInvite(circleId);
  const revokeInvite = useRevokeInvite(circleId);

  const canManageRequests = permissions
    ? permissions.role === "owner" || permissions.role === "lead"
    : true;

  const { data: sentInvites, isLoading: isSentLoading } =
    useSentInvites(circleId);
  const { data: joinRequests = [], isLoading: isRequestsLoading } =
    useJoinRequests(circleId, canManageRequests);
  const respondToRequest = useRespondToJoinRequest(circleId);

  const handleSend = (targetMuid: string) => {
    sendInvite.mutate(
      { muid: targetMuid },
      {
        onSuccess: () => {
          setActiveTab("sent");
        },
      },
    );
  };

  return (
    <div className="w-full rounded-2xl bg-card p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-border flex flex-col gap-5">
      {/* ── Header ── */}
      <div className="flex flex-col gap-1">
        <h3 className="text-[16px] font-bold text-foreground">
          Invitations & Requests
        </h3>
        <p className="text-[12px] text-muted-foreground font-medium">
          Send invites by MUID and manage incoming requests.
        </p>
      </div>

      {/* ── Send Invite Input ── */}
      {permissions?.canSendInvites !== false && (
        <InviteSearchForm
          onSubmit={handleSend}
          isPending={sendInvite.isPending}
        />
      )}

      {/* ── Segmented Tabs Navigation ── */}
      <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted/60 p-1 border border-border/40 w-full">
        <button
          type="button"
          onClick={() => setActiveTab("sent")}
          className={`flex items-center justify-center gap-1.5 rounded-lg py-2 px-1.5 sm:px-2 text-[11.5px] font-semibold transition-all duration-200 cursor-pointer ${
            activeTab === "sent"
              ? "bg-card text-foreground shadow-xs border border-border/50 font-bold"
              : "text-muted-foreground hover:text-foreground hover:bg-card/40"
          }`}
        >
          <Mail className="h-3.5 w-3.5 shrink-0" />
          <span className="whitespace-nowrap">Sent Invites</span>
          {sentInvites && sentInvites.length > 0 && (
            <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-warning/20 text-warning px-1 text-[9.5px] font-bold leading-none shrink-0">
              {sentInvites.length}
            </span>
          )}
        </button>

        {canManageRequests ? (
          <button
            type="button"
            onClick={() => setActiveTab("requests")}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 px-1.5 sm:px-2 text-[11.5px] font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === "requests"
                ? "bg-card text-foreground shadow-xs border border-border/50 font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-card/40"
            }`}
          >
            <UserCheck className="h-3.5 w-3.5 shrink-0" />
            <span className="whitespace-nowrap">Join Requests</span>
            {joinRequests.length > 0 && (
              <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-warning/20 text-warning px-1 text-[9.5px] font-bold leading-none shrink-0">
                {joinRequests.length}
              </span>
            )}
          </button>
        ) : null}
      </div>

      {/* ── Tab 1: Sent Invites ── */}
      {activeTab === "sent" && (
        <div>
          {isSentLoading ? (
            <div className="flex items-center justify-center py-6">
              <Spinner className="h-5 w-5 text-primary" />
            </div>
          ) : !sentInvites || sentInvites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="mb-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Mail className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-[13px] font-semibold text-foreground">
                No invites sent yet
              </p>
              <p className="mt-0.5 text-[12px] text-muted-foreground">
                Enter an MUID above to send an invitation
              </p>
            </div>
          ) : (
            <div className="max-h-[260px] overflow-y-auto pr-1 space-y-2">
              {sentInvites.map((invite, index) => {
                const inviteKey =
                  invite.id || invite.link_id || `sent-invite-${index}`;
                const linkId =
                  invite.link_id || invite.id || invite.user_id || invite.muid;
                const isAccepted =
                  invite.status?.toLowerCase() === "accepted" ||
                  invite.is_accepted === true ||
                  invite.is_accepted === "true" ||
                  invite.is_accepted === "Accepted" ||
                  invite.is_accepted === "accepted" ||
                  invite.is_accepted === 1 ||
                  invite.is_accepted === "1";
                const isRejected =
                  invite.status?.toLowerCase() === "rejected" ||
                  invite.status?.toLowerCase() === "revoked" ||
                  invite.is_accepted === false ||
                  invite.is_accepted === "false" ||
                  invite.is_accepted === "Rejected" ||
                  invite.is_accepted === "rejected" ||
                  invite.is_accepted === "Revoked" ||
                  invite.is_accepted === "revoked" ||
                  invite.is_accepted === 0 ||
                  invite.is_accepted === "0" ||
                  invite.is_accepted === -1 ||
                  invite.is_accepted === "-1";

                let displayName = invite.full_name || "Unknown";
                if (!invite.full_name) {
                  if (invite.muid) {
                    displayName = invite.muid;
                  } else if (invite.user) {
                    if (typeof invite.user === "object") {
                      displayName =
                        invite.user.full_name ||
                        invite.user.user_id ||
                        "Unknown";
                    } else {
                      displayName = invite.user;
                    }
                  }
                }

                const userMuid =
                  invite.muid ||
                  (typeof invite.user === "object"
                    ? invite.user?.user_id
                    : undefined);
                const profilePic =
                  invite.profile_pic ||
                  (typeof invite.user === "object"
                    ? invite.user?.profile_pic
                    : null);
                const inviteDate = invite.invited_at || invite.created_at;

                return (
                  <div
                    key={String(inviteKey)}
                    className="flex items-center justify-between gap-2 rounded-xl border border-warning/20 bg-warning/5 px-3.5 py-2.5 transition-all duration-200"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="relative h-8 w-8 shrink-0">
                        {profilePic ? (
                          <Image
                            src={profilePic}
                            alt={displayName}
                            fill
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#6366F1] to-[#4F46E5] text-[12px] font-bold text-primary-foreground">
                            {displayName.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-semibold text-foreground">
                          {displayName}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {userMuid ||
                            (inviteDate
                              ? `Sent ${new Date(inviteDate).toLocaleDateString()}`
                              : "")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          isAccepted
                            ? "bg-success/10 text-success"
                            : isRejected
                              ? "bg-destructive/10 text-destructive"
                              : "bg-warning/10 text-warning"
                        }`}
                      >
                        {isAccepted
                          ? "Accepted"
                          : isRejected
                            ? invite.status?.toLowerCase() === "revoked"
                              ? "Revoked"
                              : "Rejected"
                            : "Pending"}
                      </span>
                      {!isAccepted && !isRejected && linkId && (
                        <button
                          type="button"
                          onClick={() => revokeInvite.mutate(String(linkId))}
                          disabled={revokeInvite.isPending}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-destructive/10 text-destructive transition-colors hover:bg-destructive/20 active:scale-95 disabled:opacity-40 cursor-pointer"
                          title="Revoke invitation"
                        >
                          {revokeInvite.isPending ? (
                            <Spinner className="h-3 w-3" />
                          ) : (
                            <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Tab 2: Incoming Join Requests ── */}
      {activeTab === "requests" && canManageRequests && (
        <div>
          {isRequestsLoading ? (
            <div className="flex items-center justify-center py-6">
              <Spinner className="h-5 w-5 text-warning" />
            </div>
          ) : joinRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="mb-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-[13px] font-semibold text-foreground">
                No pending join requests
              </p>
              <p className="mt-0.5 text-[12px] text-muted-foreground">
                Incoming requests to join your circle will appear here
              </p>
            </div>
          ) : (
            <div className="max-h-[260px] overflow-y-auto pr-1 space-y-2">
              {joinRequests.map((req) => (
                <div
                  key={req.link_id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-warning/20 bg-warning/5 px-3.5 py-2.5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="relative h-8 w-8 shrink-0">
                      {req.profile_pic ? (
                        <Image
                          src={req.profile_pic}
                          alt={req.full_name}
                          fill
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#6366F1] to-[#4F46E5] text-[12px] font-bold text-primary-foreground">
                          {req.full_name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold text-foreground">
                        {req.full_name}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {req.muid}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        respondToRequest.mutate({
                          link_id: req.link_id,
                          action: "accept",
                        })
                      }
                      disabled={respondToRequest.isPending}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-success/10 text-success transition-colors hover:bg-success/20 active:scale-95 disabled:opacity-40"
                      title="Accept request"
                    >
                      <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        respondToRequest.mutate({
                          link_id: req.link_id,
                          action: "reject",
                        })
                      }
                      disabled={respondToRequest.isPending}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-destructive/10 text-destructive transition-colors hover:bg-destructive/20 active:scale-95 disabled:opacity-40"
                      title="Reject request"
                    >
                      <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Backward compatibility exports */
export function SentInvitesCard(props: InviteManagerCardProps) {
  return <InviteManagerCard {...props} />;
}

export function InviteMemberForm({
  circleId,
  onSent,
}: InviteProps & { onSent?: () => void }) {
  const sendInvite = useSendInvite(circleId);

  const handleSend = (targetMuid: string) => {
    sendInvite.mutate(
      { muid: targetMuid },
      {
        onSuccess: () => {
          onSent?.();
        },
      },
    );
  };

  return (
    <InviteSearchForm onSubmit={handleSend} isPending={sendInvite.isPending} />
  );
}
