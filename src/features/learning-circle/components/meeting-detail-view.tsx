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
  Radio,
  Users,
  Video,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import {
  useCircleDetail,
  useCircleMembers,
  useCirclePermissions,
  useMeetingDetail,
  useRsvpMeeting,
} from "../hooks";
import { AttendeeReportView } from "./attendee-report-view";
import { EditMeetingModal } from "./edit-meeting-modal";
import { JoinMeetingModal } from "./join-meeting-modal";
import { MeetingReportForm } from "./meeting-report-form";

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
} as const;

function getStatus(meeting: { is_ended: boolean; is_started: boolean }) {
  if (meeting.is_ended) return STATUS_CONFIG.ended;
  if (meeting.is_started) return STATUS_CONFIG.live;
  return STATUS_CONFIG.upcoming;
}

/* ─── Avatar colors ─── */
const ATTENDEE_COLORS = [
  "bg-[#C7D2FE] text-[#3730A3]",
  "bg-[#A7F3D0] text-[#065F46]",
  "bg-[#FDE68A] text-[#92400E]",
  "bg-[#FBCFE8] text-[#9D174D]",
  "bg-[#BAE6FD] text-[#075985]",
  "bg-[#FED7AA] text-[#9A3412]",
  "bg-[#DDD6FE] text-[#5B21B6]",
  "bg-[#FECACA] text-[#991B1B]",
];

function getAttendeeColor(name: string) {
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return ATTENDEE_COLORS[hash % ATTENDEE_COLORS.length];
}

/* ─── Info card ─── */
function InfoCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white p-4 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
      <div className="pointer-events-none absolute -right-2 -top-2 opacity-[0.06]">
        <Icon className="h-14 w-14" style={{ color }} />
      </div>
      <div className="relative flex items-start gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${color}14` }}
        >
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">
            {label}
          </p>
          <p className="mt-0.5 text-sm font-semibold text-[#111827] truncate">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
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

  const { data: meeting, isLoading } = useMeetingDetail(meetingId);
  const { data: circle } = useCircleDetail(circleId);
  const { data: members } = useCircleMembers(circleId);
  const rsvpMeeting = useRsvpMeeting();

  const permissions = useCirclePermissions(
    circle ?? undefined,
    members ?? undefined,
  );

  const isCreator = meeting?.created_by_id
    ? members?.some((m) => m.muid === meeting.created_by_id && m.is_leader) ||
      permissions.role === "owner"
    : false;

  if (isLoading || !meeting) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const meetTime = new Date(meeting.meet_time);
  const isOnline = meeting.mode === "online";
  const canRsvp = !meeting.is_ended && !meeting.is_member;
  const canJoin = meeting.is_started && !meeting.is_ended && !meeting.is_member;
  const status = getStatus(meeting);

  return (
    <div
      className="space-y-6"
      style={{
        fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
      }}
    >
      {/* Back link */}
      <Link
        href={`/dashboard/learning-circle/${circleId}`}
        className="group inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-[#6B7280] shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all hover:shadow-md hover:text-[#111827]"
      >
        <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
        Back to Circle
      </Link>

      {/* ─── Hero Header ─── */}
      <div className="relative overflow-hidden rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        {/* Gradient header band */}
        <div
          className={`relative bg-gradient-to-r ${status.gradient} px-7 py-8`}
        >
          {/* Decorative shapes */}
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 h-20 w-20 rounded-full bg-white/[0.07] blur-lg" />
          <div className="pointer-events-none absolute right-1/4 top-0 h-1 w-24 bg-white/20 rounded-full" />

          <div className="relative flex items-start justify-between gap-4">
            <div className="flex-1">
              {/* Status badge */}
              <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                {status.dot && (
                  <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                )}
                {status.label}
              </span>

              <h1 className="text-[26px] font-extrabold leading-tight tracking-[-0.02em] text-white">
                {meeting.title}
              </h1>
              {meeting.description && (
                <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-white/80">
                  {meeting.description}
                </p>
              )}
            </div>

            {permissions.canEditMeeting && !meeting.is_ended && (
              <button
                type="button"
                onClick={() => setShowEditModal(true)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-sm transition-all hover:bg-white/30 hover:scale-105"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Action buttons in header */}
          {(canRsvp || canJoin) && (
            <div className="relative mt-5 flex gap-3">
              {canRsvp && (
                <button
                  type="button"
                  onClick={() => rsvpMeeting.mutate(meetingId)}
                  disabled={rsvpMeeting.isPending}
                  className="rounded-full bg-white/20 px-5 py-2 text-[13px] font-bold text-white backdrop-blur-sm transition-all hover:bg-white/30 disabled:opacity-50"
                >
                  RSVP
                </button>
              )}
              {canJoin && (
                <button
                  type="button"
                  onClick={() => setShowJoinModal(true)}
                  className="rounded-full bg-white px-5 py-2 text-[13px] font-bold text-[#111827] shadow-md transition-all hover:shadow-lg hover:scale-[1.02]"
                >
                  Join Meeting
                </button>
              )}
            </div>
          )}
        </div>

        {/* ─── Info grid ─── */}
        <div className="bg-[#FAFBFC] px-7 py-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <InfoCard
              icon={Calendar}
              label="Date"
              value={format(meetTime, "MMM d, yyyy")}
              color="#6366F1"
            />
            <InfoCard
              icon={Clock}
              label="Time"
              value={`${format(meetTime, "h:mm a")} (${meeting.duration}h)`}
              color="#8B5CF6"
            />
            <InfoCard
              icon={isOnline ? Video : MapPin}
              label={isOnline ? "Online" : "Location"}
              value={meeting.meet_place || "TBA"}
              color={isOnline ? "#0EA5E9" : "#F59E0B"}
            />
            <InfoCard
              icon={Users}
              label="Attendees"
              value={String(meeting.attendees.length)}
              color="#10B981"
            />
          </div>

          {/* Meet Code */}
          {meeting.meet_code && isCreator && (
            <div className="mt-4 flex items-center gap-3 rounded-xl bg-gradient-to-r from-[#FEF3C7] to-[#FDE68A]/40 px-5 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F59E0B]/15">
                <Key className="h-4 w-4 text-[#D97706]" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#92400E]/70">
                  Meeting Code
                </p>
                <p className="font-mono text-sm font-bold tracking-wider text-[#92400E]">
                  {meeting.meet_code}
                </p>
              </div>
            </div>
          )}

          {/* Meet Link */}
          {meeting.meet_link && isOnline && (
            <a
              href={meeting.meet_link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#EEF2FF] px-4 py-2.5 text-[13px] font-semibold text-[#4F46E5] transition-colors hover:bg-[#E0E7FF]"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Join Online Meeting
            </a>
          )}
        </div>
      </div>

      {/* ─── Attendees ─── */}
      <div className="rounded-[20px] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EEF2FF]">
            <Users className="h-4 w-4 text-[#6366F1]" />
          </div>
          <div>
            <h2 className="text-[15px] font-bold text-[#111827]">Attendees</h2>
            <p className="text-[11px] font-medium text-[#9CA3AF]">
              {meeting.attendees.length} people
            </p>
          </div>
        </div>

        {meeting.attendees.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-[#F9FAFB] py-10">
            <Users className="mb-2 h-8 w-8 text-[#D1D5DB]" />
            <p className="text-[13px] font-medium text-[#9CA3AF]">
              No attendees yet
            </p>
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {meeting.attendees.map((attendee) => {
              const colorClass = getAttendeeColor(attendee.full_name);
              return (
                <div
                  key={attendee.user_id}
                  className="flex items-center justify-between rounded-xl bg-[#FAFBFC] px-4 py-3 transition-colors hover:bg-[#F3F4F6]"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 shadow-sm">
                      {attendee.profile_pic && (
                        <AvatarImage src={attendee.profile_pic} />
                      )}
                      <AvatarFallback
                        className={`text-[12px] font-bold ${colorClass}`}
                      >
                        {attendee.full_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-[13px] font-semibold text-[#1F2937]">
                      {attendee.full_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {attendee.is_joined && (
                      <span className="flex items-center gap-1 rounded-full bg-[#D1FAE5] px-2.5 py-1 text-[10px] font-bold text-[#065F46]">
                        <CheckCircle2 className="h-3 w-3" />
                        Joined
                      </span>
                    )}
                    {attendee.is_report_submitted && (
                      <span className="flex items-center gap-1 rounded-full bg-[#DBEAFE] px-2.5 py-1 text-[10px] font-bold text-[#1E40AF]">
                        <Radio className="h-3 w-3" />
                        Report
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
      {meeting.is_member && meeting.is_ended && (
        <AttendeeReportView meetingId={meetingId} />
      )}

      {/* Meeting Report — visible to owner/lead */}
      {permissions.canSubmitReport && meeting.is_ended && (
        <MeetingReportForm
          meetingId={meetingId}
          attendees={meeting.attendees}
        />
      )}

      {/* Modals */}
      <EditMeetingModal
        circleId={circleId}
        meeting={meeting}
        open={showEditModal}
        onOpenChange={setShowEditModal}
      />
      <JoinMeetingModal
        meetingId={meetingId}
        open={showJoinModal}
        onOpenChange={setShowJoinModal}
      />
    </div>
  );
}
