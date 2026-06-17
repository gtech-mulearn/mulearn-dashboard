import dynamic from "next/dynamic";

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
