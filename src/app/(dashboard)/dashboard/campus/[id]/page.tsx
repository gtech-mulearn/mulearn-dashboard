import type { Metadata } from "next";
import { CampusView } from "@/features/campus";

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
  return <CampusView id={id} />;
}
