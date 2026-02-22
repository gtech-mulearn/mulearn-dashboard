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
  Crown,
  Edit,
  Loader2,
  Plus,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import {
  useApproveMember,
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
import { InviteSection } from "./invite-section";
import { MeetingCard } from "./meeting-card";
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

  const { data: circle, isLoading } = useCircleDetail(circleId);
  const { data: members } = useCircleMembers(circleId);
  const { data: meetings } = useCircleMeetings(circleId);
  const rsvpMeeting = useRsvpMeeting();
  const joinCircle = useJoinCircle();
  const approveMember = useApproveMember(circleId);

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

  const memberCount = circle.total_members ?? members?.length ?? 0;
  const hasDescription =
    circle.description && circle.description !== circle.title;

  return (
    <div className="mx-auto max-w-5xl">
      {/* Back */}
      <Link
        href="/dashboard/learning-circle"
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-800"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </Link>

      {/* ─── TWO-COLUMN GRID ─── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px]">
        {/* ════ LEFT COLUMN ════ */}
        <div className="space-y-5">
          {/* ── Main Info Card ── */}
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            {/* Header: title + actions */}
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-xl font-semibold text-gray-900">
                    {circle.title}
                  </h1>
                  {permissions.role !== null && (
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        permissions.role === "lead"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {permissions.role === "lead" ? "Lead" : "Member"}
                    </span>
                  )}
                </div>
                {hasDescription && (
                  <p className="mt-1.5 text-sm leading-relaxed text-gray-500">
                    {circle.description}
                  </p>
                )}
              </div>

              {permissions.canEditCircle && (
                <button
                  type="button"
                  onClick={() => setShowEditModal(true)}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
                >
                  <Edit className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Interest Group label */}
            <div className="mt-4">
              <span className="inline-flex items-center rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                {circle.ig}
              </span>
            </div>

            {/* Metadata rows (like Aviro: Status / Deadline / Assigned) */}
            <div className="mt-5 space-y-3 border-t border-gray-100 pt-5">
              <div className="flex items-center">
                <span className="w-28 text-sm text-gray-400">Members</span>
                <span className="text-sm font-medium text-gray-900">
                  {memberCount}
                </span>
              </div>
              <div className="flex items-center">
                <span className="w-28 text-sm text-gray-400">Karma</span>
                <span className="text-sm font-medium text-gray-900">
                  {circle.total_karma ?? 0}
                </span>
              </div>
              {circle.rank && (
                <div className="flex items-center">
                  <span className="w-28 text-sm text-gray-400">Rank</span>
                  <span className="text-sm font-medium text-gray-900">
                    #{circle.rank}
                  </span>
                </div>
              )}
              {circle.org && (
                <div className="flex items-center">
                  <span className="w-28 text-sm text-gray-400">
                    Organization
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {circle.org}
                  </span>
                </div>
              )}
              <div className="flex items-center">
                <span className="w-28 text-sm text-gray-400">Created by</span>
                <div className="flex items-center gap-2">
                  <div className="relative h-6 w-6">
                    {circle.created_by.profile_pic ? (
                      <Image
                        src={circle.created_by.profile_pic}
                        alt={circle.created_by.full_name}
                        fill
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-medium text-white">
                        {circle.created_by.full_name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {circle.created_by.full_name}
                  </span>
                </div>
              </div>
            </div>

            {/* Join button */}
            {permissions.role === null && (
              <div className="mt-5 border-t border-gray-100 pt-5">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
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

          {/* ── Meetings Card ── */}
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">
                Meetings
              </h2>
              {permissions.canCreateMeeting && (
                <button
                  type="button"
                  onClick={() => setShowCreateMeetingModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-gray-800"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Schedule
                </button>
              )}
            </div>

            {meetings && meetings.length > 0 ? (
              <div className="space-y-3">
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
              <div className="flex flex-col items-center py-10 text-center">
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
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-gray-800"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Schedule Meeting
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ════ RIGHT COLUMN (Sidebar) ════ */}
        <div className="space-y-5">
          {/* ── Members Card (Project Roles style) ── */}
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <h3 className="mb-4 text-base font-semibold text-gray-900">
              Members <span className="text-gray-400">({memberCount})</span>
            </h3>

            {/* Invite row — dashed circle like Aviro Project Roles */}
            {permissions.canSendInvites && (
              <div className="mb-4 flex items-center gap-2.5 border-b border-gray-100 pb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-dashed border-gray-300 text-gray-400">
                  <Plus className="h-4 w-4" />
                </div>
                <span className="text-sm text-gray-500">Invite Member</span>
              </div>
            )}

            {/* Member list — 2-col grid like Aviro */}
            {members && members.length > 0 ? (
              <div className="grid grid-cols-2 gap-x-3 gap-y-3.5">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="group flex items-center gap-2"
                  >
                    <div className="relative h-8 w-8 shrink-0">
                      {member.profile_pic ? (
                        <Image
                          src={member.profile_pic}
                          alt={member.full_name}
                          fill
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${getAvatarColor(member.full_name)}`}
                        >
                          {member.full_name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {member.full_name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {member.is_leader ? "Lead" : `${member.ig_karma} karma`}
                      </p>
                    </div>

                    {/* Approve/reject on hover */}
                    {permissions.canManageMembers && !member.is_leader && (
                      <div className="hidden shrink-0 gap-1 group-hover:flex">
                        <button
                          type="button"
                          onClick={() =>
                            approveMember.mutate({
                              muid: member.muid,
                              flag: true,
                            })
                          }
                          className="inline-flex h-6 w-6 items-center justify-center rounded-full text-emerald-500 transition-colors hover:bg-emerald-50"
                        >
                          <Check className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            approveMember.mutate({
                              muid: member.muid,
                              flag: false,
                            })
                          }
                          className="inline-flex h-6 w-6 items-center justify-center rounded-full text-red-400 transition-colors hover:bg-red-50"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center">
                <Users className="mx-auto mb-2 h-6 w-6 text-gray-300" />
                <p className="text-xs text-gray-400">No members yet</p>
              </div>
            )}
          </div>

          {/* ── Invite Section ── */}
          {permissions.canSendInvites && <InviteSection circleId={circleId} />}

          {/* ── Admin Actions ── */}
          {(permissions.canTransferLead || permissions.canDeleteCircle) && (
            <div className="space-y-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
              {permissions.canTransferLead && (
                <button
                  type="button"
                  onClick={() => setShowTransferLeadModal(true)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-amber-600 transition-colors hover:bg-amber-50"
                >
                  <Crown className="h-4 w-4" />
                  Transfer Lead
                </button>
              )}
              {permissions.canDeleteCircle && (
                <>
                  {permissions.canTransferLead && (
                    <div className="border-t border-gray-100" />
                  )}
                  <div>
                    <p className="mb-2 text-xs text-gray-400">
                      This action is permanent and cannot be undone.
                    </p>
                    <DeleteCircleButton
                      circleId={circleId}
                      circleName={circle.title}
                    />
                  </div>
                </>
              )}
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
