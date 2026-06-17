import type { Metadata } from "next";
import { RoleVerificationTable } from "@/features/role-verification";

export const metadata: Metadata = {
  title: "Role Verification",
  description: "Verify or reject pending user-role link requests.",
};

export default function RoleVerificationPage() {
  return (
    <div className="container mx-auto space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Role Verification Management
        </h1>
        <p className="text-sm text-muted-foreground md:text-base mt-2">
          Verify or reject pending user-role link requests.
        </p>
      </div>
      <RoleVerificationTable />
    </div>
  );
}
