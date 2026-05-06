import { Calendar, CheckCircle2 } from "lucide-react";
import { useUserInfo } from "@/features/auth/hooks/use-session";
import { MOCK_MENTOR_NEXT_SESSION } from "../../constants/mock-mentor";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function MentorHeroCard() {
  const { data: userInfo } = useUserInfo();
  const firstName = userInfo?.full_name?.split(" ")[0] ?? "Mentor";

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-3.5" />
            Verified Mentor
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            {getGreeting()}, <span className="text-primary">{firstName}.</span>
          </h2>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="size-4 text-muted-foreground" />
            Next session with{" "}
            <span className="font-medium text-foreground">
              {MOCK_MENTOR_NEXT_SESSION.name}
            </span>
            {" — "}
            {MOCK_MENTOR_NEXT_SESSION.dateLabel}
          </p>
        </div>
      </div>
    </div>
  );
}
