import type { Metadata } from "next";
import { MentorVerificationPage } from "@/features/mentor/admin/components/mentor-verification-page";

export const metadata: Metadata = {
  title: "Mentor Verification",
  description: "Review and verify mentor applications.",
};

export default function MentorVerificationRoute() {
  return <MentorVerificationPage />;
}
