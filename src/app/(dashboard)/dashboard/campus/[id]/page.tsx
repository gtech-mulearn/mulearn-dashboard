import { CampusView } from "@/features/campus";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Campus Details",
  description: "View details for a specific campus.",
};

export default async function CampusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="container mx-auto py-10">
      <CampusView id={id} />
    </div>
  );
}
