import { Calendar, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GeneralToggleProps, TimeFrame } from "../types";

export function TimeFrameToggle({
  selected,
  onChange,
}: GeneralToggleProps<TimeFrame>) {
  return (
    <div className="inline-flex gap-3">
      <Button
        variant={selected === "monthly" ? "default" : "outline"}
        onClick={() => onChange("monthly")}
        className={`flex items-center gap-3 font-semibold uppercase tracking-tight`}
      >
        <Calendar className="w-5 h-5" />
        <span>Monthly</span>
      </Button>
      <Button
        variant={selected === "overall" ? "default" : "outline"}
        onClick={() => onChange("overall")}
        className={`flex items-center gap-3 font-semibold uppercase tracking-tight`}
      >
        <Trophy className="w-5 h-5" />
        <span>Overall</span>
      </Button>
    </div>
  );
}
