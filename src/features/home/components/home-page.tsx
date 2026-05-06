"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserInfo } from "@/features/auth/hooks/use-session";
import { usePermissions } from "@/hooks/use-permissions";
import { CAMPUS_MANAGEMENT_ROLES, ROLES } from "@/lib/auth";
import { CompanyHome } from "./company-home";
import { EnablerHome } from "./enabler-home";
import { MentorHome } from "./mentor-home";
import { MuLearnerHome } from "./mulearner-home";
import { VerificationStatusBanner } from "./verification-status-banner";

type DashboardView = "student" | "campus";

function _RoleComingSoon({ roleName }: { roleName: string }) {
  return (
    <div className="flex min-h-100 items-center justify-center rounded-2xl border bg-card shadow-sm">
      <div className="space-y-2 text-center">
        <p className="text-lg font-semibold text-foreground">
          {roleName} Dashboard
        </p>
        <p className="text-sm text-muted-foreground">Coming soon</p>
      </div>
    </div>
  );
}

function HomeLoadingSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-5 gap-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-48 rounded-2xl" />
      <div className="grid grid-cols-2 gap-5">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </div>
  );
}

function DualRoleToggle({
  view,
  onChange,
}: {
  view: DashboardView;
  onChange: (v: DashboardView) => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-xl border bg-muted p-1 w-fit">
      {(["student", "campus"] as const).map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
            view === v
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {v === "student" ? "Student" : "Campus Lead"}
        </button>
      ))}
    </div>
  );
}

export function HomePage() {
  const { roles, isLoading } = usePermissions();
  const { data: userInfo } = useUserInfo();
  const [dualView, setDualView] = useState<DashboardView>("student");

  if (isLoading) return <HomeLoadingSkeleton />;

  const isCampusRole = roles.some((r) =>
    (CAMPUS_MANAGEMENT_ROLES as readonly string[]).includes(r),
  );
  const isStudent =
    roles.includes(ROLES.STUDENT) || roles.includes(ROLES.PRE_MEMBER);
  const isDualRole = isCampusRole && isStudent;

  const renderHome = () => {
    if (roles.includes(ROLES.MENTOR)) return <MentorHome />;
    if (roles.includes(ROLES.COMPANY)) return <CompanyHome />;
    if (isDualRole) {
      return dualView === "campus" ? <EnablerHome /> : <MuLearnerHome />;
    }
    if (isCampusRole) return <EnablerHome />;
    return <MuLearnerHome />;
  };

  return (
    <div className="space-y-5 p-1">
      <VerificationStatusBanner roles={userInfo?.roles ?? []} />
      {isDualRole && <DualRoleToggle view={dualView} onChange={setDualView} />}
      {renderHome()}
    </div>
  );
}
