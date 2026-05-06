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
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Edit2,
  ExternalLink,
  Key,
  MapPin,
  QrCode,
  Radio,
  Repeat,
  Users,
  Video,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import {
  useCircleDetail,
  useCircleMeetings,
  useCircleMembers,
  useCirclePermissions,
  useMeetingDetail,
  useRsvpMeeting,
} from "../hooks";
import { AttendeeReportView } from "./attendee-report-view";
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
  if (meeting.is_started && !meeting.is_ended && !meeting.is_recurring)
    return STATUS_CONFIG.live;
  if (meeting.is_recurring) return STATUS_CONFIG.recurring;
  if (meeting.is_ended) return STATUS_CONFIG.ended;
  return STATUS_CONFIG.upcoming;
}

/** Parses UTC timestamp string discarding 'Z' so it treats it as local time */
function parseLocalTime(timeStr: string) {
  if (!timeStr) return new Date();
  if (timeStr.endsWith("Z")) {
    return new Date(timeStr.slice(0, -1));
  }
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

  const { data: rawMeeting, isLoading } = useMeetingDetail(meetingId);
  const { data: circle } = useCircleDetail(circleId);
  const { data: members } = useCircleMembers(circleId);
  const { data: circleMeetings } = useCircleMeetings(circleId);
  const rsvpMeeting = useRsvpMeeting();

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

  const isCreator = meeting?.created_by_id
    ? members?.members?.some(
        (m) => m.muid === meeting.created_by_id && m.is_leader,
      ) || permissions.role === "owner"
    : false;

  const canJoin =
    meeting?.is_started && !meeting.is_ended && !meeting.is_member;

  useEffect(() => {
    if (joinMeetCode && canJoin) {
      setShowJoinModal(true);
    }
  }, [joinMeetCode, canJoin]);

  if (isLoading || !meeting) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    );
  }

  const meetTime = parseLocalTime(meeting.meet_time);
  const isOnline = meeting.mode === "online";
  const canRsvp = !meeting.is_ended && !meeting.is_member;
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

      {/* ─── Hero Header / Info Grid Card ─── */}
      <div className="w-full rounded-2xl bg-card p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-border flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
          <span className="text-[15px] font-bold text-foreground flex items-center gap-2">
            Meeting — {meeting.ig}
            {status.dot && (
              <span className="relative flex h-2 w-2 ml-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
              </span>
            )}
          </span>
          <span
            className={`inline-flex rounded-lg px-3 py-1 text-[12px] font-semibold ${
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

        <div className="flex items-center justify-between mb-8">
          <div className="flex-1 pr-6">
            <h1 className="text-[28px] font-bold tracking-tight text-foreground">
              {meeting.title}
            </h1>
            {meeting.description && (
              <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-muted-foreground">
                {meeting.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {permissions.canEditMeeting && !meeting.is_ended && (
              <button
                type="button"
                onClick={() => setShowEditModal(true)}
                className="flex items-center justify-center p-2 rounded-xl bg-muted border border-border text-muted-foreground hover:text-foreground transition-colors"
                title="Edit Meeting"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            )}
            {canRsvp && (
              <button
                type="button"
                onClick={() => rsvpMeeting.mutate(meetingId)}
                disabled={rsvpMeeting.isPending}
                className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-[13px] font-semibold text-foreground transition hover:bg-muted disabled:opacity-50"
              >
                RSVP
              </button>
            )}
            {canJoin && (
              <button
                type="button"
                onClick={() => setShowJoinModal(true)}
                className="flex items-center gap-2 rounded-xl bg-foreground px-4 py-2 text-[13px] font-semibold text-background transition hover:bg-foreground/90"
              >
                Join
              </button>
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
                <button
                  type="button"
                  onClick={() => setShowLinkQr(true)}
                  className="ml-1 text-muted-foreground hover:text-primary transition-colors"
                  title="Show Link QR"
                >
                  <QrCode className="h-3.5 w-3.5" />
                </button>
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
              {meeting.attendees.length} Joined
            </span>
          </div>

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
                  <button
                    type="button"
                    onClick={() => setShowJoinQr(true)}
                    className="flex items-center gap-1 rounded-md bg-warning/10 px-2 py-1 text-[11px] font-semibold text-warning hover:bg-warning/20 transition-colors"
                  >
                    <QrCode className="h-3.5 w-3.5" />
                    Share QR
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── Attendees ─── */}
      <div className="w-full rounded-2xl bg-card p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-border flex flex-col">
        <h3 className="text-[16px] font-bold text-foreground mb-6 flex items-center gap-2">
          Attendees{" "}
          <span className="text-sm font-medium text-muted-foreground">
            ({meeting.attendees.length})
          </span>
        </h3>

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
      {meeting?.is_member && meeting.is_ended && (
        <AttendeeReportView meetingId={meetingId} />
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
      />
      {meeting?.meet_code && (
        <QrModal
          open={showJoinQr}
          onOpenChange={setShowJoinQr}
          title="Join Meeting"
          description={`Scan this QR code or use code ${meeting.meet_code} to join the meeting.`}
          value={
            typeof window !== "undefined"
              ? `${window.location.origin}/dashboard/learning-circle/${circleId}?join_meet=${meeting.meet_code}`
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
    </div>
  );
}
