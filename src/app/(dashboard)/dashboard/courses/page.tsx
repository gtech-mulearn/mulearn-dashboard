import type { Metadata } from "next";
import CoursesClient from "./courses-client";

export const metadata: Metadata = {
  title: "Courses | μLearn",
  description:
    "Explore curated courses from Wadhwani Foundation and OpenGrad to enhance your skills and career readiness.",
};

export default function CoursesPage() {
  return <CoursesClient />;
}
