import type { Metadata } from "next";
import {
  type Category,
  LeaderboardView,
  type TimeFrame,
} from "@/features/leaderboard";

export const metadata: Metadata = {
  title: "Leaderboard",
  description: "View student and campus leaderboard rankings.",
};

interface LeaderboardPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const validCategories: Category[] = ["students", "campus"];
const validTimeframes: TimeFrame[] = ["monthly", "overall"];

export default async function LeaderboardPage(props: LeaderboardPageProps) {
  const searchParams = await props.searchParams;

  const category = validCategories.includes(searchParams.category as Category)
    ? (searchParams.category as Category)
    : "students";
  const timeframe = validTimeframes.includes(
    searchParams.timeframe as TimeFrame,
  )
    ? (searchParams.timeframe as TimeFrame)
    : "monthly";

  return (
    <LeaderboardView
      key={`${category}-${timeframe}`}
      category={category}
      timeframe={timeframe}
    />
  );
}
