import type { Metadata } from "next";
import { WeeklyTwitchesView } from "@/features/weekly-twitches";
import { ASSOCIATE_MANAGEMENT_ROLES, ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Weekly Twitches — Manage",
  description:
    "Manage Office Hours, Salt Mango Tree, Inspiration Station, and Grab Your Superpowers content.",
};

export default async function Page() {
  await requireRole([
    ...ASSOCIATE_MANAGEMENT_ROLES,
    ROLES.IG_LEAD,
    ROLES.ZONAL_CAMPUS_LEAD,
    ROLES.DISTRICT_CAMPUS_LEAD,
  ]);
  return <WeeklyTwitchesView />;
}
