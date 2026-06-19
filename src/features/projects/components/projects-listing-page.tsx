"use client";

import { Folder } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Pagination from "@/components/dashboard/table/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { useUserProfile } from "@/features/profile";
import { useDebounce } from "@/hooks/use-debounce";
import { usePublicProjects } from "../hooks";
import { ProjectCard } from "./project-card";
import { ProjectDetailModal } from "./project-detail-modal";

export function ProjectsListingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  const [page, setPage] = useState(() => {
    const p = Number(searchParams.get("page"));
    return p > 0 ? p : 1;
  });
  const [detailId, setDetailId] = useState<string | undefined>();

  const debouncedSearch = useDebounce(search, 300);

  const { data: profile } = useUserProfile();
  const currentUserId = profile?.id ?? null;

  // Sync URL without polluting history
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString() !== "" ? `?${params}` : "";
    router.replace(`/dashboard/projects${qs}`);
  }, [debouncedSearch, page, router]);

  const { data, isLoading, isError, refetch } = usePublicProjects(
    debouncedSearch,
    page,
  );

  const projects = data?.projects ?? [];
  const pagination = data?.pagination;

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="flex-1 lc-fade-in">
      {/* Sticky header */}
      <div className="sticky top-0 z-30 border-b border-border bg-background/95 px-6 pb-4 pt-6 backdrop-blur-sm md:px-8 md:pt-8">
        <PageHeader
          title={
            <>
              Projects
              {pagination && (
                <span className="ml-2 text-base font-normal text-muted-foreground">
                  ({pagination.count} total)
                </span>
              )}
            </>
          }
          action={
            <div className="w-full sm:max-w-xs">
              <Input
                aria-label="Search projects"
                placeholder="Search projects…"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="h-9"
              />
            </div>
          }
        />
      </div>

      {/* Scrollable content */}
      <div className="space-y-6 px-6 py-6 md:px-8">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: stable skeleton list
                key={i}
                className="h-56 animate-pulse rounded-2xl bg-muted"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-2xl bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load projects.</p>
            <Button onClick={() => refetch()} className="mt-2">
              Try again
            </Button>
          </div>
        ) : projects.length === 0 ? (
          <div className="py-12 text-center">
            <Folder className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <p className="mt-3 text-muted-foreground">
              {debouncedSearch
                ? `No projects match "${debouncedSearch}". Try a different search.`
                : "No projects published yet. Be the first!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                canEdit={false}
                currentUserId={currentUserId}
                onOpen={() => setDetailId(p.id)}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            ))}
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={pagination.totalPages}
            perPage={12}
            totalCount={pagination.count}
            handlePreviousClick={() => handlePageChange(page - 1)}
            handleNextClick={() => handlePageChange(page + 1)}
          />
        )}
      </div>

      {detailId && (
        <ProjectDetailModal
          open
          onOpenChange={(o) => {
            if (!o) setDetailId(undefined);
          }}
          projectId={detailId}
          currentUserId={currentUserId}
          canEdit={false}
        />
      )}
    </main>
  );
}
