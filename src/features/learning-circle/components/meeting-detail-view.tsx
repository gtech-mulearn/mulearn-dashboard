/**
 * Meeting Detail View Component
 *
 * 📍 src/features/learning-circle/components/meeting-detail-view.tsx
 *
 * Full meeting detail page with info, attendees, join/RSVP actions,
 * and conditional report sections based on permissions.
 */

"use client";

import { format } from "date-fns";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Edit2,
  ExternalLink,
  Key,
  LogOut,
  MapPin,
  QrCode,
  Radio,
  Repeat,
  UserRound,
  Users,
  Video,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { endpoints } from "@/api/endpoints";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useUserInfo } from "@/features/auth/hooks";
import { useCsvDownload } from "@/hooks/use-csv-download";
import {
  useCircleDetail,
  useCircleMeetings,
  useCircleMembers,
  useCirclePermissions,
  useLeaveMeeting,
  useMeetingDetail,
  useRsvpMeeting,
} from "../hooks";
import { AttendeeReportView } from "./attendee-report-view";
import { DeleteMeetingButton } from "./delete-meeting-button";
import { EditMeetingModal } from "./edit-meeting-modal";
import { JoinMeetingModal } from "./join-meeting-modal";
import { MeetingReportForm } from "./meeting-report-form";
import { QrModal } from "./qr-modal";

/* ─── Status config ─── */
const STATUS_CONFIG = {
  live: {
    gradient: "from-[#059669] via-[#10B981] to-[#34D399]",
    label: "Live Now",
    dot: true,
  },
  upcoming: {
    gradient: "from-[#4F46E5] via-[#6366F1] to-[#818CF8]",
    label: "Upcoming",
    dot: false,
  },
  ended: {
    gradient: "from-[#6B7280] via-[#9CA3AF] to-[#D1D5DB]",
    label: "Ended",
    dot: false,
  },
  recurring: {
    gradient: "from-[#8B5CF6] via-[#A855F7] to-[#C084FC]",
    label: "Recurring",
    dot: false,
  },
} as const;

function getStatus(meeting: {
  is_ended: boolean;
  is_started: boolean;
  is_recurring?: boolean;
}) {
  // "Ended" takes precedence over "Recurring": an occurrence that has ended is
  // shown as Ended even when the meeting is part of a recurring series.
  if (meeting.is_ended) return STATUS_CONFIG.ended;
  if (meeting.is_started) return STATUS_CONFIG.live;
  if (meeting.is_recurring) return STATUS_CONFIG.recurring;
  return STATUS_CONFIG.upcoming;
}

function parseLocalTime(timeStr: string) {
  if (!timeStr) return new Date();
  return new Date(timeStr);
}

/* ─── Avatar colors ─── */
// TODO: no semantic token — attendee avatar palette needs design decision; using chart approximations
const ATTENDEE_COLORS = [
  "bg-chart-1/30 text-foreground",
  "bg-chart-2/30 text-foreground",
  "bg-chart-3/30 text-foreground",
  "bg-chart-5/30 text-foreground",
  "bg-chart-4/30 text-foreground",
  "bg-warning/20 text-foreground",
  "bg-brand-purple/20 text-foreground",
  "bg-destructive/20 text-foreground",
];

function getAttendeeColor(name: string) {
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return ATTENDEE_COLORS[hash % ATTENDEE_COLORS.length];
}

/* ─── Component ─── */
interface MeetingDetailViewProps {
  meetingId: string;
  circleId: string;
}

export function MeetingDetailView({
  meetingId,
  circleId,
}: MeetingDetailViewProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const searchParams = useSearchParams();
  const joinMeetCode = searchParams?.get("join_meet");
  const [showJoinQr, setShowJoinQr] = useState(false);
  const [showLinkQr, setShowLinkQr] = useState(false);

  const csvFilename = `meeting-attendees-${meetingId}-${format(new Date(), "yyyy-MM-dd")}.csv`;
  const { downloadCsv, isDownloading } = useCsvDownload(
    endpoints.learningCircle.meetingReportExport(meetingId),
    csvFilename,
  );

  const { data: rawMeeting, isLoading } = useMeetingDetail(meetingId);
  const { data: circle } = useCircleDetail(circleId);
  const { data: members } = useCircleMembers(circleId);
  const { data: circleMeetings } = useCircleMeetings(circleId);
  const rsvpMeeting = useRsvpMeeting();
  const { data: userInfo } = useUserInfo();
  const leaveMeeting = useLeaveMeeting();
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const listMeetingInfo = circleMeetings?.find((m) => m.id === meetingId);
  const meeting = rawMeeting
    ? {
        ...rawMeeting,
        is_recurring: rawMeeting.is_recurring ?? listMeetingInfo?.is_recurring,
        recurrence: rawMeeting.recurrence ?? listMeetingInfo?.recurrence,
        recurrence_type:
          rawMeeting.recurrence_type ?? listMeetingInfo?.recurrence_type,
      }
    : undefined;

  const permissions = useCirclePermissions(
    circle ?? undefined,
    members ?? undefined,
  );

  // Resolve the creator's display name:
  // 1. Use `created_by` from the detail API response (name string) if present.
  // 2. Fall back to looking them up in the members list by their UUID.
  const creatorMember = meeting?.created_by_id
    ? members?.members?.find(
        (m) =>
          m.id === meeting.created_by_id || m.muid === meeting.created_by_id,
      )
    : undefined;

  const creatorName =
    meeting?.created_by || creatorMember?.full_name || undefined;

  // Fallback to meeting.created_by_id if not found, in case it's already an muid
  const creatorMuid = creatorMember?.muid || meeting?.created_by_id;

  const isCreator = creatorMuid
    ? members?.members?.some((m) => m.muid === creatorMuid && m.is_leader) ||
      permissions.role === "owner"
    : false;

  /**
   * BUG-014: canDeleteThisMeeting covers owner, lead (via permissions.canDeleteMeeting)
   * AND the meeting's direct creator (any role who originally created it).
   * This is intentionally NOT restricted to !meeting.is_ended so that
   * creators can clean up accidentally-created or past meetings.
   */
  const canDeleteThisMeeting =
    permissions.canDeleteMeeting ||
    (userInfo?.muid != null && userInfo.muid === creatorMuid);

  const currentUserAttendee = userInfo
    ? meeting?.attendees.find((a) => a.user_id === userInfo.muid)
    : undefined;
  const hasAttendeeRecord = Boolean(currentUserAttendee);
  const hasJoined = currentUserAttendee?.is_joined ?? false;
  const joinedAttendees = meeting?.attendees.filter((a) => a.is_joined) ?? [];
  const pendingJoinAttendees =
    meeting?.attendees.filter((a) => !a.is_joined) ?? [];

  // Only circle members can RSVP/join a meeting (mirrors the backend member
  // gate). is_member comes from the meeting detail serializer.
  const canJoin = Boolean(
    meeting?.is_started &&
      !meeting?.is_ended &&
      !hasJoined &&
      meeting?.is_member,
  );
  const isJoinWaitingForStart = Boolean(
    meeting &&
      !meeting.is_started &&
      !meeting.is_ended &&
      !hasJoined &&
      meeting.is_member,
  );

  // Handle an incoming `?join_meet=CODE` intent (from the shared QR/link) exactly
  // once per code. If the user can join, open the prefilled modal; otherwise tell
  // them why instead of silently dropping the intent.
  const handledJoinCodeRef = useRef<string | null>(null);
  useEffect(() => {
    if (!joinMeetCode || !meeting) return;
    if (handledJoinCodeRef.current === joinMeetCode) return;
    handledJoinCodeRef.current = joinMeetCode;

    if (canJoin) {
      setShowJoinModal(true);
      return;
    }

    if (hasJoined) {
      toast.info("You've already joined this meeting.");
    } else if (meeting.is_ended) {
      toast.error("This meeting has ended — you can no longer join.");
    } else if (!meeting.is_member) {
      // Non-members get a persistent banner with a CTA instead of a toast.
    } else if (!meeting.is_started) {
      toast.info(
        "This meeting hasn't started yet. You can join once it begins.",
      );
    }
  }, [joinMeetCode, meeting, canJoin, hasJoined]);

  if (isLoading || !meeting) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    );
  }

  const meetTime = parseLocalTime(meeting.meet_time);
  const isOnline = meeting.mode === "online";
  // A meeting occurrence is active only until it ends — being recurring does NOT
  // keep an ended occurrence active (RSVP/join/leave must close once it ends).
  const isActive = !meeting.is_ended;
  // RSVP is only meaningful before the meeting starts; once it's live the
  // only action is Join — hide RSVP to avoid confusion.
  const canRsvp =
    isActive && !meeting.is_started && !hasAttendeeRecord && meeting.is_member;
  const canCancelAttendance = hasAttendeeRecord && !hasJoined && isActive;
  const canLeave = hasJoined && isActive;
  const status = getStatus(meeting);

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href={`/dashboard/learning-circle/${circleId}`}
        className="group inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-[13px] font-semibold text-muted-foreground shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all hover:shadow-md hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
        Back to Circle
      </Link>

      {/* Non-member notice — someone who opened a shared meeting link but is not a
          circle member cannot RSVP/join. Point them to the circle to join first. */}
      {!meeting.is_member && (
        <div className="flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <h3 className="text-[15px] font-bold text-foreground">
                You're not a member of this circle
              </h3>
              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                Join the learning circle first to RSVP and join its meetings.
              </p>
            </div>
          </div>
          <Button asChild variant="default" className="shrink-0">
            <Link href={`/dashboard/learning-circle/${circleId}`}>
              Go to Circle
            </Link>
          </Button>
        </div>
      )}

      {/* ─── Hero Header / Info Grid Card ─── */}
      <div className="w-full rounded-2xl bg-card p-4 sm:p-6 lg:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-border flex flex-col">
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-border mb-6">
          <span className="min-w-0 text-[15px] font-bold text-foreground flex items-center gap-2">
            <span className="truncate">Meeting — {meeting.ig}</span>
            {status.dot && (
              <span className="relative flex h-2 w-2 ml-1 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
              </span>
            )}
          </span>
          <span
            className={`shrink-0 inline-flex rounded-lg px-3 py-1 text-[12px] font-semibold ${
              status === STATUS_CONFIG.ended
                ? "bg-muted text-muted-foreground"
                : status === STATUS_CONFIG.live
                  ? "bg-success/10 text-success"
                  : status === STATUS_CONFIG.recurring
                    ? "bg-brand-purple/10 text-brand-purple"
                    : "bg-primary/10 text-primary"
            }`}
          >
            {status.label}
          </span>
        </div>

        <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1 sm:pr-6">
            <h1 className="text-[22px] sm:text-[28px] font-bold tracking-tight text-foreground break-words">
              {meeting.title}
            </h1>
            {meeting.description && (
              <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-muted-foreground">
                {meeting.description}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 sm:shrink-0">
            {permissions.canEditMeeting && !meeting.is_ended && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowEditModal(true)}
                title="Edit Meeting"
                aria-label="Edit Meeting"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
            {canDeleteThisMeeting && (
              <DeleteMeetingButton
                meetingId={meetingId}
                meetingTitle={meeting.title}
                circleId={circleId}
                isRecurring={meeting.is_recurring}
              />
            )}
            {canRsvp && (
              <Button
                type="button"
                variant="outline"
                onClick={() => rsvpMeeting.mutate(meetingId)}
                disabled={rsvpMeeting.isPending}
              >
                RSVP
              </Button>
            )}
            {canJoin && (
              <Button
                type="button"
                variant="default"
                onClick={() => setShowJoinModal(true)}
              >
                Join
              </Button>
            )}
            {isJoinWaitingForStart && (
              <Button
                type="button"
                variant="secondary"
                disabled
                title="You can join after the meeting starts"
              >
                Join opens at start
              </Button>
            )}
            {canCancelAttendance && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowLeaveConfirm(true)}
              >
                <LogOut className="h-3.5 w-3.5" />
                Cancel RSVP
              </Button>
            )}
            {canLeave && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowLeaveConfirm(true)}
              >
                <LogOut className="h-3.5 w-3.5" />
                Leave
              </Button>
            )}
          </div>
        </div>

        {/* Info Grid (Replacing gradient info blocks) */}
        <div className="grid gap-x-12 gap-y-6 sm:grid-cols-2 lg:grid-cols-4 mb-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-[13px] font-medium">Date</span>
            </div>
            <span className="text-[15px] font-semibold text-foreground">
              {format(meetTime, "MMM d, yyyy")}
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-[13px] font-medium">Time</span>
            </div>
            <span className="text-[15px] font-semibold text-foreground">
              {format(meetTime, "h:mm a")} ({meeting.duration}h)
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              {isOnline ? (
                <Video className="h-4 w-4" />
              ) : (
                <MapPin className="h-4 w-4" />
              )}
              <span className="text-[13px] font-medium">
                {isOnline ? "Platform" : "Location"}
              </span>
              {isOnline && meeting.meet_link && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowLinkQr(true)}
                  className="ml-1 h-6 w-6 text-muted-foreground hover:text-primary"
                  title="Show Link QR"
                >
                  <QrCode className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            {isOnline && meeting.meet_link ? (
              <a
                href={meeting.meet_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[15px] font-semibold text-primary hover:text-primary/80 flex items-center gap-1.5 transition-colors"
              >
                {meeting.meet_place || "Online"}{" "}
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <span
                className="text-[15px] font-semibold text-foreground truncate"
                title={meeting.meet_place || "TBA"}
              >
                {meeting.meet_place || "TBA"}
              </span>
            )}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="h-4 w-4" />
              <span className="text-[13px] font-medium">Attendees</span>
            </div>
            <span className="text-[15px] font-semibold text-foreground">
              {joinedAttendees.length} Joined
            </span>
            {pendingJoinAttendees.length > 0 && (
              <span className="mt-0.5 text-[12px] font-medium text-muted-foreground">
                {pendingJoinAttendees.length} not joined
              </span>
            )}
          </div>

          {creatorName && (
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <UserRound className="h-4 w-4" />
                <span className="text-[13px] font-medium">Created by</span>
              </div>
              <span
                className="text-[15px] font-semibold text-foreground truncate"
                title={creatorName}
              >
                {creatorName}
              </span>
            </div>
          )}

          {meeting.is_recurring && (
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Repeat className="h-4 w-4" />
                <span className="text-[13px] font-medium">Recurrence</span>
              </div>
              <span className="text-[15px] font-semibold text-foreground capitalize">
                {meeting.recurrence_type || "Yes"}{" "}
                {meeting.recurrence ? `(${meeting.recurrence} times)` : ""}
              </span>
            </div>
          )}
        </div>

        {/* Meet Code */}
        {meeting.meet_code && isCreator && (
          <div className="mt-6 flex items-center justify-between rounded-xl border border-warning/20 bg-warning/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 text-warning">
                <Key className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[13px] font-medium text-warning/70">
                  Meeting Code
                </p>
                <div className="flex items-center gap-3">
                  <p className="font-mono text-[16px] font-bold tracking-widest text-warning">
                    {meeting.meet_code}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowJoinQr(true)}
                    className="flex items-center gap-1 rounded-md bg-warning/10 px-2 py-1 text-[11px] font-semibold text-warning hover:bg-warning/20"
                  >
                    <QrCode className="h-3.5 w-3.5" />
                    Share QR
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── Attendees ─── */}
      <div className="w-full rounded-2xl bg-card p-4 sm:p-6 lg:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-border flex flex-col">
        <div className="mb-6 flex items-center justify-between gap-3 flex-wrap">
          <h3 className="text-[16px] font-bold text-foreground flex items-center gap-2 flex-wrap">
            Attendees{" "}
            <span className="text-sm font-medium text-muted-foreground">
              ({joinedAttendees.length} joined
              {pendingJoinAttendees.length > 0
                ? `, ${pendingJoinAttendees.length} not joined`
                : ""}
              )
            </span>
          </h3>
          {permissions.canSubmitReport && (
            <Button
              type="button"
              id="meeting-attendees-export-csv"
              aria-label="Download attendees CSV"
              variant="outline"
              size="sm"
              onClick={downloadCsv}
              disabled={isDownloading}
              className="rounded-xl text-[12px]"
            >
              <Download className="h-3.5 w-3.5" />
              {isDownloading ? "Downloading…" : "Download CSV"}
            </Button>
          )}
        </div>

        {meeting.attendees.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-muted py-10">
            <Users className="mb-2 h-8 w-8 text-muted-foreground/40" />
            <p className="text-[13px] font-medium text-muted-foreground">
              No attendees yet
            </p>
          </div>
        ) : (
          <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            {meeting.attendees.map((attendee) => {
              const colorClass = getAttendeeColor(attendee.full_name);
              return (
                <div
                  key={attendee.user_id}
                  className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3 transition-colors hover:bg-muted/80"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <Avatar className="h-10 w-10 border border-card shadow-sm shrink-0">
                      {attendee.profile_pic && (
                        <AvatarImage src={attendee.profile_pic} />
                      )}
                      <AvatarFallback
                        className={`text-[13px] font-bold ${colorClass}`}
                      >
                        {attendee.full_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-[14px] font-semibold text-foreground truncate">
                      {attendee.full_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {attendee.is_joined && (
                      <span
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-success/10 text-success"
                        title="Joined"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </span>
                    )}
                    {!attendee.is_joined && (
                      <span className="rounded-full bg-warning/10 px-2 py-1 text-[10px] font-bold text-warning">
                        Not joined
                      </span>
                    )}
                    {attendee.is_report_submitted && (
                      <span
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary"
                        title="Report Submitted"
                      >
                        <Radio className="h-4 w-4" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Attendee Report — visible to joined attendees */}
      {hasJoined && meeting.is_ended && (
        <AttendeeReportView meetingId={meetingId} />
      )}
      {!hasJoined && currentUserAttendee && meeting.is_ended && (
        <div className="flex items-start gap-3 rounded-2xl border border-warning/25 bg-warning/10 p-5 text-foreground">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
          <div>
            <h3 className="text-[15px] font-bold">Attendee Report Locked</h3>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
              You are listed for this meeting, but you did not join it with the
              meeting code. Only joined attendees can submit attendee reports.
            </p>
          </div>
        </div>
      )}

      {/* Meeting Report — visible to owner/lead */}
      {meeting && permissions.canSubmitReport && meeting.is_ended && (
        <MeetingReportForm
          meetingId={meetingId}
          attendees={meeting.attendees}
        />
      )}

      {meeting && (
        <EditMeetingModal
          circleId={circleId}
          meeting={meeting}
          open={showEditModal}
          onOpenChange={setShowEditModal}
        />
      )}
      <JoinMeetingModal
        meetingId={meetingId}
        open={showJoinModal}
        onOpenChange={setShowJoinModal}
        defaultCode={joinMeetCode || ""}
        meetLink={meeting.meet_link ?? undefined}
      />
      {meeting?.meet_code && (
        <QrModal
          open={showJoinQr}
          onOpenChange={setShowJoinQr}
          title="Join Meeting"
          description={`Scan this QR code or use code ${meeting.meet_code} to join the meeting.`}
          value={
            typeof window !== "undefined"
              ? `${window.location.origin}/dashboard/learning-circle/${circleId}/meeting/${meetingId}?join_meet=${meeting.meet_code}`
              : ""
          }
        />
      )}
      {meeting?.meet_link && (
        <QrModal
          open={showLinkQr}
          onOpenChange={setShowLinkQr}
          title="Meeting Link"
          description="Scan this QR code to open the online meeting link directly."
          value={meeting.meet_link}
        />
      )}

      <Dialog open={showLeaveConfirm} onOpenChange={setShowLeaveConfirm}>
        <DialogContent className="sm:max-w-90">
          <DialogHeader>
            <DialogTitle>
              {hasJoined ? "Leave Meeting?" : "Cancel RSVP?"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {hasJoined
                ? "You will be removed from the attendees list. You can rejoin if the meeting is still active."
                : "You will be removed from the RSVP list. You can RSVP again if you change your mind."}
            </p>
            {hasJoined && meeting?.meet_link && (
              <p className="text-xs text-muted-foreground/70">
                Note: This only updates your in-app participation status. If the
                meeting is open in another browser tab, please close it
                manually.
              </p>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowLeaveConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={leaveMeeting.isPending}
              onClick={() => {
                leaveMeeting.mutate(meetingId, {
                  onSuccess: () => setShowLeaveConfirm(false),
                });
              }}
            >
              {leaveMeeting.isPending && <Spinner className="mr-2 h-4 w-4" />}
              {hasJoined ? "Leave Meeting" : "Cancel RSVP"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
