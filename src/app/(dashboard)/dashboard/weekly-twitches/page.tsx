import type { Metadata } from "next";
import { WeeklyTwitchesViewer } from "@/features/weekly-twitches";

export const metadata: Metadata = {
  title: "Weekly Twitches",
  description: "Office Hours, Salt Mango Tree, and Inspiration Station Radio.",
};

export default function Page() {
  return <WeeklyTwitchesViewer />;
}
