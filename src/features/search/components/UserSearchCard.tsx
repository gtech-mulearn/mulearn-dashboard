"use client";

import Link from "next/link";
import Image from "next/image";
import { User, Briefcase } from "lucide-react";
import type { UserSearchResult } from "../schemas";

interface UserSearchCardProps {
  user: UserSearchResult;
}

export function UserSearchCard({ user }: UserSearchCardProps) {
  return (
    <Link
      href={`/dashboard/profile/${user.muid}`}
      className="block rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-[#0961F5] hover:shadow-md"
    >
      <div className="flex items-start gap-4">
        {/* Profile Picture */}
        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-gray-100">
          {user.profile_pic ? (
            <Image
              src={user.profile_pic}
              alt={user.full_name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <User className="h-6 w-6 text-gray-400" />
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-gray-900">
            {user.full_name}
          </h3>
          <p className="text-sm text-gray-500">{user.muid}</p>

          {/* Organization */}
          {user.organization && (
            <div className="mt-1 flex items-center gap-1 text-sm text-gray-600">
              <Briefcase className="h-3.5 w-3.5" />
              <span className="truncate">{user.organization}</span>
            </div>
          )}

          {/* Interest Groups */}
          {user.interest_groups.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {user.interest_groups.slice(0, 3).map((ig) => (
                <span
                  key={ig}
                  className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700"
                >
                  {ig}
                </span>
              ))}
              {user.interest_groups.length > 3 && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                  +{user.interest_groups.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Karma */}
        <div className="flex-shrink-0 text-right">
          <div className="text-lg font-bold text-[#0961F5]">{user.karma}</div>
          <div className="text-xs text-gray-500">Karma</div>
        </div>
      </div>
    </Link>
  );
}
