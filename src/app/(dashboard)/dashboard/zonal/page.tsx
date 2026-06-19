import type { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "Zonal Dashboard",
  description: "Manage and view zonal details.",
};

const ZonalDashboardView = dynamic(() =>
  import("@/features/zonal").then((mod) => ({
    default: mod.ZonalDashboardView,
  })),
);

export default function ZonalPage() {
  return <ZonalDashboardView />;
}
