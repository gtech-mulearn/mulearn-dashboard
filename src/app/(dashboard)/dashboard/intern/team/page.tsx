import type { Metadata } from "next";
import { MyTeamPageClient } from "./my-team-client";

export const metadata: Metadata = {
  title: "My Team",
  description: "See the people in your intern team.",
};

export default function MyTeamPage() {
  return <MyTeamPageClient />;
}
