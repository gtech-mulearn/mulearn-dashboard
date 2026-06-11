"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, Clock, Mail, Sparkles, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useVerifyMentor } from "../hooks/use-mentor-verify";
import type { MentorApplicationListItem } from "../schemas";

// ─── Local form schemas ───────────────────────────────────────────────────────
// Approve: doc payload = { status: "APPROVED" }  (mentor_tier is frontend-only UI)
const ApproveSchema = z.object({
  mentor_tier: z.string().optional(),
});
// Reject: doc payload = { status: "REJECTED", verification_note: "..." }
const RejectSchema = z.object({
  verification_note: z.string().min(1, "Rejection note is required"),
});

type ApproveValues = z.infer<typeof ApproveSchema>;
type RejectValues = z.infer<typeof RejectSchema>;

interface MentorVerifyDialogProps {
  mentor: MentorApplicationListItem | null;
  action: "approve" | "reject";
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

// ─── Helper: resolve display name ─────────────────────────────────────────────
function getDisplayName(mentor: MentorApplicationListItem): string {
  return mentor.user_full_name ?? mentor.full_name ?? "Mentor";
}

// ─── Helper: resolve status badge ────────────────────────────────────────────
function getStatusBadge(mentor: MentorApplicationListItem) {
  const status = mentor.status;
  if (status === "APPROVED")
    return { label: "Approved", variant: "default" as const };
  if (status === "REJECTED")
    return { label: "Rejected", variant: "destructive" as const };
  return { label: "Pending", variant: "secondary" as const };
}

export function MentorVerifyDialog({
  mentor,
  action,
  open,
  onOpenChange,
}: MentorVerifyDialogProps) {
  const { mutate: verify, isPending } = useVerifyMentor();

  const approveForm = useForm<ApproveValues>({
    resolver: zodResolver(ApproveSchema),
    defaultValues: { mentor_tier: "IG_MENTOR" },
  });
  const rejectForm = useForm<RejectValues>({
    resolver: zodResolver(RejectSchema),
    defaultValues: { verification_note: "" },
  });

  const isApprove = action === "approve";

  // ─── Approve → doc payload: { status: "APPROVED" } ─────────────────────────
  function onApprove(_values: ApproveValues) {
    if (!mentor) return;
    verify(
      {
        mentorId: mentor.id,
        data: { status: "APPROVED" },
      },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  // ─── Reject → doc payload: { status: "REJECTED", verification_note: "..." } ─
  function onReject(values: RejectValues) {
    if (!mentor) return;
    verify(
      {
        mentorId: mentor.id,
        data: {
          status: "REJECTED",
          verification_note: values.verification_note,
        },
      },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  const displayName = mentor ? getDisplayName(mentor) : "Mentor";
  const initials =
    displayName
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "M";

  const appliedAt = mentor?.created_at
    ? new Date(mentor.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  const expertise = mentor?.expertise
    ? typeof mentor.expertise === "string"
      ? mentor.expertise
      : ""
    : "";

  const email = mentor?.user_email ?? mentor?.email ?? "";
  const muid = mentor?.muid ?? "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {isApprove
              ? "Approve Mentor Application"
              : "Reject Mentor Application"}
          </DialogTitle>
        </DialogHeader>

        {mentor && (
          <div className="flex-1 overflow-y-auto -mx-6 px-6 space-y-4">
            {/* Identity card */}
            <div className="rounded-lg border border-border/60 bg-muted/40 p-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12">
                  {mentor.profile_pic ? (
                    <AvatarImage src={mentor.profile_pic} alt={displayName} />
                  ) : null}
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-base">{displayName}</p>
                  {muid && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <User className="h-3 w-3" />
                      {muid}
                    </p>
                  )}
                  {email && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Mail className="h-3 w-3" />
                      {email}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground">
                  {/* Status badge */}
                  {mentor.status && (
                    <Badge variant={getStatusBadge(mentor).variant}>
                      {getStatusBadge(mentor).label}
                    </Badge>
                  )}
                  {appliedAt && (
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {appliedAt}
                    </span>
                  )}
                  {typeof mentor.hours === "number" && mentor.hours > 0 && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {mentor.hours}h committed
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Expertise */}
            {expertise && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Expertise
                  </p>
                </div>
                <p className="text-sm text-foreground">{expertise}</p>
              </div>
            )}

            {/* About */}
            {mentor.about && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                  About
                </p>
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {mentor.about}
                </p>
              </div>
            )}

            {/* Reason */}
            {mentor.reason && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                  Why they want to mentor
                </p>
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {mentor.reason}
                </p>
              </div>
            )}

            {/* Current tier (if any) */}
            {mentor.mentor_tier && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Current Tier:
                </span>
                <Badge variant="outline">{mentor.mentor_tier}</Badge>
              </div>
            )}

            {/* Previous rejection note */}
            {mentor.verification_note && (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
                <p className="text-xs font-medium text-destructive uppercase tracking-wide mb-1">
                  Previous Rejection Note
                </p>
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {mentor.verification_note}
                </p>
              </div>
            )}

            <Separator />
          </div>
        )}

        {isApprove ? (
          <Form {...approveForm}>
            <form
              onSubmit={approveForm.handleSubmit(onApprove)}
              className="space-y-4"
            >
              {/* Tier select is UI-only (doc doesn't send tier in verify payload) */}
              <FormField
                control={approveForm.control}
                name="mentor_tier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mentor Tier (informational)</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select tier..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="IG_MENTOR">
                          IG Mentor — mentors a specific Interest Group
                        </SelectItem>
                        <SelectItem value="MENTOR">
                          Mentor — global sessions
                        </SelectItem>
                        <SelectItem value="COMPANY_MENTOR">
                          Company Mentor
                        </SelectItem>
                        <SelectItem value="CAMPUS_MENTOR">
                          Campus Mentor
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Tier is assigned automatically on approval.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Approving…" : "Approve"}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <Form {...rejectForm}>
            <form
              onSubmit={rejectForm.handleSubmit(onReject)}
              className="space-y-4"
            >
              <FormField
                control={rejectForm.control}
                name="verification_note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rejection Note</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Explain why this application is being rejected…"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={isPending}
                >
                  {isPending ? "Rejecting…" : "Reject"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
