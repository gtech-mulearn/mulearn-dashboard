/**
 * Circle Detail Component
 *
 * Clean, minimal layout matching Aviro project manager reference.
 * White cards, subtle borders, label-value metadata rows.
 * Two-column: left (info + meetings), right (members + admin).
 */

"use client";

import {
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Crown,
  Edit,
  Loader2,
  Plus,
  UserPlus,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import {
  useCircleDetail,
  useCircleMeetings,
  useCircleMembers,
  useCirclePermissions,
  useJoinCircle,
  useRsvpMeeting,
} from "../hooks";
import { CreateMeetingModal } from "./create-meeting-modal";
import { DeleteCircleButton } from "./delete-circle-button";
import { EditCircleModal } from "./edit-circle-modal";
import { InviteMemberForm, SentInvitesCard } from "./invite-section";
import { MeetingCard } from "./meeting-card";
import { MemberList } from "./member-list";
import { TransferLeadModal } from "./transfer-lead-modal";

interface CircleDetailProps {
  circleId: string;
}

const AVATAR_COLORS = [
  "bg-emerald-500 text-white",
  "bg-indigo-500 text-white",
  "bg-orange-500 text-white",
  "bg-pink-500 text-white",
  "bg-violet-500 text-white",
  "bg-sky-500 text-white",
  "bg-amber-500 text-white",
  "bg-red-500 text-white",
];

function getAvatarColor(name: string) {
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export function CircleDetail({ circleId }: CircleDetailProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateMeetingModal, setShowCreateMeetingModal] = useState(false);
  const [showTransferLeadModal, setShowTransferLeadModal] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);

  const { data: circle, isLoading } = useCircleDetail(circleId);
  const { data: members } = useCircleMembers(circleId);
  const { data: meetings } = useCircleMeetings(circleId);
  const rsvpMeeting = useRsvpMeeting();
  const joinCircle = useJoinCircle();

  const permissions = useCirclePermissions(
    circle ?? undefined,
    members ?? undefined,
  );

  const handleJoin = () => joinCircle.mutate(circleId);
  const handleRsvp = (meetingId: string) => rsvpMeeting.mutate(meetingId);

  if (isLoading || !circle) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const hasDescription =
    circle.description && circle.description !== circle.title;

  return (
    <div className="w-full bg-gray-50 px-6 py-6 pb-20 min-h-screen">
      {/* Back */}
      <Link
        href="/dashboard/learning-circle"
        className="mb-6 inline-flex items-center gap-1.5 text-[13px] font-semibold text-gray-500 transition-colors hover:text-gray-900"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </Link>

      {/* ─── TWO-COLUMN GRID ─── */}
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* ════ LEFT COLUMN ════ */}
        <div className="flex-1 space-y-8 min-w-0">
          {/* ── Main Info Card ── */}
          <div className="rounded-[24px] bg-white p-8 shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-gray-100">
            {/* Top Bar: Avrio - Branding */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <span className="text-[15px] font-bold text-gray-800">
                Learning Circle — {circle.ig ?? "General"}
              </span>
              <span className="inline-flex rounded-lg border border-gray-200 px-3 py-1 text-[12px] font-semibold text-gray-700">
                Active
              </span>
            </div>

            {/* ActionBar: Mark Complete & Icons */}
            <div className="flex items-center justify-between mt-5">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-1.5 text-[13px] font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  <Check className="h-4 w-4 text-gray-500" />
                  {permissions.role
                    ? `Joined as ${permissions.role === "lead" ? "Lead" : "Member"}`
                    : "Join Circle"}
                </button>
              </div>

              {permissions.canEditCircle && (
                <div className="flex items-center gap-1 text-gray-400">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(true)}
                    className="p-2 transition hover:text-gray-900"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  {/* Fake icons for pixel-perfect ref */}
                  <button
                    type="button"
                    className="p-2 transition hover:text-gray-900"
                  >
                    <Users className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Title Section */}
            <div className="mt-6">
              <p className="text-[13px] font-medium text-gray-500">
                {circle.org ?? "Organization"}
              </p>
              <h1 className="mt-1 text-[28px] font-bold tracking-tight text-[#111827]">
                {circle.title}
              </h1>
              {hasDescription && (
                <p className="mt-3 text-[14px] leading-relaxed text-gray-600 max-w-2xl">
                  {circle.description}
                </p>
              )}
            </div>

            {/* Properties Grid */}
            <div className="mt-8 space-y-5">
              {/* Lead / Assigned */}
              <div className="flex items-center">
                <span className="w-32 text-[14px] text-gray-500">
                  Circle Lead
                </span>
                <div className="flex -space-x-1.5">
                  <div className="relative h-7 w-7 rounded-full border-2 border-white bg-gray-100 overflow-hidden">
                    {circle.created_by.profile_pic ? (
                      <Image
                        src={circle.created_by.profile_pic}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div
                        className={`flex h-full w-full items-center justify-center text-[10px] font-bold text-white ${getAvatarColor(circle.created_by.full_name)}`}
                      >
                        {circle.created_by.full_name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span className="ml-3 text-[14px] font-semibold text-gray-900 self-center">
                    {circle.created_by.full_name}
                  </span>
                </div>
              </div>

              {/* Tags / Metrics */}
              <div className="flex items-center">
                <span className="w-32 text-[14px] text-gray-500">Metrics</span>
                <div className="flex gap-2">
                  <span className="inline-flex rounded-full bg-violet-100 px-3 py-0.5 text-[12px] font-bold text-violet-700">
                    #{circle.rank ?? 0} Rank
                  </span>
                  <span className="inline-flex rounded-full bg-amber-100 px-3 py-0.5 text-[12px] font-bold text-amber-700">
                    {circle.total_karma ?? 0} Karma
                  </span>
                  <span className="inline-flex rounded-full bg-blue-100 px-3 py-0.5 text-[12px] font-bold text-blue-700">
                    {circle.ig}
                  </span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="mt-10 flex items-center justify-between border-b border-gray-100">
              <div className="flex gap-6">
                <button
                  type="button"
                  className="border-b-2 border-red-500 pb-3 text-[14px] font-bold text-gray-900"
                >
                  Meetings
                </button>
              </div>
              {permissions.canCreateMeeting && (
                <button
                  type="button"
                  onClick={() => setShowCreateMeetingModal(true)}
                  className="mb-2 inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-1.5 text-[12px] font-semibold text-white transition-all hover:bg-gray-800 active:scale-95 shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Schedule
                </button>
              )}
            </div>

            {/* Tab Content: Meetings */}
            <div className="mt-6">
              {meetings && meetings.length > 0 ? (
                <div className="space-y-4">
                  {meetings.map((meeting) => (
                    <MeetingCard
                      key={meeting.id}
                      meeting={meeting}
                      onRsvp={handleRsvp}
                      isRsvpLoading={rsvpMeeting.isPending}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl bg-gray-50 border border-gray-100 border-dashed px-6 py-10 text-center">
                  <Calendar className="mb-2 h-8 w-8 text-gray-300" />
                  <p className="text-sm font-medium text-gray-900">
                    No meetings yet
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    Schedule a meeting to get started
                  </p>
                  {permissions.canCreateMeeting && (
                    <button
                      type="button"
                      onClick={() => setShowCreateMeetingModal(true)}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-white border border-gray-200 shadow-sm px-4 py-2 text-xs font-semibold text-gray-700 transition-[box-shadow,background-color] hover:bg-gray-50 hover:shadow"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Schedule Meeting
                    </button>
                  )}
                </div>
              )}

              {permissions.role === null && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
                    onClick={handleJoin}
                    disabled={joinCircle.isPending}
                  >
                    {joinCircle.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <UserPlus className="h-4 w-4" />
                    )}
                    Join Circle
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ════ RIGHT COLUMN (Sidebar) ════ */}
        <div className="w-full lg:w-[320px] shrink-0 space-y-6">
          {/* ── Members Card ── */}
          <div className="w-full rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col">
            <h3 className="text-[16px] font-bold text-gray-900 mb-5">
              Members
            </h3>

            {/* Hidden-by-default Invite Form */}
            {permissions.canSendInvites && (
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  showInviteForm
                    ? "max-h-40 opacity-100 mb-4"
                    : "max-h-0 opacity-0 mb-0"
                }`}
              >
                <div className="border border-gray-100 rounded-xl p-3 bg-gray-50/50 mb-2">
                  <InviteMemberForm
                    circleId={circleId}
                    onSent={() => setShowInviteForm(false)}
                  />
                </div>
              </div>
            )}

            <MemberList
              circleId={circleId}
              permissions={permissions}
              onInviteClick={() => setShowInviteForm(!showInviteForm)}
            />
          </div>

          {/* ── Sent Invites Card (Team Goal style) ── */}
          {permissions.canSendInvites && (
            <SentInvitesCard circleId={circleId} />
          )}

          {/* ── Admin Actions ── */}
          {permissions.canTransferLead && (
            <button
              type="button"
              onClick={() => setShowTransferLeadModal(true)}
              className="group flex w-full items-center justify-between rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-gray-100 transition-all hover:bg-amber-50/50 hover:border-amber-100 active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100/50 border border-amber-200/50">
                  <Crown className="h-4 w-4 text-amber-600" />
                </div>
                <span className="text-[14px] font-semibold text-amber-700">
                  Transfer Lead
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-amber-600/50 transition-transform group-hover:translate-x-0.5 group-hover:text-amber-600" />
            </button>
          )}

          {permissions.canDeleteCircle && (
            <div className="w-full rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-red-100/50 flex flex-col items-center justify-between sm:flex-row gap-4">
              <div className="flex min-w-0 flex-1 flex-col text-center sm:text-left">
                <span className="text-[14px] font-semibold text-gray-900">
                  Delete Circle
                </span>
                <p className="text-[12px] text-gray-400">
                  This action is permanent and cannot be undone.
                </p>
              </div>
              <div className="shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                <DeleteCircleButton
                  circleId={circleId}
                  circleName={circle.title}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {circle && (
        <>
          <EditCircleModal
            circle={circle}
            open={showEditModal}
            onOpenChange={setShowEditModal}
          />
          <CreateMeetingModal
            circleId={circleId}
            open={showCreateMeetingModal}
            onOpenChange={setShowCreateMeetingModal}
          />
          {permissions.canTransferLead && (
            <TransferLeadModal
              circleId={circleId}
              open={showTransferLeadModal}
              onOpenChange={setShowTransferLeadModal}
            />
          )}
        </>
      )}
    </div>
  );
}
