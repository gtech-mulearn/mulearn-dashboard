import { QuestLogHistory } from "@/features/intern";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quest Log",
  description: "View your intern quest log history.",
};

export default function QuestLogPage() {
  return <QuestLogHistory />;
}
