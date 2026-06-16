import { DepartmentsView } from "@/features/organizations";

export const metadata = {
  title: "Organization Departments | Management | MuLearn Dashboard",
  description: "Manage academic departments linked to organizations.",
};

export default function OrgDepartmentsPage() {
  return <DepartmentsView />;
}
