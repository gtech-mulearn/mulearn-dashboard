import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentor Dashboard",
  description: "Mentor dashboard overview.",
};

export default function MentorPage() {
  redirect("/dashboard");
}
