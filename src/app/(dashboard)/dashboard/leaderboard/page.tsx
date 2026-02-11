import {
  type Category,
  LeaderboardView,
  type TimeFrame,
  type WadhwaniTimeFrame,
} from "@/features/leaderboard";

interface LeaderboardPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LeaderboardPage(props: LeaderboardPageProps) {
  const searchParams = await props.searchParams;

  const category = (searchParams.category as Category) || "students";
  const timeframe = (searchParams.timeframe as TimeFrame) || "monthly";
  const wadhwaniTimeframe =
    (searchParams.wadhwaniTimeframe as WadhwaniTimeFrame) || "campus";

  return (
    <LeaderboardView
      category={category}
      timeframe={timeframe}
      wadhwaniTimeframe={wadhwaniTimeframe}
    />
  );
}
