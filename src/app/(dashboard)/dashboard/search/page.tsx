import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Search",
  description: "Search for students, campuses, and mentors.",
};

export default function SearchPage() {
  redirect("/dashboard/search/students");
}
