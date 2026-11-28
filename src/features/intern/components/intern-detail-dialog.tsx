"use client";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useInternDetail } from "../hooks/use-manage-interns";
import { formatDateOnly, formatTeam } from "../utils/intern-helpers";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 text-xs">
      <span className="font-black uppercase tracking-wider text-muted-foreground text-[10px]">
        {label}
      </span>
      <span className="font-bold text-foreground text-right">{value}</span>
    </div>
  );
}

const fmt = (d: string | null | undefined) => (d ? formatDateOnly(d) : "—");

/** Current team + team history for one intern (by user id). */
export function InternDetailDialog({
  userId,
  onClose,
}: {
  userId: string | null;
  onClose: () => void;
}) {
  const { data, isLoading, error } = useInternDetail(userId);
  const current = data?.current_team;

  return (
    <Dialog open={!!userId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-lg border-border/40 bg-card rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-black uppercase tracking-widest">
            {data?.full_name ?? "Intern"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {data?.muid ?? ""}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <Skeleton className="h-40 w-full rounded-xl" />
        ) : error ? (
          <p className="text-sm text-destructive">{error.message}</p>
        ) : (
          <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
            <section className="space-y-2 p-4 rounded-xl border border-border/40 bg-muted/10">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-blue">
                Current Team
              </h4>
              {current ? (
                <>
                  <Row label="Team" value={formatTeam(current.team)} />
                  <Row
                    label="Role"
                    value={current.is_lead ? "Intern Lead" : "Intern"}
                  />
                  <Row
                    label="Status"
                    value={
                      <Badge variant="outline" className="text-[10px]">
                        {current.status.replaceAll("_", " ")}
                      </Badge>
                    }
                  />
                  {current.status_reason && (
                    <Row label="Status reason" value={current.status_reason} />
                  )}
                  <Row
                    label="Tenure"
                    value={`${fmt(current.join_date)} – ${fmt(current.end_date)}`}
                  />
                  {current.tenure_state && (
                    <Row label="Tenure state" value={current.tenure_state} />
                  )}
                </>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Not in a team (deactivated).
                </p>
              )}
            </section>

            <section className="space-y-2">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                Previous Teams
              </h4>
              {data?.previous_teams.length ? (
                data.previous_teams.map((p) => (
                  <div
                    key={`${p.team.id}-${p.joined_at}`}
                    className="space-y-1 p-3 rounded-xl border border-border/30"
                  >
                    <Row label="Team" value={formatTeam(p.team)} />
                    <Row
                      label="Tenure"
                      value={`${fmt(p.join_date)} – ${fmt(p.end_date)}`}
                    />
                    {p.left_at && (
                      <Row
                        label="Left"
                        value={new Date(p.left_at).toLocaleDateString()}
                      />
                    )}
                    {p.exit_reason && (
                      <Row label="Exit reason" value={p.exit_reason} />
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">None.</p>
              )}
            </section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
