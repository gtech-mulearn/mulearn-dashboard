import type { Metadata } from "next";
import { EditProfilePageClient } from "./profile-edit-client";

export const metadata: Metadata = {
  title: "Edit Company Profile",
  description: "Edit your company profile information.",
};

export default function EditProfilePage() {
  return <EditProfilePageClient />;
}
