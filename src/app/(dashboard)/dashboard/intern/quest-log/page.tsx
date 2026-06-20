import type { Metadata } from "next";
import { QuestLogHistory } from "@/features/intern";

export const metadata: Metadata = {
  title: "Activity Log",
  description: "View your intern activity history.",
};

export default function QuestLogPage() {
  return <QuestLogHistory />;
}
