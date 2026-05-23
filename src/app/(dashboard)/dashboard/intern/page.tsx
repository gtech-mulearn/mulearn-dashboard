"use client";

import { Construction } from "lucide-react";

export default function InternPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <Construction className="h-12 w-12 text-muted-foreground/40" />
      <div>
        <h2 className="text-xl font-bold">Coming Soon</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The Intern module is under development.
        </p>
      </div>
    </div>
  );
}
