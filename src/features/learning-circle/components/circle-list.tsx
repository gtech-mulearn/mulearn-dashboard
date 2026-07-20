/**
 * Circle List Component
 *
 * 📍 src/features/learning-circle/components/circle-list.tsx
 *
 * Masonry-style grid of learning circles with refined search and empty states.
 */

"use client";

import { ArrowRight, Mail, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { StateDisplay } from "@/components/ui/state-display";
import { useActiveInvites, useCircles } from "../hooks";
import { CircleCard } from "./circle-card";

export function CircleList() {
  const { data: circles, isLoading } = useCircles();
  const { activeInvites, activeInvitesCount, joinedCircleIds } =
    useActiveInvites();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredCircles = useMemo(() => {
    if (!circles) return [];

    let list = circles;
    if (statusFilter === "joined") {
      list = circles.filter(
        (circle) => circle.id && joinedCircleIds.has(circle.id),
      );
    }

    if (!searchQuery.trim()) return list;

    const query = searchQuery.toLowerCase();
    return list.filter(
      (circle) =>
        circle.title.toLowerCase().includes(query) ||
        circle.ig.toLowerCase().includes(query) ||
        circle.org?.toLowerCase().includes(query),
    );
  }, [circles, searchQuery, statusFilter, joinedCircleIds]);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
            <Spinner className="relative h-8 w-8 text-primary" />
          </div>
          <p
            className="text-[13px] font-medium text-muted-foreground"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Loading circles…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="space-y-8"
      style={{
        fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
        fontFeatureSettings: "'cv02', 'cv03', 'cv04'",
      }}
    >
      {activeInvitesCount > 0 && (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="text-[14px] font-bold text-foreground">
                You have {activeInvitesCount} pending circle{" "}
                {activeInvitesCount === 1 ? "invitation" : "invitations"}!
              </h4>
              <p className="text-[12px] font-medium text-muted-foreground">
                Accept or reject invitations to join learning circles.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/learning-circle/invites"
            className="inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-[12px] font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] shrink-0"
          >
            View Invitations
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search circles by name, topic, or organization…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 rounded-xl border-[1.5px] border-border bg-card pl-11 pr-4 text-[14px] text-foreground shadow-none
              placeholder:text-muted-foreground
              focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/10 focus-visible:outline-none
              transition-all duration-200"
          />
        </div>
        <div className="w-full sm:w-48 shrink-0">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-12 w-full rounded-xl border-[1.5px] border-border bg-card px-4 py-2.5 text-[13px] font-semibold text-foreground shadow-none focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/10 focus-visible:outline-none transition-all duration-200 cursor-pointer">
              <SelectValue placeholder="Filter circles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Circles</SelectItem>
              <SelectItem value="joined">My Circles</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Empty State */}
      {filteredCircles.length === 0 && (
        <StateDisplay
          variant="no-results"
          className="lc-fade-in rounded-2xl border border-border bg-card shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
          title={searchQuery ? undefined : "No Learning Circles Yet"}
          description={
            searchQuery
              ? undefined
              : "Be the first to create a learning circle and start collaborating with peers!"
          }
        />
      )}

      {/* Circle Grid — CSS columns for masonry effect */}
      {filteredCircles.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 [&>a]:mb-4 [&>a]:break-inside-avoid [&>a]:block">
          {filteredCircles.map((circle, index) => (
            <div
              key={circle.id}
              className="mb-4 break-inside-avoid lc-slide-up"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <CircleCard circle={circle} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
