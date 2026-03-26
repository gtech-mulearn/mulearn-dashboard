"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAddCoOwner, useEventCoOwners, useRemoveCoOwner } from "../hooks";

interface CoOwnersPanelProps {
  eventId: string;
}

export function CoOwnersPanel({ eventId }: CoOwnersPanelProps) {
  const [userId, setUserId] = useState("");
  const { data: coOwners } = useEventCoOwners(eventId);
  const addCoOwner = useAddCoOwner(eventId);
  const removeCoOwner = useRemoveCoOwner(eventId);

  return (
    <section className="space-y-3 rounded-lg border p-4">
      <h3 className="font-semibold">Co-Owners</h3>

      <div className="space-y-2">
        {(coOwners ?? []).map((coOwner) => (
          <div
            key={coOwner.id}
            className="flex items-center gap-3 rounded border p-2"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={coOwner.user.profile_pic ?? undefined} />
              <AvatarFallback>
                {coOwner.user.full_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {coOwner.user.full_name}
              </p>
              <p className="text-xs text-gray-500">{coOwner.user.muid}</p>
            </div>
            <Badge variant="outline">{coOwner.role}</Badge>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                if (window.confirm("Remove this co-owner?")) {
                  removeCoOwner.mutate(coOwner.id);
                }
              }}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="User UUID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <Button
          type="button"
          onClick={() => {
            if (!userId.trim()) return;
            addCoOwner.mutate({ user_id: userId.trim() });
            setUserId("");
          }}
        >
          Add
        </Button>
      </div>
    </section>
  );
}
