"use client";

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { pickCardGradient } from "@/lib/card-gradients";
import type { UserSearchResult } from "../schemas";

interface UserSearchCardProps {
  user: UserSearchResult;
}

export function UserSearchCard({ user }: UserSearchCardProps) {
  const [imageError, setImageError] = useState(false);
  const firstLetter = user.full_name.charAt(0).toUpperCase();
  const uniqueIgs = Array.from(new Set(user.interest_groups || []));
  const profilePic = user.profile_pic;
  const hasImage = Boolean(profilePic) && !imageError;

  // Deterministic pastel fallback, stable across renders, for photoless cards.
  const pastel = pickCardGradient(user.muid);

  // Over a photo, text sits on a dark scrim and stays white. Over the light
  // pastel fallback it must flip dark (with frosted-white chips) to stay legible.
  const onPhoto = hasImage;
  const titleCls = onPhoto ? "text-white drop-shadow-md" : "text-slate-900";
  const badgeCls = onPhoto
    ? "border-white/25 bg-black/15 text-white"
    : "border-white/60 bg-white/45 text-slate-800";
  const chipCls = onPhoto
    ? "border-white/25 bg-black/5 text-white"
    : "border-white/60 bg-white/45 text-slate-700";
  const barCls = onPhoto
    ? "border-white/25 bg-black/5"
    : "border-white/60 bg-white/45";
  const muidCls = onPhoto ? "text-white" : "text-slate-700";

  return (
    <Link
      href={`/profile/${user.muid}`}
      className="group block rounded-[2rem] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <Card className="relative aspect-square w-full gap-0 overflow-hidden rounded-[2rem] border-0 p-0 shadow-sm ring-1 ring-black/5 transition-all duration-500 group-hover:-translate-y-1.5 group-hover:shadow-2xl group-hover:shadow-black/25 motion-reduce:transform-none motion-reduce:transition-none">
        {/* Background: profile photo, or pastel fallback with a monogram */}
        {hasImage && profilePic ? (
          <Image
            src={profilePic}
            alt={user.full_name}
            fill
            sizes="(max-width: 768px) 100vw, 320px"
            className="object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transform-none"
            onError={() => setImageError(true)}
          />
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center bg-linear-to-br ${pastel}`}
          >
            <span className="select-none text-7xl font-black leading-none text-white/70 drop-shadow-md">
              {firstLetter}
            </span>
          </div>
        )}

        {/* Scrim only over photos — the pastel fallback uses dark text instead. */}
        {onPhoto && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-linear-to-t from-black/25 to-transparent" />
        )}

        {/* Top: name + karma badge */}
        <CardHeader className="absolute inset-x-0 top-0 z-10 flex flex-row items-start justify-between gap-3 p-4">
          <CardTitle
            className={`font-display line-clamp-2 text-2xl font-bold leading-tight [text-wrap:balance] ${titleCls}`}
          >
            {user.full_name}
          </CardTitle>
          <div
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 backdrop-blur-md ${badgeCls}`}
          >
            <span className="font-display text-sm font-bold">
              {user.karma.toLocaleString()} Karma Pts
            </span>
          </div>
        </CardHeader>

        {/* Bottom: interest-group chips + glassmorphic detail bar */}
        <CardFooter className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-stretch gap-2.5 p-3">
          {uniqueIgs.length > 0 && (
            <div className="flex flex-wrap gap-1.5 px-1">
              {uniqueIgs.slice(0, 3).map((ig) => (
                <span
                  key={ig}
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold backdrop-blur-md ${chipCls}`}
                >
                  {ig}
                </span>
              ))}
              {uniqueIgs.length > 3 && (
                <span
                  className={`rounded-full border px-2 py-1 text-[11px] font-semibold backdrop-blur-md ${chipCls}`}
                >
                  +{uniqueIgs.length - 3}
                </span>
              )}
            </div>
          )}

          <div
            className={`flex items-center justify-between gap-3 rounded-[1.4rem] border p-2.5 shadow-lg ring-1 ring-black/5 backdrop-blur-xl ${barCls}`}
          >
            <div className="flex min-w-0 items-center gap-2.5 pl-1">
              <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full ring-1 ring-white/40">
                {hasImage && profilePic ? (
                  <Image
                    src={profilePic}
                    alt=""
                    fill
                    sizes="36px"
                    className="object-cover"
                  />
                ) : (
                  <div
                    className={`flex h-full w-full items-center justify-center bg-linear-to-br ${pastel} text-sm font-black text-slate-800`}
                  >
                    {firstLetter}
                  </div>
                )}
              </div>
              <span
                className={`truncate font-mono text-xs font-semibold tracking-wide ${muidCls}`}
              >
                {user.muid}
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-sm font-semibold text-slate-900 shadow-sm transition-colors group-hover:bg-white/90">
              View Profile
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none" />
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
