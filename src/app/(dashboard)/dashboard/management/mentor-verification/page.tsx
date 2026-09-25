import { redirect } from "next/navigation";
import { verificationTabHref } from "@/features/role-verification/lib/tabs";

// Merged into the unified Role Verification page (2026-09-25).
export default function MentorVerificationRoute() {
  redirect(verificationTabHref("mentor"));
}
