"use client";

import {
  Activity,
  AlertCircle,
  CircleCheck,
  HandCoins,
  ListTodo,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageHeader } from "@/components/ui/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import {
  useIgSponsorshipMetrics,
  useSubmitIgSponsorship,
} from "@/features/company-jobs/hooks";
import { useInterestGroupsList } from "@/features/interest-groups";
import { getApiResponseError } from "@/hooks/use-get-error";

const STAT_SKELETON_KEYS = ["members", "tasks", "completions", "sessions"];

export function CompanySponsorshipPageClient() {
  const { data: igsData, isLoading: isLoadingIgs } = useInterestGroupsList();
  const igList = igsData?.response?.interestGroup ?? [];

  const [selectedIgId, setSelectedIgId] = useState<string>("");

  useEffect(() => {
    if (!selectedIgId && igList.length > 0) {
      setSelectedIgId(igList[0].id);
    }
  }, [igList, selectedIgId]);

  const {
    data: metrics,
    isLoading: isLoadingMetrics,
    error,
  } = useIgSponsorshipMetrics(selectedIgId);
  const submitProposalMutation = useSubmitIgSponsorship();

  const [isProposalOpen, setIsProposalOpen] = useState(false);

  const currentIg = igList.find((g) => g.id === selectedIgId);

  const handleSubmitProposal = async () => {
    if (!selectedIgId) {
      toast.error("Please select an Interest Group.");
      return;
    }

    try {
      await submitProposalMutation.mutateAsync({
        igId: selectedIgId,
      });
      toast.success("Sponsorship request submitted. Awaiting admin approval.");
      setIsProposalOpen(false);
    } catch {
      toast.error("Failed to submit sponsorship request.");
    }
  };

  return (
    <div className="space-y-8">
      <div data-tour-id="page:company-sponsorship:header">
        <PageHeader
          title="Interest Group Sponsorships"
          description="Sponsor specialized domain interest groups to build talent pipelines and support student learners."
          action={
            <Button
              className="shrink-0"
              onClick={() => setIsProposalOpen(true)}
              disabled={!selectedIgId}
            >
              <HandCoins />
              Sponsor this Interest Group
            </Button>
          }
        />
      </div>

      <ConfirmDialog
        open={isProposalOpen}
        onOpenChange={setIsProposalOpen}
        variant="default"
        title="Sponsor Interest Group"
        description={`Submit a sponsorship request for ${
          currentIg?.name ?? "the selected interest group"
        }? This will notify platform admins for review.`}
        confirmLabel="Submit request"
        isPending={submitProposalMutation.isPending}
        onConfirm={handleSubmitProposal}
      />

      {/* Interest Group picker */}
      <Card data-tour-id="page:company-sponsorship:picker">
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <CardTitle>Select Domain Interest Group</CardTitle>
            <CardDescription>
              View real-time learner engagement and sponsorship statistics
              across specialized µLearn learning tracks.
            </CardDescription>
          </div>

          <Select
            value={selectedIgId}
            onValueChange={setSelectedIgId}
            disabled={isLoadingIgs}
          >
            <SelectTrigger
              className="w-full sm:w-72"
              aria-label="Interest group"
            >
              <SelectValue placeholder="Choose Interest Group" />
            </SelectTrigger>
            <SelectContent>
              {igList.map((ig) => (
                <SelectItem key={ig.id} value={ig.id}>
                  {ig.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Metrics for the selected Interest Group */}
      {isLoadingMetrics ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STAT_SKELETON_KEYS.map((key) => (
            <Skeleton key={key} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Sponsorship Required</AlertTitle>
          <AlertDescription>
            {getApiResponseError(error, {
              fallback: "This Interest Group is not sponsored by your company.",
            })}
          </AlertDescription>
        </Alert>
      ) : (
        <div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          data-tour-id="page:company-sponsorship:metrics"
        >
          <StatCard
            title="Total Members"
            value={(metrics?.membership?.total_members ?? 0).toLocaleString()}
            description={`${metrics?.membership?.new_members_last_30_days ?? 0} new in the last 30 days`}
            icon={<Users className="size-5" />}
            accent="chart-1"
          />
          <StatCard
            title="Active Tasks"
            value={(
              metrics?.activity_level?.active_tasks ?? 0
            ).toLocaleString()}
            description="Open in this interest group"
            icon={<ListTodo className="size-5" />}
            accent="chart-2"
          />
          <StatCard
            title="Task Completions (30d)"
            value={(
              metrics?.activity_level?.task_completions_last_30_days ?? 0
            ).toLocaleString()}
            description="Completed in the last 30 days"
            icon={<CircleCheck className="size-5" />}
            accent="chart-3"
          />
          <StatCard
            title="Sessions (30d)"
            value={(
              metrics?.activity_level?.sessions_last_30_days ?? 0
            ).toLocaleString()}
            description="Learning sessions logged"
            icon={<Activity className="size-5" />}
            accent="chart-4"
          />
        </div>
      )}
    </div>
  );
}
