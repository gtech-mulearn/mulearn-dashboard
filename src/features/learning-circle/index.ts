/**
 * Learning Circle Feature
 *
 * 📍 src/features/learning-circle/index.ts
 *
 * Public API for the learning circle feature.
 */

// Components
export {
  CircleCard,
  CircleDetail,
  CircleList,
  CreateCircleModal,
  JoinMeetingModal,
  MeetingCard,
} from "./components";

// Hooks
export {
  learningCircleKeys,
  useCircleDetail,
  useCircleMembers,
  useCircleMeetings,
  useCircles,
  useColleges,
  useCreateCircle,
  useCreateMeeting,
  useDeleteCircle,
  useDeleteMeeting,
  useJoinMeeting,
  useLeaveMeeting,
  useMeetingDetail,
  usePublicMeetings,
  useRsvpMeeting,
  useSubmitAttendeeReport,
  useSubmitMeetingReport,
  useUserMeetings,
} from "./hooks";

// API Functions
export {
  createCircle,
  createMeeting,
  deleteCircle,
  deleteMeeting,
  editCircle,
  editMeeting,
  getCircleDetail,
  getCircleMembers,
  getCircleMeetings,
  getCircles,
  getMeetingDetail,
  getPublicMeetings,
  getUserMeetings,
  joinMeeting,
  leaveMeeting,
  rsvpMeeting,
  submitAttendeeReport,
  submitMeetingReport,
} from "./api";

// Types
export type {
  AttendeeReportRequest,
  CircleMember,
  CreateCircleRequest,
  CreateMeetingRequest,
  EditCircleRequest,
  JoinMeetingRequest,
  LearningCircle,
  LearningCircleDetail,
  Meeting,
  MeetingAttendee,
  MeetingDetail,
  MeetingReportRequest,
  PublicMeetingListResponse,
  UserBasic,
} from "./schemas";
