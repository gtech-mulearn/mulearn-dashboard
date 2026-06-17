import dynamic from "next/dynamic";

const ZonalDashboardView = dynamic(() =>
  import("@/features/zonal").then((mod) => ({
    default: mod.ZonalDashboardView,
  })),
);

export default function ZonalPage() {
  return (
    <div className="container mx-auto space-y-6 p-4 md:p-8">
      <ZonalDashboardView />
    </div>
  );
}
