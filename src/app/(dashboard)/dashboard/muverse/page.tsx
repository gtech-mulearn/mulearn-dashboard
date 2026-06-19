import type { Metadata } from "next";
import { MuversePageClient } from "./muverse-client";

export const metadata: Metadata = {
  title: "Muverse",
  description: "Explore the Muverse.",
};

export default function MuversePage() {
  return <MuversePageClient />;
}
