import { Building2, ChevronRight, User2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account and organization settings.",
};

export default function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm">
          Manage your account and organization details.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="rounded-2xl">
          <CardContent className="flex h-full flex-col justify-between gap-4 p-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User2 className="text-muted-foreground h-4 w-4" />
                <h2 className="text-base font-semibold">Account</h2>
              </div>

              <p className="text-muted-foreground text-sm">
                Change your password.
              </p>
            </div>

            <Button asChild variant="default" className="w-full">
              <Link href="/dashboard/settings/account">
                Open <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="flex h-full flex-col justify-between gap-4 p-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Building2 className="text-muted-foreground h-4 w-4" />
                <h2 className="text-base font-semibold">Campus</h2>
              </div>

              <p className="text-muted-foreground text-sm">
                Change your campus details.
              </p>
            </div>

            <Button asChild variant="default" className="w-full">
              <Link href="/dashboard/settings/organization">
                Open <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
