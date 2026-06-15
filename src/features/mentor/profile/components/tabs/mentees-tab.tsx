/**
 * Mentees Tab
 *
 * 📍 src/features/mentor/profile/components/tabs/mentees-tab.tsx
 *
 * Placeholder until the backend provides a mentees list endpoint.
 */

"use client";

import { Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function MenteesTab() {
  return (
    <Card className="rounded-2xl border-border/50">
      <CardContent className="flex min-h-[200px] flex-col items-center justify-center gap-3 py-10 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <Users className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <div>
          <p className="font-medium">Mentees list coming soon</p>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            Backend support for a dedicated mentee list and detail view is in
            progress. Check back once the feature is ready.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
