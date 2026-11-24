import { INTERN_MANAGEMENT_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";
import { TimesheetsPageClient } from "./timesheets-client";

export const metadata = {
  title: "Timesheets & Reviews | Management",
};

export default async function Page() {
  await requireRole(INTERN_MANAGEMENT_ROLES);
  return <TimesheetsPageClient />;
}
