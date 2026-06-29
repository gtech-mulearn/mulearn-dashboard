import type { Metadata } from "next";
import { WeeklyTwitchesView } from "@/features/weekly-twitches";
import { MANAGEMENT_ROLES, ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Weekly Twitches — Manage",
  description:
    "Manage Office Hours, Salt Mango Tree, and Inspiration Station content.",
};

export default async function Page() {
  await requireRole([...MANAGEMENT_ROLES, ROLES.IG_LEAD]);
  return <WeeklyTwitchesView />;
}
