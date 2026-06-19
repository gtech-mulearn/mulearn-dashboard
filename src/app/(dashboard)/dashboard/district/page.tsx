import type { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "District Dashboard",
  description: "Manage and view district details.",
};

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
