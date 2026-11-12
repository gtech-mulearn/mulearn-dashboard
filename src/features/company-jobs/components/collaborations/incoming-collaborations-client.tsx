"use client";

import { Handshake, Inbox } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { formatShortDate } from "@/lib/datetime";
import {
  useDiscoverCollaborations,
  useIncomingCollaborations,
  useRespondCollaboration,
} from "../../hooks/use-company-collaborations";
import { useLeadTargets } from "../../hooks/use-lead-targets";
import { COLLAB_TYPE_LABELS } from "../../lib/collaboration-payload";
import type { CompanyCollaboration } from "../../types";

function PostCard({
  post,
  actions,
}: {
  post: CompanyCollaboration;
  actions: React.ReactNode;
}) {
  return (
    <li className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 space-y-1">
        <p className="text-xs text-muted-foreground">
          {post.company_name ?? "A company"} ·{" "}
          {COLLAB_TYPE_LABELS[post.collab_type]} ·{" "}
          {formatShortDate(post.created_at)}
        </p>
        <p className="font-medium text-foreground">{post.title}</p>
        {post.description && (
          <p className="line-clamp-3 text-sm text-muted-foreground">
            {post.description}
          </p>
        )}
      </div>
      <div className="flex shrink-0 gap-2">{actions}</div>
    </li>
  );
}

/**
 * Campus and IG leads: answer companies' collaboration invites, and claim
 * open posts for a campus or IG they lead.
 */
export function IncomingCollaborationsClient() {
  const incoming = useIncomingCollaborations();
  const discover = useDiscoverCollaborations({ page: 1, perPage: 20 });
  const respond = useRespondCollaboration();
  const { targets } = useLeadTargets();

  const [declining, setDeclining] = useState<CompanyCollaboration | null>(null);
  const [reason, setReason] = useState("");
  const [claiming, setClaiming] = useState<CompanyCollaboration | null>(null);
  const [targetKey, setTargetKey] = useState("");

  const invites = incoming.data ?? [];
  const openPosts = discover.data?.data ?? [];
  const busy = (id: string) =>
    respond.isPending && respond.variables?.id === id;

  const openClaim = (post: CompanyCollaboration) => {
    setClaiming(post);
    setTargetKey(targets[0] ? `${targets[0].type}:${targets[0].orgId}` : "");
  };
  const chosenTarget = targets.find(
    (t) => `${t.type}:${t.orgId}` === targetKey,
  );

  return (
    <div className="space-y-8">
      <div data-tour-id="page:collaborations-incoming:header">
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground">
          <Handshake className="h-8 w-8 text-primary" aria-hidden="true" />
          Collaboration invites
        </h1>
        <p className="mt-1 max-w-2xl text-muted-foreground">
          Companies invite your campus or interest group to co-host events,
          sponsor activities and share mentors.
        </p>
      </div>

      <section
        aria-labelledby="invites-heading"
        className="space-y-3"
        data-tour-id="page:collaborations-incoming:invites"
      >
        <h2 id="invites-heading" className="text-lg font-semibold">
          Invitations
        </h2>
        {incoming.isLoading ? (
          <Skeleton className="h-24 w-full rounded-xl" />
        ) : invites.length === 0 ? (
          <div className="rounded-xl border border-dashed py-10 text-center">
            <Inbox
              className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50"
              aria-hidden="true"
            />
            <p className="text-sm text-muted-foreground">
              No invitations waiting for you.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {invites.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                actions={
                  <>
                    <Button
                      size="sm"
                      disabled={busy(post.id)}
                      onClick={() =>
                        respond.mutate({ id: post.id, body: { accept: true } })
                      }
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy(post.id)}
                      onClick={() => {
                        setReason("");
                        setDeclining(post);
                      }}
                    >
                      Decline
                    </Button>
                  </>
                }
              />
            ))}
          </ul>
        )}
      </section>

      {targets.length > 0 && (
        <section
          aria-labelledby="open-heading"
          className="space-y-3"
          data-tour-id="page:collaborations-incoming:open-posts"
        >
          <h2 id="open-heading" className="text-lg font-semibold">
            Open posts
          </h2>
          <p className="text-sm text-muted-foreground">
            Posts any campus or interest group can take up. Claiming one tells
            the company you&apos;re in.
          </p>
          {openPosts.length === 0 ? (
            <p className="rounded-xl border border-dashed py-8 text-center text-sm text-muted-foreground">
              No open posts right now.
            </p>
          ) : (
            <ul className="space-y-3">
              {openPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  actions={
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy(post.id)}
                      onClick={() => openClaim(post)}
                    >
                      Claim
                    </Button>
                  }
                />
              ))}
            </ul>
          )}
        </section>
      )}

      {/* Decline: optional reason the company will see */}
      <Dialog
        open={declining !== null}
        onOpenChange={(open) => !open && setDeclining(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Decline this invitation?</DialogTitle>
            <DialogDescription>
              {declining?.company_name ?? "The company"} will see your reason,
              if you give one.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="decline-reason">
              Reason{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </Label>
            <Textarea
              id="decline-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeclining(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={respond.isPending}
              onClick={() => {
                if (!declining) return;
                const trimmed = reason.trim();
                respond.mutate(
                  {
                    id: declining.id,
                    body: trimmed
                      ? { accept: false, rejection_reason: trimmed }
                      : { accept: false },
                  },
                  { onSuccess: () => setDeclining(null) },
                );
              }}
            >
              Decline
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Claim an open post for one of the user's campuses/IGs */}
      <Dialog
        open={claiming !== null}
        onOpenChange={(open) => !open && setClaiming(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Claim this collaboration</DialogTitle>
            <DialogDescription>
              Choose who takes up &ldquo;{claiming?.title}&rdquo;.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="claim-target">Claim for</Label>
            <select
              id="claim-target"
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm"
              value={targetKey}
              onChange={(e) => setTargetKey(e.target.value)}
            >
              {targets.map((t) => (
                <option
                  key={`${t.type}:${t.orgId}`}
                  value={`${t.type}:${t.orgId}`}
                >
                  {t.label} ({t.type === "CAMPUS" ? "Campus" : "Interest group"}
                  )
                </option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClaiming(null)}>
              Cancel
            </Button>
            <Button
              disabled={!chosenTarget || respond.isPending}
              onClick={() => {
                if (!claiming || !chosenTarget) return;
                respond.mutate(
                  {
                    id: claiming.id,
                    body: {
                      accept: true,
                      target_type: chosenTarget.type,
                      target_org_id: chosenTarget.orgId,
                    },
                  },
                  { onSuccess: () => setClaiming(null) },
                );
              }}
            >
              Claim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
