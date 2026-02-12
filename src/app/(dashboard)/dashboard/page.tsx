import type { Metadata } from "next";
import { HomePage } from "@/features/home";

export const metadata: Metadata = {
  title: "Dashboard | μLearn",
  description: "Your μLearn dashboard",
};

export default function DashboardPage() {
  return <HomePage />;
}
