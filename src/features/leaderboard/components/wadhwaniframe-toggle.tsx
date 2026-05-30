import { Building2, Globe } from "lucide-react";
import type { WadhwaniToggleProps } from "@/features/leaderboard";

export function WadhwaniTimeFrameToggle({
  selected,
  onChange,
}: WadhwaniToggleProps) {
  return (
    <div className="inline-flex items-center gap-1 bg-muted rounded-full p-1">
      <button
        type="button"
        onClick={() => onChange("campus")}
        className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
          selected === "campus"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Building2 className="w-3.5 h-3.5" />
        <span>Campus</span>
      </button>
      <button
        type="button"
        onClick={() => onChange("zonal")}
        className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
          selected === "zonal"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Globe className="w-3.5 h-3.5" />
        <span>Zonal</span>
      </button>
    </div>
  );
}
