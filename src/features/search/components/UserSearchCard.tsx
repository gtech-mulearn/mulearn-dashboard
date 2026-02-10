"use client";

import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { UserSearchResult } from "../schemas";

interface UserSearchCardProps {
  user: UserSearchResult;
}

export function UserSearchCard({ user }: UserSearchCardProps) {
  const [imageError, setImageError] = useState(false);
  const firstLetter = user.full_name.charAt(0).toUpperCase();

  return (
    <div className="rounded-lg bg-card p-6 border border-border hover:shadow-md transition-shadow">
      {/* Header with Profile and Karma */}
      <div className="flex items-start justify-between mb-4">
        {/* Profile Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Profile Picture */}
          <div className="relative h-12 w-12 overflow-hidden rounded-full bg-muted shrink-0">
            {user.profile_pic && !imageError ? (
              <Image
                src={user.profile_pic}
                alt={user.full_name}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground text-lg font-semibold">
                {firstLetter}
              </div>
            )}
          </div>

          {/* Name and Email */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-foreground truncate">
              {user.full_name}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {user.muid}
            </p>
          </div>
        </div>

        {/* Karma */}
        <div className="flex flex-col items-end shrink-0 ml-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">
            KARMA
          </span>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-primary fill-primary" />
            <span className="text-lg font-bold text-primary">
              {user.karma.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Top Skills */}
      {user.interest_groups.length > 0 && (
        <div className="mb-4">
          <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
            TOP SKILLS
          </span>
          <div className="flex flex-wrap gap-2 mt-2">
            {user.interest_groups.slice(0, 3).map((ig) => (
              <span
                key={ig}
                className="rounded-full bg-gradient-to-r from-purple-50 to-indigo-50 px-3 py-1.5 text-sm font-medium text-purple-700 ring-1 ring-inset ring-purple-200"
              >
                {ig}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* View Profile Button */}
      <Button asChild className="w-full">
        <Link href={`/dashboard/profile/${user.muid}`}>View Profile</Link>
      </Button>
    </div>
  );
}
