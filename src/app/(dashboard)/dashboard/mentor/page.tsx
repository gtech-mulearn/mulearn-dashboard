import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Mentor Dashboard",
  description: "Mentor dashboard overview.",
};

export default function MentorPage() {
  redirect("/dashboard");
}
