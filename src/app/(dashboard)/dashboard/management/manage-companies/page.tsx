import { ManageCompaniesTable } from "@/features/manage-companies";
import { ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";

export const metadata = {
  title: "Manage Companies | Management",
};

export default async function Page() {
  await requireRole([ROLES.ADMIN]);
  return <ManageCompaniesTable />;
}
