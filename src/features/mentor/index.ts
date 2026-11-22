// The feature's public surface. Besides each folder's index, it names the deeper files that routes
// and other features use: the mentor pages the routes render (sessions, mentees, opportunities,
// task requests, profile, session verification), the onboarding form and hooks, the admin grants
// sheet and verify call, and the task IG dropdown. MentorVerificationPanel is the Mentor tab of the
// unified Role Verification page (app/.../management/role-verification).
export { verifyMentor } from "./admin/api/mentor-verify.api";
export { MentorGrantsSheet } from "./admin/components/mentor-grants-sheet";
export { MentorVerificationPanel } from "./admin/components/mentor-verification-page";
export * from "./api";
export * from "./components";
export { scheduleHasOverlap } from "./components/availability-slot-picker";
export * from "./hooks";
export { isMentorDeactivatedError } from "./lib/mentor-deactivated";
export { MenteesPage } from "./mentees/components/mentees-page";
export { MentorOnboardingForm } from "./onboarding/components/mentor-onboarding-form";
export {
  deriveOnboardingState,
  useMentorApplication,
  useMentorApplicationStatus,
  useMentorProfile,
} from "./onboarding/hooks/use-onboarding";
export { mentorTierLabel } from "./onboarding/lib/mentor-status";
export type { MentorApplication } from "./onboarding/schemas";
export { OpportunitiesPage } from "./opportunities";
export { MentorProfilePage } from "./profile";
export { AdminSessionVerificationPage } from "./sessions/components/admin-session-verification-page";
export { SessionsPage } from "./sessions/components/sessions-page";
export { StudentSessionsPage } from "./sessions/components/student-sessions-page";
export { TaskRequestsPage } from "./task-requests/components/task-requests-page";
export { useTaskIgDropdown } from "./tasks/hooks/use-mentor-tasks";
export * from "./types";
