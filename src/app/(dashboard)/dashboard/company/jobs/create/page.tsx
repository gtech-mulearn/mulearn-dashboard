import type { Metadata } from "next";
import { CreateJobPageClient } from "./jobs-create-client";

export const metadata: Metadata = {
  title: "Create Job",
  description: "Create a new job listing.",
};

export default function CreateJobPage() {
  return <CreateJobPageClient />;
}
