import { requireRole } from "@/lib/auth/server";
import { ROLES } from "@/lib/auth/roles";
import { ManageCompaniesTable } from "@/features/manage-companies";

export const metadata = {
  title: "Manage Companies | Management",
};

export default async function Page() {
  await requireRole([ROLES.ADMIN]);
  return <ManageCompaniesTable />;
}
