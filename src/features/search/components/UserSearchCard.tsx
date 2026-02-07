"use client";

import Link from "next/link";
import Image from "next/image";
import { User } from "lucide-react";
import type { UserSearchResult } from "../schemas";

interface UserSearchCardProps {
  user: UserSearchResult;
}

const badgeColors = [
  "bg-pink-200 text-pink-700",
  "bg-green-200 text-green-700",
  "bg-blue-200 text-blue-700",
  "bg-purple-200 text-purple-700",
  "bg-yellow-200 text-yellow-700",
  "bg-indigo-200 text-indigo-700",
];

export function UserSearchCard({ user }: UserSearchCardProps) {
  return (
    <Link
      href={`/dashboard/profile/${user.muid}`}
      className="block rounded-2xl bg-card p-8 shadow-md hover:shadow-xl transition-all duration-300 border border-border"
    >
      <div className="flex flex-col items-center text-center">
        {/* Profile Picture */}
        <div className="relative h-24 w-24 overflow-hidden rounded-full bg-muted mb-4">
          {user.profile_pic ? (
            <Image
              src={user.profile_pic}
              alt={user.full_name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <User className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* User Name */}
        <h3 className="text-lg font-bold text-card-foreground mb-2">
          {user.full_name}
        </h3>

        {/* Email/MUID */}
        <p className="text-sm text-muted-foreground mb-2 truncate max-w-full px-2">
          {user.muid}
        </p>

        {/* Karma */}
        <p className="text-base font-medium text-primary mb-4">
          Karma: {user.karma.toLocaleString()}
        </p>

        {/* Interest Groups */}
        {user.interest_groups.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {user.interest_groups.map((ig, index) => (
              <span
                key={ig}
                className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                  badgeColors[index % badgeColors.length]
                }`}
              >
                {ig}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
