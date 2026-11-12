import { redirect } from "next/navigation";
import { verificationTabHref } from "@/features/role-verification";

// Merged into the unified Role Verification page (2026-09-25).
export default function VerifyOrgsPage() {
  redirect(verificationTabHref("college"));
}
