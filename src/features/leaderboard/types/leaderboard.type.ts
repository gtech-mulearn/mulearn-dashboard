export type TimeFrame = "monthly" | "overall";
export type Category = "students" | "campus" | "wadhwani";

export interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  profile_pic?: string;
  karma: number;
}

export type LeaderboardData = {
  [key in Category]: LeaderboardEntry[];
};

export interface CategorySelectorProps {
  selected: Category;
  onChange: (category: Category) => void;
}

export interface PodiumProps {
  entries: LeaderboardEntry[];
}

export interface LeaderboardCardProps {
  entry: LeaderboardEntry;
}

export interface TimeFrameToggleProps {
  selected: TimeFrame;
  onChange: (timeframe: TimeFrame) => void;
}
