import { Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { resolveMediaUrl } from "@/lib/utils";
import type { EventCoOwner } from "../types";

interface EventCoOwnersSectionProps {
  coOwners?: EventCoOwner[];
}

export function EventCoOwnersSection({ coOwners }: EventCoOwnersSectionProps) {
  if (!coOwners || coOwners.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-2.5 px-5 py-4">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
          <Users className="size-4 text-primary" />
        </div>
        <h2 className="text-base font-bold text-foreground">Co-Owners</h2>
      </div>
      <div className="px-5 pb-5 pt-0 space-y-3">
        {coOwners.map((item) => {
          const user = item.user;
          const name = user?.full_name || item.full_name || "Co-Owner";
          const muid = user?.muid || item.muid;
          const rawPic =
            user?.profile_pic ||
            user?.profile_picture ||
            user?.avatar ||
            item.profile_pic ||
            item.profile_picture ||
            item.avatar ||
            null;
          const resolvedPic = resolveMediaUrl(rawPic) ?? rawPic ?? undefined;
          const initials = name.charAt(0).toUpperCase() || "C";

          return (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-xl bg-muted/40 px-4 py-2.5"
            >
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarImage src={resolvedPic} alt={name} />
                <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {name}
                </p>
                {muid ? (
                  <p className="text-xs text-muted-foreground">@{muid}</p>
                ) : null}
              </div>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
                Co-Owner
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
