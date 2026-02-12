/**
 * Circle Detail Component
 *
 * 📍 src/features/learning-circle/components/circle-detail.tsx
 *
 * Full circle detail view with tabs for overview, members, meetings.
 */

"use client";

import {
  Award,
  Calendar,
  ChevronLeft,
  Crown,
  Edit,
  Loader2,
  Plus,
  Trophy,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUserProfile } from "@/features/profile";
import {
  useCircleDetail,
  useCircleMeetings,
  useCircleMembers,
  useRsvpMeeting,
} from "../hooks";
import { CreateMeetingModal } from "./create-meeting-modal";
import { EditCircleModal } from "./edit-circle-modal";
import { MeetingCard } from "./meeting-card";

interface CircleDetailProps {
  circleId: string;
}

type Tab = "overview" | "members" | "meetings";

export function CircleDetail({ circleId }: CircleDetailProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateMeetingModal, setShowCreateMeetingModal] = useState(false);

  const { data: circle, isLoading } = useCircleDetail(circleId);
  const { data: members } = useCircleMembers(circleId);
  const { data: meetings } = useCircleMeetings(circleId);
  const { data: userProfile } = useUserProfile();
  const rsvpMeeting = useRsvpMeeting();

  // Check if current user is the circle owner
  const isOwner =
    userProfile?.muid && circle?.created_by?.muid
      ? userProfile.muid === circle.created_by.muid
      : false;

  const handleRsvp = (meetingId: string) => {
    rsvpMeeting.mutate(meetingId);
  };

  if (isLoading || !circle) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const memberCount = circle.total_members ?? members?.length ?? 0;

  const tabs: { id: Tab; label: string; icon: typeof Users }[] = [
    { id: "overview", label: "Overview", icon: Trophy },
    { id: "members", label: `Members (${memberCount})`, icon: Users },
    {
      id: "meetings",
      label: `Meetings (${meetings?.length || 0})`,
      icon: Calendar,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/dashboard/learning-circle"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Circles
      </Link>

      {/* Header Card */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 p-6 text-white shadow-lg">
        {/* Decorative elements */}
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10 blur-xl" />

        <div className="relative">
          {/* IG Badge */}
          <span className="mb-3 inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-sm font-medium backdrop-blur-sm">
            {circle.ig}
          </span>

          <h1 className="mb-2 text-2xl font-bold">{circle.title}</h1>
          <p className="mb-4 text-white/80">{circle.description}</p>

          {/* Stats */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-white/70" />
              <span>{memberCount} members</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-white/70" />
              <span>{(circle.total_karma ?? 0).toLocaleString()} karma</span>
            </div>
            {circle.rank && (
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-white/70" />
                <span>Rank #{circle.rank}</span>
              </div>
            )}
          </div>

          {/* Creator */}
          <div className="mt-4 flex items-center gap-3 border-t border-white/20 pt-4">
            <div className="relative h-10 w-10 overflow-hidden rounded-full bg-white/20">
              {circle.created_by.profile_pic ? (
                <Image
                  src={circle.created_by.profile_pic}
                  alt={circle.created_by.full_name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-white font-medium">
                  {circle.created_by.full_name.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm text-white/70">Created by</p>
              <p className="font-medium">{circle.created_by.full_name}</p>
            </div>

            {/* Owner Actions */}
            {isOwner && (
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => setShowEditModal(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Circle
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              type="button"
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {activeTab === "overview" && (
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-semibold text-gray-900">
              About this Circle
            </h3>
            <p className="text-gray-600">{circle.description}</p>

            <div className="mt-6">
              <h4 className="mb-3 text-sm font-medium text-gray-500">
                Organization
              </h4>
              <p className="text-gray-900">{circle.org || "No organization"}</p>
            </div>
          </div>
        )}

        {activeTab === "members" && (
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="space-y-3">
              {members?.map((member, _index) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-xl bg-gray-50 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gray-200">
                      {member.profile_pic ? (
                        <Image
                          src={member.profile_pic}
                          alt={member.full_name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center font-medium text-gray-500">
                          {member.full_name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">
                          {member.full_name}
                        </p>
                        {member.is_leader && (
                          <Crown className="h-4 w-4 text-amber-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500">@{member.muid}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {member.ig_karma.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">karma</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "meetings" && (
          <div className="space-y-4">
            {/* Create Meeting Button for Owner */}
            {isOwner && (
              <div className="flex justify-end">
                <Button
                  onClick={() => setShowCreateMeetingModal(true)}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Meeting
                </Button>
              </div>
            )}

            {meetings && meetings.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
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
              <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-12 shadow-sm">
                <Calendar className="mb-4 h-12 w-12 text-gray-300" />
                <p className="text-gray-500">No meetings scheduled yet</p>
                {isOwner && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setShowCreateMeetingModal(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule First Meeting
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
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
        </>
      )}
    </div>
  );
}
