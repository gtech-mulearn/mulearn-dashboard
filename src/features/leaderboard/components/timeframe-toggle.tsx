"use client";

import { Button } from "@/components/ui/button";
import type { TimeFrame } from "../types/leaderboard.type";
import { Calendar, Trophy } from "lucide-react";

interface TimeFrameToggleProps {
  selected: TimeFrame;
  onChange: (timeframe: TimeFrame) => void;
}

export function TimeFrameToggle({ selected, onChange }: TimeFrameToggleProps) {
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
