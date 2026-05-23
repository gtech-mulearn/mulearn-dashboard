"use client";
import { X } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ProjectMember } from "../schemas";

interface Props {
  members: ProjectMember[];
  onRemove?: (memberId: string) => void;
}

export function MemberList({ members, onRemove }: Props) {
  if (members.length === 0)
    return (
      <p className="text-xs text-muted-foreground">No team members yet.</p>
    );
  return (
    <ul className="space-y-1">
      {members.map((m) => (
        <li
          key={m.id}
          className="flex items-center justify-between rounded-md border px-2 py-1 text-sm"
        >
          <div className="flex items-center gap-2">
            {m.is_linked && m.profile_pic ? (
              <Image
                src={m.profile_pic}
                alt={m.full_name}
                width={24}
                height={24}
                className="rounded-full"
              />
            ) : (
              <div className="h-6 w-6 rounded-full bg-muted text-xs flex items-center justify-center">
                {m.full_name.charAt(0)}
              </div>
            )}
            <span>{m.full_name}</span>
            {m.is_linked ? (
              <span className="text-xs text-muted-foreground">({m.muid})</span>
            ) : (
              <Badge variant="outline" className="text-xs">
                External
              </Badge>
            )}
            {m.role && (
              <span className="text-xs text-muted-foreground">· {m.role}</span>
            )}
          </div>
          {onRemove && (
            <Button size="icon" variant="ghost" onClick={() => onRemove(m.id)}>
              <X className="h-3 w-3" />
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
}
