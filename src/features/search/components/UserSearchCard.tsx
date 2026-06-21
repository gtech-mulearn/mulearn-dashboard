"use client";

import { ArrowUpRight, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { UserSearchResult } from "../schemas";

interface UserSearchCardProps {
  user: UserSearchResult;
}

export function UserSearchCard({ user }: UserSearchCardProps) {
  const [imageError, setImageError] = useState(false);
  const firstLetter = user.full_name.charAt(0).toUpperCase();
  const uniqueIgs = Array.from(new Set(user.interest_groups || []));

  return (
    <Link
      href={`/profile/${user.muid}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-border/50 bg-card shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/20 focus:outline-none focus:ring-2 focus:ring-primary"
    >
      {/* Soft gradient splash top right for depth */}
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl transition-all duration-700 group-hover:scale-150 group-hover:bg-primary/20" />

      <div className="relative z-10 flex h-full flex-col p-6">
        {/* Profile & Karma */}
        <div className="flex items-start justify-between">
          <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-2xl ring-1 ring-border/50 shadow-sm transition-transform duration-500 group-hover:rotate-3 group-hover:scale-105 group-hover:shadow-lg">
            {user.profile_pic && !imageError ? (
              <Image
                src={user.profile_pic}
                alt={user.full_name}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-primary/80 to-primary text-2xl font-black text-primary-foreground drop-shadow-sm">
                {firstLetter}
              </div>
            )}
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/80">
              Karma
            </span>
            <div className="mt-1 flex items-center gap-1.5 rounded-full bg-background px-3 py-1 ring-1 ring-border shadow-sm transition-colors group-hover:ring-yellow-500/30">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 drop-shadow-sm" />
              <span className="font-display font-bold text-foreground">
                {user.karma.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Name block */}
        <div className="mt-6">
          <h3 className="text-2xl font-bold leading-tight text-foreground transition-colors group-hover:text-primary">
            {user.full_name}
          </h3>
          <p className="mt-1 font-mono text-xs font-semibold tracking-widest text-muted-foreground">
            {user.muid}
          </p>
        </div>

        {/* Skills */}
        <div className="mt-6 flex-grow">
          {uniqueIgs.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {uniqueIgs.slice(0, 3).map((ig) => (
                <span
                  key={ig}
                  className="rounded-full bg-muted/50 px-3 py-1 text-xs font-bold text-muted-foreground ring-1 ring-border/50 transition-all duration-300 group-hover:bg-primary/10 group-hover:text-primary group-hover:ring-primary/30"
                >
                  {ig}
                </span>
              ))}
              {uniqueIgs.length > 3 && (
                <span className="rounded-full bg-background px-2 py-1 text-xs font-bold text-muted-foreground ring-1 ring-border/50 transition-all duration-300 group-hover:border-primary/30">
                  +{uniqueIgs.length - 3}
                </span>
              )}
            </div>
          ) : (
            <div className="text-xs font-medium italic text-muted-foreground/70">
              No skills listed
            </div>
          )}
        </div>

        {/* Footer / Action */}
        <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-5">
          <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground transition-colors group-hover:text-primary">
            View Profile
          </span>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground shadow-sm transition-all duration-500 group-hover:bg-primary group-hover:text-primary-foreground sm:group-hover:rotate-12">
            <ArrowUpRight className="h-5 w-5" />
          </div>
        </div>
      </div>
    </Link>
  );
}
