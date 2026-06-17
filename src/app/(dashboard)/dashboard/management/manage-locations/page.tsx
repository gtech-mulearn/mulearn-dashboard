import type { Metadata } from "next";
import { LocationManagementPage } from "@/features/manage-locations";

export const metadata: Metadata = {
  title: "Manage Locations",
  description: "Manage geographical locations for events and users.",
};

export default function Page() {
  return <LocationManagementPage />;
}
