"use client";

import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { useState } from "react";
import type { UserSearchResult } from "../schemas";

interface UserSearchCardProps {
  user: UserSearchResult;
}

export function UserSearchCard({ user }: UserSearchCardProps) {
  const [imageError, setImageError] = useState(false);
  const firstLetter = user.full_name.charAt(0).toUpperCase();

  return (
    <div className="rounded-2xl bg-card p-6 border border-border hover:shadow-md transition-shadow flex flex-col h-full">
      {/* Header with Karma */}
      <div className="flex items-start justify-between mb-4">
        {/* Profile Picture */}
        <div className="relative h-16 w-16 overflow-hidden rounded-full bg-muted shrink-0">
          {user.profile_pic && !imageError ? (
            <Image
              src={user.profile_pic}
              alt={user.full_name}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted text-background text-xl font-semibold">
              {firstLetter}
            </div>
          )}
        </div>

        {/* Karma */}
        <div className="flex flex-col items-end shrink-0">
          <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
            KARMA
          </span>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-blue-600 fill-blue-600" />
            <span className="text-xl font-bold text-blue-600">
              {user.karma.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Name and Email - Below Profile Picture */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-foreground mb-1">
          {user.full_name}
        </h3>
        <p className="text-sm text-muted-foreground truncate">{user.muid}</p>
      </div>

      {/* Top Skills */}
      <div className="mb-6 flex-grow">
        {user.interest_groups.length > 0 && (
          <>
            <span className="text-xs text-primary uppercase tracking-wide font-medium">
              TOP SKILLS
            </span>
            <div className="flex flex-wrap gap-2 mt-2">
              {user.interest_groups.slice(0, 3).map((ig) => (
                <span
                  key={ig}
                  className="rounded-md  px-3 py-1.5 text-xs font-medium text-primary"
                >
                  {ig}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* View Profile Button */}
      <Link
        href={`/dashboard/profile/${user.muid}`}
        className="block w-full text-center py-2.5 rounded-md border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
      >
        View Profile
      </Link>
    </div>
  );
}
