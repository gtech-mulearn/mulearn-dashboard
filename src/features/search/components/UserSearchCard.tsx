"use client";

import Link from "next/link";
import Image from "next/image";
import { User, Star } from "lucide-react";
import type { UserSearchResult } from "../schemas";

interface UserSearchCardProps {
  user: UserSearchResult;
}

export function UserSearchCard({ user }: UserSearchCardProps) {
  return (
    <div className="rounded-lg bg-card p-6 border border-border hover:shadow-md transition-shadow">
      {/* Header with Profile and Karma */}
      <div className="flex items-start justify-between mb-4">
        {/* Profile Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Profile Picture */}
          <div className="relative h-12 w-12 overflow-hidden rounded-full bg-muted shrink-0">
            {user.profile_pic ? (
              <Image
                src={user.profile_pic}
                alt={user.full_name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <User className="h-6 w-6 text-muted-foreground" />
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
            <Star className="h-4 w-4 text-blue-500 fill-blue-500" />
            <span className="text-lg font-bold text-blue-600">
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
                className="rounded-md bg-muted px-3 py-1 text-xs font-medium text-foreground"
              >
                {ig}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* View Profile Button */}
      <Link
        href={`/dashboard/profile/${user.muid}`}
        className="block w-full text-center py-2 rounded-md border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
      >
        View Profile
      </Link>
    </div>
  );
}
