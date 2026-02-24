/**
 * Learning Circle API Functions
 *
 * 📍 src/features/learning-circle/api/learning-circle.api.ts
 *
 * All Learning Circle API calls with Zod validation.
 */

import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import {
  type ApproveMemberRequest,
  type AttendeeReportRequest,
  AttendeeReportResponseSchema,
  CircleDetailResponseSchema,
  CircleListResponseSchema,
  type CircleMember,
  CircleMembersResponseSchema,
  type CollegeListItem,
  CollegeListResponseSchema,
  type CreateCircleRequest,
  CreateCircleResponseSchema,
  type CreateMeetingRequest,
  type EditCircleRequest,
  EmptyResponseSchema,
  type Invite,
  InviteByLinkResponseSchema,
  InviteListResponseSchema,
  type InviteResponseRequest,
  type JoinMeetingRequest,
  type LearningCircle,
  type LearningCircleDetail,
  type Meeting,
  type MeetingDetail,
  MeetingDetailResponseSchema,
  MeetingListResponseSchema,
  type MeetingReportRequest,
  MeetingReportResponseSchema,
  type PublicMeetingListResponse,
  PublicMeetingListResponseSchema,
  type SendInviteRequest,
  type TransferLeadRequest,
} from "../schemas";

// ============================================
// Form Dropdown Data
// ============================================

/** Get colleges for create circle form dropdown */
export async function getColleges(params?: {
  page?: number;
  perPage?: number;
  search?: string;
}): Promise<CollegeListItem[]> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("pageIndex", String(params.page));
  if (params?.perPage) searchParams.set("perPage", String(params.perPage));
  if (params?.search) searchParams.set("search", params.search);

  const url = searchParams.toString()
    ? `${endpoints.college.list}?${searchParams}`
    : endpoints.college.list;
  const response = await apiClient.get(url, CollegeListResponseSchema);
  return response.response.data;
}

// ============================================
// Circle Management
// ============================================

/** Get all learning circles */
export async function getCircles(): Promise<LearningCircle[]> {
  const response = await apiClient.get(
    endpoints.learningCircle.list,
    CircleListResponseSchema,
  );
  return response.response.data;
}

/** Get circle details */
export async function getCircleDetail(
  circleId: string,
): Promise<LearningCircleDetail> {
  const response = await apiClient.get(
    endpoints.learningCircle.info(circleId),
    CircleDetailResponseSchema,
  );
  return response.response;
}

/** Get circle members */
export async function getCircleMembers(
  circleId: string,
): Promise<CircleMember[]> {
  const response = await apiClient.get(
    endpoints.learningCircle.members(circleId),
    CircleMembersResponseSchema,
  );
  return response.response;
}

/** Create learning circle */
export async function createCircle(data: CreateCircleRequest): Promise<string> {
  const response = await apiClient.post(
    endpoints.learningCircle.create,
    data,
    CreateCircleResponseSchema,
  );
  return response.response.circle_id;
}

/** Edit learning circle */
export async function editCircle(
  circleId: string,
  data: EditCircleRequest,
): Promise<void> {
  await apiClient.put(
    endpoints.learningCircle.edit(circleId),
    data,
    EmptyResponseSchema,
  );
}

/** Delete learning circle */
export async function deleteCircle(circleId: string): Promise<void> {
  await apiClient.delete(
    endpoints.learningCircle.delete(circleId),
    EmptyResponseSchema,
  );
}

// ============================================
// Member Management
// ============================================

/** Accept or reject a pending member */
export async function approveMember(
  circleId: string,
  data: ApproveMemberRequest,
): Promise<void> {
  await apiClient.post(
    endpoints.learningCircle.membersAdd(circleId),
    data,
    EmptyResponseSchema,
  );
}

/** Transfer lead role to another member */
export async function transferLead(
  circleId: string,
  data: TransferLeadRequest,
): Promise<void> {
  await apiClient.post(
    endpoints.learningCircle.transferLead(circleId),
    data,
    EmptyResponseSchema,
  );
}

// ============================================
// Join & Invite
// ============================================

/** Request to join a circle */
export async function joinCircle(circleId: string): Promise<void> {
  await apiClient.post(
    endpoints.learningCircle.join(circleId),
    {},
    EmptyResponseSchema,
  );
}

/** Send an invite to a user for a circle */
export async function sendInvite(
  circleId: string,
  data: SendInviteRequest,
): Promise<void> {
  await apiClient.post(
    endpoints.learningCircle.invite(circleId),
    data,
    EmptyResponseSchema,
  );
}

/** Get sent invites for a circle */
export async function getSentInvites(circleId: string): Promise<Invite[]> {
  const response = await apiClient.get(
    endpoints.learningCircle.inviteSent(circleId),
    InviteListResponseSchema,
  );
  return response.response;
}

/** Get current user's pending invites */
export async function getMyPendingInvites(): Promise<Invite[]> {
  const response = await apiClient.get(
    endpoints.learningCircle.inviteStatus,
    InviteListResponseSchema,
  );
  return response.response;
}

/** Accept or reject an invite (no link_id) */
export async function respondToInvite(
  data: InviteResponseRequest & { id: string },
): Promise<void> {
  await apiClient.post(
    endpoints.learningCircle.inviteStatus,
    data,
    EmptyResponseSchema,
  );
}

/** Look up an invite by link_id */
export async function getInviteByLink(linkId: string): Promise<Invite> {
  const response = await apiClient.get(
    endpoints.learningCircle.inviteStatusByLink(linkId),
    InviteByLinkResponseSchema,
  );
  return response.response;
}

/** Accept or reject an invite by link_id */
export async function respondToInviteByLink(
  linkId: string,
  data: InviteResponseRequest,
): Promise<void> {
  await apiClient.post(
    endpoints.learningCircle.inviteStatusByLink(linkId),
    data,
    EmptyResponseSchema,
  );
}

// ============================================
// Meeting Management
// ============================================

/** Get meetings for a circle */
export async function getCircleMeetings(circleId: string): Promise<Meeting[]> {
  const response = await apiClient.get(
    endpoints.learningCircle.meetingList(circleId),
    MeetingListResponseSchema,
  );
  return response.response;
}

/** Get public meetings with pagination */
export async function getPublicMeetings(params?: {
  ig_id?: string;
  page?: number;
  perPage?: number;
  search?: string;
}): Promise<PublicMeetingListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.ig_id) searchParams.set("ig_id", params.ig_id);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.perPage) searchParams.set("perPage", String(params.perPage));
  if (params?.search) searchParams.set("search", params.search);

  const url = `${endpoints.learningCircle.meetingListPublic}?${searchParams}`;
  const response = await apiClient.get(url, PublicMeetingListResponseSchema);
  return response;
}

/** Get user's meetings */
export async function getUserMeetings(params?: {
  saved?: boolean;
  participated?: boolean;
  category?: string;
}): Promise<Meeting[]> {
  const searchParams = new URLSearchParams();
  if (params?.saved) searchParams.set("saved", "true");
  if (params?.participated) searchParams.set("participated", "true");
  if (params?.category) searchParams.set("category", params.category);

  const url = `${endpoints.learningCircle.meetingListUser}?${searchParams}`;
  const response = await apiClient.get(url, MeetingListResponseSchema);
  return response.response;
}

/** Get meeting details */
export async function getMeetingDetail(
  meetingId: string,
): Promise<MeetingDetail> {
  const response = await apiClient.get(
    endpoints.learningCircle.meetingInfo(meetingId),
    MeetingDetailResponseSchema,
  );
  return response.response;
}

/** Create meeting */
export async function createMeeting(
  circleId: string,
  data: CreateMeetingRequest,
): Promise<void> {
  await apiClient.post(
    endpoints.learningCircle.meetingCreate(circleId),
    data,
    EmptyResponseSchema,
  );
}

/** Edit meeting */
export async function editMeeting(
  meetingId: string,
  data: Partial<CreateMeetingRequest>,
): Promise<void> {
  await apiClient.put(
    endpoints.learningCircle.meetingEdit(meetingId),
    data,
    EmptyResponseSchema,
  );
}

/** Delete meeting */
export async function deleteMeeting(meetingId: string): Promise<void> {
  await apiClient.delete(
    endpoints.learningCircle.meetingDelete(meetingId),
    EmptyResponseSchema,
  );
}

// ============================================
// Meeting Participation
// ============================================

/** RSVP to meeting */
export async function rsvpMeeting(meetingId: string): Promise<void> {
  await apiClient.post(
    endpoints.learningCircle.meetingRsvp(meetingId),
    {},
    EmptyResponseSchema,
  );
}

/** Join meeting with code */
export async function joinMeeting(
  meetingId: string,
  data: JoinMeetingRequest,
): Promise<void> {
  await apiClient.post(
    endpoints.learningCircle.meetingJoin(meetingId),
    data,
    EmptyResponseSchema,
  );
}

/** Leave meeting */
export async function leaveMeeting(meetingId: string): Promise<void> {
  await apiClient.delete(
    endpoints.learningCircle.meetingLeave(meetingId),
    EmptyResponseSchema,
  );
}

// ============================================
// Meeting Reports
// ============================================

/** Submit attendee report */
export async function submitAttendeeReport(
  meetingId: string,
  data: AttendeeReportRequest,
): Promise<void> {
  await apiClient.post(
    endpoints.learningCircle.attendeeReport(meetingId),
    data,
    EmptyResponseSchema,
  );
}

/** Get attendee report */
export async function getAttendeeReport(meetingId: string) {
  const response = await apiClient.get(
    endpoints.learningCircle.attendeeReport(meetingId),
    AttendeeReportResponseSchema,
  );
  return response.response;
}

/** Delete attendee report */
export async function deleteAttendeeReport(meetingId: string): Promise<void> {
  await apiClient.delete(
    endpoints.learningCircle.attendeeReport(meetingId),
    EmptyResponseSchema,
  );
}

/** Submit meeting report (organizer) */
export async function submitMeetingReport(
  meetingId: string,
  data: MeetingReportRequest,
): Promise<void> {
  await apiClient.post(
    endpoints.learningCircle.meetingReport(meetingId),
    data,
    EmptyResponseSchema,
  );
}

/** Get meeting report (organizer) */
export async function getMeetingReport(meetingId: string) {
  const response = await apiClient.get(
    endpoints.learningCircle.meetingReport(meetingId),
    MeetingReportResponseSchema,
  );
  return response.response;
}

/** Delete meeting report (organizer) */
export async function deleteMeetingReport(meetingId: string): Promise<void> {
  await apiClient.delete(
    endpoints.learningCircle.meetingReport(meetingId),
    EmptyResponseSchema,
  );
}
