import type { Metadata } from "next";
import ManageUsers from "@/features/manage-users/components/manage-user-page";

export const metadata: Metadata = {
  title: "Manage Users",
  description: "Add, edit, and delete user accounts.",
};

export default function Page() {
  return <ManageUsers />;
}
