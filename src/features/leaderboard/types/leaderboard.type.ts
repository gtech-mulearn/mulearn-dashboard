export type TimeFrame = "monthly" | "overall";
export type Category = "students" | "campus" | "wadhwani";

export interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  avatar?: string;
  karma: number;
}

export type LeaderboardData = {
  [key in Category]: LeaderboardEntry[];
};
