import { Building2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { WadhwaniToggleProps } from "@/features/leaderboard";

export function WadhwaniTimeFrameToggle({
  selected,
  onChange,
}: WadhwaniToggleProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full p-1">
      <Button
        type="button"
        variant={selected === "campus" ? "default" : "outline"}
        onClick={() => onChange("campus")}
        aria-pressed={selected === "campus"}
        className="font-semibold"
      >
        <Building2 className="w-3.5 h-3.5" />
        <span>Campus</span>
      </Button>
      <Button
        type="button"
        variant={selected === "zonal" ? "default" : "outline"}
        onClick={() => onChange("zonal")}
        aria-pressed={selected === "zonal"}
        className="font-semibold"
      >
        <Globe className="w-3.5 h-3.5" />
        <span>Zonal</span>
      </Button>
    </div>
  );
}
