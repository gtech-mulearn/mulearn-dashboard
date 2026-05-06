import { Handshake } from "lucide-react";
import Image from "next/image";
import type { EventCollaborator } from "../types";

interface EventCollaboratorsSectionProps {
  collaborators: EventCollaborator[];
}

export function EventCollaboratorsSection({
  collaborators,
}: EventCollaboratorsSectionProps) {
  const acceptedCollaborators = collaborators.filter(
    (collab) => collab.invite_status === "accepted",
  );

  if (acceptedCollaborators.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-2.5 px-5 py-4">
        <div className="flex size-9 items-center justify-center rounded-xl bg-brand-blue/10">
          <Handshake className="size-4 text-brand-blue" />
        </div>
        <h2 className="text-base font-bold text-foreground">
          Partnering Organizations
        </h2>
      </div>
      <div className="px-5 pb-5 pt-0 space-y-3">
        {acceptedCollaborators.map((collab) => {
          const entityName =
            collab.entity_detail && typeof collab.entity_detail === "object"
              ? "name" in collab.entity_detail &&
                typeof collab.entity_detail.name === "string"
                ? collab.entity_detail.name
                : "title" in collab.entity_detail &&
                    typeof collab.entity_detail.title === "string"
                  ? collab.entity_detail.title
                  : null
              : null;

          const name =
            entityName ??
            collab.ig?.name ??
            collab.campus?.title ??
            collab.campus?.name ??
            (collab.ig?.name && collab.campus_ig?.name
              ? `${collab.ig.name} @ ${collab.campus_ig.name}`
              : null) ??
            collab.company?.title ??
            collab.company?.name ??
            "Collaborator";

          const logo =
            collab.entity_detail?.logo ??
            collab.ig?.icon ??
            collab.ig?.logo ??
            collab.campus?.logo ??
            collab.company?.logo;
          const initials = name.slice(0, 2).toUpperCase();

          const collabTypeLabel =
            collab.role_label ||
            collab.entity_type.replace("collab_", "").toUpperCase();

          return (
            <div
              key={collab.id}
              className="flex items-center gap-3 rounded-xl bg-muted/40 px-4 py-2.5"
            >
              {logo ? (
                <div className="relative size-8 shrink-0 overflow-hidden rounded-lg bg-background">
                  <Image src={logo} alt={name} fill className="object-cover" />
                </div>
              ) : (
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary">
                  <span className="text-[10px] font-black text-primary-foreground">
                    {initials}
                  </span>
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {name}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {collabTypeLabel}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
