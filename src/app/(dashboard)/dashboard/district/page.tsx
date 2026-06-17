import dynamic from "next/dynamic";

const DistrictDashboard = dynamic(() =>
  import("@/features/district").then((mod) => ({
    default: mod.DistrictDashboard,
  })),
);

export default function DistrictPage() {
  return (
    <div className="container mx-auto space-y-6 p-4 md:p-8">
      <DistrictDashboard />
    </div>
  );
}
