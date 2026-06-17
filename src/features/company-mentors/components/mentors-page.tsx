"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanyMentorNominations } from "@/features/company-jobs/hooks/use-mentor-nominate";
import { NominateMentorModal } from "./nominate-mentor-modal";

export function MentorsPage() {
  const [isNominateModalOpen, setIsNominateModalOpen] = useState(false);
  const { data: nominations, isLoading, error } = useCompanyMentorNominations();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-destructive bg-destructive/10 text-destructive">
        Failed to load mentor nominations.
      </div>
    );
  }

  const mentorsList = nominations || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Company Mentors
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Nominate and manage mentors from your organization to guide the
            community.
          </p>
        </div>
        <Button
          className="shrink-0 gap-2"
          onClick={() => setIsNominateModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Nominate Mentor
        </Button>
      </div>

      {mentorsList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center">
          <h3 className="text-lg font-semibold text-muted-foreground">
            No mentors nominated yet.
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            Click "Nominate Mentor" to suggest a user from your organization.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {mentorsList.map((mentor) => (
            <Card key={mentor.id} className="flex flex-col h-full">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <CardTitle
                      className="text-base line-clamp-1"
                      title={mentor.user_name}
                    >
                      {mentor.user_name}
                    </CardTitle>
                    <CardDescription className="text-xs font-medium text-primary">
                      {mentor.user_email || "No email provided"}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      mentor.status === "APPROVED"
                        ? "default"
                        : mentor.status === "REJECTED"
                          ? "destructive"
                          : "secondary"
                    }
                    className="capitalize shrink-0"
                  >
                    {mentor.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between space-y-4">
                <p
                  className="text-sm text-muted-foreground line-clamp-3"
                  title={mentor.reason || undefined}
                >
                  {mentor.reason}
                </p>
                {mentor.verification_note && (
                  <div className="text-xs bg-muted/50 p-2 rounded-md text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      Admin Note:{" "}
                    </span>
                    {mentor.verification_note}
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-2 mt-auto pt-4 border-t border-border/50">
                  <Badge variant="outline" className="text-xs">
                    Tier: {mentor.mentor_tier}
                  </Badge>
                  {mentor.verified_at && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      Verified:{" "}
                      {new Date(mentor.verified_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <NominateMentorModal
        open={isNominateModalOpen}
        onOpenChange={setIsNominateModalOpen}
      />
    </div>
  );
}
