"use client";

import {
  AlertCircle,
  Award,
  BookOpen,
  Coins,
  Flame,
  Send,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button as UIButton } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useIgSponsorshipMetrics,
  useSubmitIgSponsorship,
} from "@/features/company-jobs/hooks";
import { useInterestGroupsList } from "@/features/interest-groups";
import { getApiResponseError } from "@/hooks/use-get-error";

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

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Zap className="h-8 w-8 text-warning" />
            Interest Group Sponsorships
          </h1>
          <p className="text-muted-foreground mt-1">
            Sponsor specialized domain interest groups to build talent pipelines
            and support student learners.
          </p>
        </div>

        <Dialog open={isProposalOpen} onOpenChange={setIsProposalOpen}>
          <DialogTrigger asChild>
            <UIButton className="gap-2 shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground">
              <Sparkles className="h-4 w-4" />
              Sponsor this Interest Group
            </UIButton>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Sponsor Interest Group</DialogTitle>
              <DialogDescription>
                Are you sure you want to submit a sponsorship request for{" "}
                <span className="font-semibold text-foreground">
                  {currentIg?.name || "the selected interest group"}
                </span>
                ? This will notify platform admins for review.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitProposal} className="space-y-4 py-2">
              <DialogFooter>
                <UIButton
                  type="button"
                  variant="outline"
                  onClick={() => setIsProposalOpen(false)}
                >
                  Cancel
                </UIButton>
                <UIButton
                  type="submit"
                  className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={submitProposalMutation.isPending}
                >
                  <Send className="h-4 w-4" />
                  {submitProposalMutation.isPending
                    ? "Submitting..."
                    : "Confirm Request"}
                </UIButton>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Interest Group Picker Selector Card */}
      <Card className="border-primary/20 bg-muted/20">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-semibold text-foreground text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                Select Domain Interest Group
              </h3>
              <p className="text-xs text-muted-foreground">
                View real-time learner engagement and sponsorship statistics
                across specialized µLearn learning tracks.
              </p>
            </div>

            <div className="w-full sm:w-72">
              <Select
                value={selectedIgId}
                onValueChange={setSelectedIgId}
                disabled={isLoadingIgs}
              >
                <SelectTrigger className="w-full bg-background">
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Section for Selected IG */}
      {isLoadingMetrics ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : error ? (
        <Alert
          variant="destructive"
          className="border-destructive/50 text-destructive"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Sponsorship Required</AlertTitle>
          <AlertDescription>
            {getApiResponseError(error, {
              fallback: "This Interest Group is not sponsored by your company.",
            })}
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Members
              </CardTitle>
              <Users className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {(metrics?.membership?.total_members ?? 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {metrics?.membership?.new_members_last_30_days ?? 0} new in the
                last 30 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Tasks
              </CardTitle>
              <Award className="h-5 w-5 text-brand-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {metrics?.activity_level?.active_tasks ?? 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Active tasks in the Interest Group
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Task Completions (30d)
              </CardTitle>
              <Coins className="h-5 w-5 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning">
                {(
                  metrics?.activity_level?.task_completions_last_30_days ?? 0
                ).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Completions in the last 30 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Sessions (30d)
              </CardTitle>
              <Flame className="h-5 w-5 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">
                {metrics?.activity_level?.sessions_last_30_days ?? 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Learning sessions in the last 30 days
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
