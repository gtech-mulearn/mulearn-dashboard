"use client";

import { ExternalLink, Search } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { StateDisplay } from "@/components/ui/state-display";
import { usePublicOpportunities } from "../hooks/use-opportunities";

export function PublicOpportunitiesList({
  igId,
  orgId,
}: {
  igId?: string;
  orgId?: string;
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = usePublicOpportunities({
    ig_id: igId,
    org_id: orgId,
    page,
    search: search || undefined,
  });

  const opportunities = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search opportunities..."
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <StateDisplay
          variant="no-results"
          size="sm"
          title="Failed to load public opportunities"
          description="Something went wrong while fetching opportunities. Please try again."
        />
      ) : opportunities.length === 0 ? (
        <StateDisplay variant="no-results" size="sm" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {opportunities.map((opp) => (
            <Card key={opp.id} className="flex flex-col justify-between">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base font-semibold">
                    {opp.title}
                  </CardTitle>
                  <Badge variant="outline">{opp.type}</Badge>
                </div>
                {opp.ig_name && (
                  <p className="text-xs text-muted-foreground">{opp.ig_name}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {opp.description && (
                  <p className="line-clamp-2 text-muted-foreground">
                    {opp.description}
                  </p>
                )}
                {opp.eligibility && (
                  <div className="rounded-md bg-muted/50 p-2 text-xs">
                    <span className="font-semibold">Eligibility: </span>
                    {opp.eligibility}
                  </div>
                )}
                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-muted-foreground">
                    {opp.ends_at
                      ? `Deadline: ${new Date(opp.ends_at).toLocaleDateString()}`
                      : "No deadline"}
                  </div>
                  {opp.application_url && (
                    <Button size="sm" asChild variant="default">
                      <a
                        href={opp.application_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Apply <ExternalLink className="ml-1 h-3.5 w-3.5" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
