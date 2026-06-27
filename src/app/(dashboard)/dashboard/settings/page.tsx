import { Building2, ChevronRight, User2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RoleGate } from "@/components/auth/role-gate";
import { CAMPUS_SETTINGS_ROLES } from "@/lib/auth/roles";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account and organization settings.",
};

export default function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm">
          Manage your account and organization details.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="rounded-2xl">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                <User2 className="text-muted-foreground h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <h2 className="text-base font-semibold">Account</h2>
                <p className="text-muted-foreground text-sm">
                  Change your password.
                </p>
              </div>
            </div>

            <Button asChild variant="link">
              <Link href="/dashboard/settings/account">
                Open
                <ChevronRight className="h-5 w-5" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <RoleGate allowedRoles={CAMPUS_SETTINGS_ROLES}>
          <Card className="rounded-2xl">
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                  <Building2 className="text-muted-foreground h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <h2 className="text-base font-semibold">Campus</h2>
                  <p className="text-muted-foreground text-sm">
                    Change your campus details.
                  </p>
                </div>
              </div>

              <Button asChild variant="link">
                <Link href="/dashboard/settings/organization">
                  Open
                  <ChevronRight className="h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </RoleGate>
      </div>
    </div>
  );
}
