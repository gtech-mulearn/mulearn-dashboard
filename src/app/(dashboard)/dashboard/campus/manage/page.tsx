import type { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "Manage Campus",
  description: "Manage campus settings and details.",
};

const CampusManageDashboard = dynamic(() =>
  import("@/features/campus-manage").then((mod) => ({
    default: mod.CampusManageDashboard,
  })),
);

export default function CampusManagePage() {
  return (
    <div className="container mx-auto py-8">
      <CampusManageDashboard />
    </div>
  );
}
