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
    <div className="rounded-lg bg-card p-6 border border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 hover:bg-card/80 transition-all duration-300 flex flex-col h-full cursor-pointer group">
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

      {/* Top Skills - Fixed height container */}
      <div className="mb-4 min-h-[80px]">
        {user.interest_groups.length > 0 && (
          <>
            <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
              TOP SKILLS
            </span>
            <div className="flex flex-wrap gap-2 mt-2">
              {user.interest_groups.slice(0, 3).map((ig) => (
                <span
                  key={ig}
                  className="rounded-full from-primary-50 to-primary/10 px-3 py-1.5 text-sm font-medium text-primary"
                >
                  {ig}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Spacer to push button to bottom */}
      <div className="flex-grow"></div>

      {/* View Profile Button */}
      <Button
        asChild
        className="w-full bg-primary/90 hover:bg-primary/90 text-background transition-all duration-300 shadow-[0_0_15px_rgba(9,97,245,0.3)] hover:shadow-[0_0_25px_rgba(9,97,245,0.5)] hover:scale-105 border border-primary/20"
      >
        <Link
          href={`/dashboard/profile/${user.muid}`}
          className="flex items-center justify-center gap-2 uppercase tracking-widest text-xs font-bold"
        >
          <span>View Profile</span>
        </Link>
      </Button>
    </div>
  );
}
