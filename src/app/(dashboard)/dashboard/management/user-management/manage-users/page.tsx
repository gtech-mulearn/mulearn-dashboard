import type { Metadata } from "next";
import { ManageUsersPage } from "@/features/manage-users";

export const metadata: Metadata = {
  title: "Manage Users | Dashboard",
  description: "Manage users with search, sorting, edit and delete actions",
};

export default function Page() {
  return <ManageUsersPage />;
}
