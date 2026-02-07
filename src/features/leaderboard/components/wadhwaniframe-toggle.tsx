import { Building2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { WadhwaniToggleProps } from "../types";

export function WadhwaniTimeFrameToggle({
  selected,
  onChange,
}: WadhwaniToggleProps) {
  return (
    <div className="inline-flex gap-3">
      <Button
        variant={selected === "campus" ? "default" : "outline"}
        onClick={() => onChange("campus")}
        className="flex items-center gap-3 font-semibold uppercase tracking-tight"
      >
        <Building2 className="w-5 h-5" />
        <span>Campus</span>
      </Button>
      <Button
        variant={selected === "zonal" ? "default" : "outline"}
        onClick={() => onChange("zonal")}
        className="flex items-center gap-3 font-semibold uppercase tracking-tight"
      >
        <Globe className="w-5 h-5" />
        <span>Zonal</span>
      </Button>
    </div>
  );
}
