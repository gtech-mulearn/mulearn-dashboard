import { Calendar, CheckCircle2, Shield } from "lucide-react";
import { useUserInfo } from "@/features/auth/hooks/use-session";
import type { MentorNextSession } from "../../schemas/home.schema";

type MentorHeroCardProps = {
  nextSession: MentorNextSession;
  isVerified: boolean;
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatSessionLabel(session: NonNullable<MentorNextSession>): string {
  const name = session.mentee_name || "a mentee";
  const date = new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(session.starts_at));
  return `${name} — ${date}`;
}

export function MentorHeroCard({
  nextSession,
  isVerified,
}: MentorHeroCardProps) {
  const { data: userInfo } = useUserInfo();
  const firstName = userInfo?.full_name?.split(" ")[0] ?? "Mentor";

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          {isVerified ? (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
              <CheckCircle2 className="size-3.5" />
              Verified Mentor
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-warning/15 px-3 py-1 text-xs font-semibold text-warning">
              <Shield className="size-3.5" />
              Mentor
            </div>
          )}
          <h2 className="text-2xl font-bold text-foreground">
            {getGreeting()}, <span className="text-primary">{firstName}.</span>
          </h2>
          {nextSession ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="size-4 text-muted-foreground" />
              Next session with{" "}
              <span className="font-medium text-foreground">
                {formatSessionLabel(nextSession)}
              </span>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              No upcoming sessions scheduled.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
