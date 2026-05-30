import { Calendar, Trophy } from "lucide-react";
import type { GeneralToggleProps, TimeFrame } from "@/features/leaderboard";

export function TimeFrameToggle({
  selected,
  onChange,
}: GeneralToggleProps<TimeFrame>) {
  return (
    <div className="inline-flex items-center gap-1 bg-muted rounded-full p-1">
      <button
        type="button"
        onClick={() => onChange("monthly")}
        className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
          selected === "monthly"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Calendar className="w-3.5 h-3.5" />
        <span>Monthly</span>
      </button>
      <button
        type="button"
        onClick={() => onChange("overall")}
        className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
          selected === "overall"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Trophy className="w-3.5 h-3.5" />
        <span>Overall</span>
      </button>
    </div>
  );
}
