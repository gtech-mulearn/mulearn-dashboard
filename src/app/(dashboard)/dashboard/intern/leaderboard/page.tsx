import type { Metadata } from "next";
import { LeaderboardPageClient } from "./intern-leaderboard-client";

export const metadata: Metadata = {
  title: "Intern Leaderboard",
  description: "View the intern leaderboard rankings.",
};

export default function LeaderboardPage() {
  return <LeaderboardPageClient />;
}
