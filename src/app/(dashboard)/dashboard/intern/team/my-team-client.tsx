"use client";

import { ArrowLeft, Crown, Search, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Pagination from "@/components/dashboard/table/pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useMyTeamMembers } from "@/features/intern";
import { useDebounce } from "@/hooks/use-debounce";
import { getApiResponseError } from "@/hooks/use-get-error";

const PER_PAGE = 20;

export function MyTeamPageClient() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useMyTeamMembers({
    page,
    perPage: PER_PAGE,
    search: debouncedSearch || undefined,
  });
  const members = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <Link href="/dashboard/intern">
            <Button variant="ghost" size="sm" className="gap-1 mb-2 -ml-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          </Link>
          <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase flex items-center gap-3">
            <Users className="w-10 h-10 text-brand-blue" />
            {data?.team ? data.team.name : "My Team"}
          </h2>
          {data?.team && (
            <Badge variant="outline" className="font-mono mt-2">
              {data.team.code}
            </Badge>
          )}
        </div>
        {pagination?.count !== undefined && (
          <p className="text-sm font-bold text-muted-foreground">
            {pagination.count} member{pagination.count === 1 ? "" : "s"}
          </p>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
        <Input
          placeholder="Search by name or MUID..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="pl-12 h-12 bg-card/40 border-border/40 font-bold max-w-xl"
        />
      </div>

      {isLoading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Spinner className="w-8 h-8 text-primary" />
        </div>
      ) : error ? (
        <p className="py-16 text-center text-sm font-semibold text-destructive">
          {getApiResponseError(error, {
            fallback: "Couldn't load your team.",
          })}
        </p>
      ) : members.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          No members found.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {members.map((m) => (
            <div
              key={m.muid}
              className="flex items-center gap-3 rounded-2xl border border-border/40 bg-card p-4"
            >
              <Avatar className="size-10">
                {m.profile_pic && (
                  <AvatarImage src={m.profile_pic} alt={m.full_name} />
                )}
                <AvatarFallback>
                  {m.full_name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-foreground truncate">
                  {m.full_name}
                </p>
                <p className="font-mono text-xs text-muted-foreground">
                  {m.muid}
                </p>
              </div>
              {m.is_lead && (
                <Badge
                  variant="outline"
                  className="gap-1 text-warning border-warning/30"
                >
                  <Crown className="w-3 h-3" /> Lead
                </Badge>
              )}
            </div>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={pagination.totalPages}
          perPage={PER_PAGE}
          totalCount={pagination.count}
          handlePreviousClick={() => setPage((p) => Math.max(1, p - 1))}
          handleNextClick={() =>
            setPage((p) => Math.min(pagination.totalPages, p + 1))
          }
        />
      )}
    </div>
  );
}
