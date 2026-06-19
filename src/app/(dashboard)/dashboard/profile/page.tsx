import type { Metadata } from "next";
import { ProfilePageClient } from "./profile-client";

export const metadata: Metadata = {
  title: "Profile",
  description: "View and manage your profile.",
};

export default function ProfilePage() {
  return <ProfilePageClient />;
}
