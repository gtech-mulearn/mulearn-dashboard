import { Calendar, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GeneralToggleProps, TimeFrame } from "@/features/leaderboard";

export function TimeFrameToggle({
  selected,
  onChange,
}: GeneralToggleProps<TimeFrame>) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full p-1">
      <Button
        type="button"
        variant={selected === "monthly" ? "default" : "outline"}
        onClick={() => onChange("monthly")}
        aria-pressed={selected === "monthly"}
        className="font-semibold"
      >
        <Calendar className="w-3.5 h-3.5" />
        <span>Monthly</span>
      </Button>
      <Button
        type="button"
        variant={selected === "overall" ? "default" : "outline"}
        onClick={() => onChange("overall")}
        aria-pressed={selected === "overall"}
        className="font-semibold"
      >
        <Trophy className="w-3.5 h-3.5" />
        <span>Overall</span>
      </Button>
    </div>
  );
}
