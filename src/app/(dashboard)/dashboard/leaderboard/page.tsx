import {
  type Category,
  LeaderboardView,
  type TimeFrame,
  type WadhwaniTimeFrame,
} from "@/features/leaderboard";

interface LeaderboardPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const validCategories: Category[] = [
  "students",
  "campus",
  "wadhwani",
  "mentors",
];
const validTimeframes: TimeFrame[] = ["monthly", "overall"];
const validWadhwaniTimeframes: WadhwaniTimeFrame[] = ["campus", "zonal"];

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
  const wadhwaniTimeframe = validWadhwaniTimeframes.includes(
    searchParams.wadhwaniTimeframe as WadhwaniTimeFrame,
  )
    ? (searchParams.wadhwaniTimeframe as WadhwaniTimeFrame)
    : "campus";

  return (
    <LeaderboardView
      key={`${category}-${timeframe}-${wadhwaniTimeframe}`}
      category={category}
      timeframe={timeframe}
      wadhwaniTimeframe={wadhwaniTimeframe}
    />
  );
}
