"use client";

import { CheckCircle2, Plus, ShieldCheck, XCircle } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { StateDisplay } from "@/components/ui/state-display";
import { Textarea } from "@/components/ui/textarea";
import {
  useCompanyMentorNominations,
  useVerifyCompanyMentor,
} from "@/features/company-jobs/hooks/use-mentor-nominate";
import { MentorGrantsSheet } from "@/features/mentor/admin/components/mentor-grants-sheet";
import { NominateMentorModal } from "./nominate-mentor-modal";

interface NominationLike {
  id: string;
  user_name?: string | null;
  user_email?: string | null;
  org_name?: string | null;
  status?: string | null;
  reason?: string | null;
  verification_note?: string | null;
  mentor_tier?: string | null;
  verified_at?: string | null;
}

export function MentorsPage() {
  const [isNominateModalOpen, setIsNominateModalOpen] = useState(false);
  const [rejectFor, setRejectFor] = useState<NominationLike | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [grantsFor, setGrantsFor] = useState<NominationLike | null>(null);

  const { data: nominations, isLoading, error } = useCompanyMentorNominations();
  const verify = useVerifyCompanyMentor();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-destructive bg-destructive/10 text-destructive">
        Failed to load mentor nominations.
      </div>
    );
  }

  const mentorsList = (nominations || []) as NominationLike[];

  const closeReject = () => {
    setRejectFor(null);
    setRejectNote("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Company Mentors
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Nominate mentors from your organization and manage their scopes.
          </p>
        </div>
        <Button
          className="shrink-0 gap-2"
          onClick={() => setIsNominateModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Nominate Mentor
        </Button>
      </div>

      {mentorsList.length === 0 ? (
        <StateDisplay
          variant="no-results"
          className="rounded-2xl border border-dashed"
          title="No mentors nominated yet"
          description='Click "Nominate Mentor" to suggest a user from your organization.'
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {mentorsList.map((mentor) => (
            <Card key={mentor.id} className="flex flex-col h-full">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <CardTitle
                      className="text-base line-clamp-1"
                      title={mentor.user_name ?? undefined}
                    >
                      {mentor.user_name}
                    </CardTitle>
                    <CardDescription className="text-xs font-medium text-primary">
                      {mentor.user_email || "No email provided"}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      mentor.status === "APPROVED"
                        ? "default"
                        : mentor.status === "REJECTED"
                          ? "destructive"
                          : "secondary"
                    }
                    className="capitalize shrink-0"
                  >
                    {mentor.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between space-y-4">
                <p
                  className="text-sm text-muted-foreground line-clamp-3"
                  title={mentor.reason || undefined}
                >
                  {mentor.reason}
                </p>
                {mentor.verification_note && (
                  <div className="text-xs bg-muted/50 p-2 rounded-md text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      Note:{" "}
                    </span>
                    {mentor.verification_note}
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-2 mt-auto pt-4 border-t border-border/50">
                  <Badge variant="outline" className="text-xs">
                    Tier: {mentor.mentor_tier}
                  </Badge>
                  {mentor.verified_at && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      Verified:{" "}
                      {new Date(mentor.verified_at).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {/* §3.1: the company owner approves/rejects own nominations */}
                {mentor.status === "PENDING" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 gap-1.5"
                      disabled={verify.isPending}
                      onClick={() =>
                        verify.mutate({
                          mentorId: mentor.id,
                          status: "APPROVED",
                        })
                      }
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1.5 text-destructive"
                      disabled={verify.isPending}
                      onClick={() => setRejectFor(mentor)}
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                )}

                {mentor.status === "APPROVED" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => setGrantsFor(mentor)}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    View scopes
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <NominateMentorModal
        open={isNominateModalOpen}
        onOpenChange={setIsNominateModalOpen}
      />

      {/* Reject requires a reason the nominee will see (§3.1) */}
      <Dialog
        open={Boolean(rejectFor)}
        onOpenChange={(o) => !o && closeReject()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject nomination?</DialogTitle>
            <DialogDescription>
              Why is {rejectFor?.user_name}&apos;s nomination rejected? The
              nominee sees this note.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            rows={3}
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            placeholder="Reason for rejection…"
          />
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={closeReject}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={verify.isPending || !rejectNote.trim()}
              onClick={() => {
                if (!rejectFor) return;
                verify.mutate(
                  {
                    mentorId: rejectFor.id,
                    status: "REJECTED",
                    verification_note: rejectNote.trim(),
                  },
                  { onSuccess: closeReject },
                );
              }}
            >
              {verify.isPending ? "Rejecting…" : "Reject nomination"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* §4.1: the owning company user may view/revoke this mentor's grants */}
      <MentorGrantsSheet
        mentorId={grantsFor?.id ?? ""}
        mentorName={grantsFor?.user_name ?? ""}
        employer={grantsFor?.org_name}
        open={Boolean(grantsFor)}
        onOpenChange={(v) => !v && setGrantsFor(null)}
      />
    </div>
  );
}
