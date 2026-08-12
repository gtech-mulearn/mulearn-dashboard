"use client";

import {
  Award,
  BookOpen,
  CheckCircle2,
  Coins,
  Flame,
  Send,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useIgSponsorshipMetrics,
  useSubmitIgSponsorship,
} from "@/features/company-jobs/hooks";
import { useInterestGroupsList } from "@/features/interest-groups";

export function CompanySponsorshipPageClient() {
  const { data: igsData, isLoading: isLoadingIgs } = useInterestGroupsList();
  const igList = igsData?.response?.interestGroup ?? [];

  const [selectedIgId, setSelectedIgId] = useState<string>("");

  useEffect(() => {
    if (!selectedIgId && igList.length > 0) {
      setSelectedIgId(igList[0].id);
    }
  }, [igList, selectedIgId]);

  const { data: metrics, isLoading: isLoadingMetrics } =
    useIgSponsorshipMetrics(selectedIgId);
  const submitProposalMutation = useSubmitIgSponsorship();

  const [isProposalOpen, setIsProposalOpen] = useState(false);
  const [fundingAmount, setFundingAmount] = useState<string>("50000");
  const [deliverables, setDeliverables] = useState<string>(
    "5 Sponsored Tasks, 1 Technical Workshop, 1 Fast-track Hiring Challenge",
  );
  const [proposalDetails, setProposalDetails] = useState<string>("");

  const currentIg = igList.find((g) => g.id === selectedIgId);

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIgId) {
      toast.error("Please select an Interest Group.");
      return;
    }
    if (!proposalDetails.trim()) {
      toast.error("Please enter proposal details.");
      return;
    }

    try {
      await submitProposalMutation.mutateAsync({
        igId: selectedIgId,
        payload: {
          proposal: proposalDetails.trim(),
          budget: Number(fundingAmount) || 0,
          duration_months: 6,
        },
      });
      toast.success("Sponsorship proposal submitted for review!");
      setProposalDetails("");
      setIsProposalOpen(false);
    } catch {
      toast.error("Failed to submit sponsorship proposal.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Zap className="h-8 w-8 text-amber-500" />
            Interest Group Sponsorships
          </h1>
          <p className="text-muted-foreground mt-1">
            Sponsor specialized domain interest groups to build talent
            pipelines, host branded challenges, and empower learners.
          </p>
        </div>

        <Dialog open={isProposalOpen} onOpenChange={setIsProposalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shrink-0 bg-amber-600 hover:bg-amber-700 text-white">
              <Sparkles className="h-4 w-4" />
              Sponsor an Interest Group
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                Submit Interest Group Sponsorship Proposal
              </DialogTitle>
              <DialogDescription>
                Propose a strategic sponsorship package to support learners in{" "}
                <span className="font-semibold text-foreground">
                  {currentIg?.name || "the selected interest group"}
                </span>
                .
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitProposal} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="sponsorship-ig">Target Interest Group</Label>
                <Select value={selectedIgId} onValueChange={setSelectedIgId}>
                  <SelectTrigger id="sponsorship-ig">
                    <SelectValue placeholder="Select Interest Group" />
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

              <div className="space-y-2">
                <Label htmlFor="funding-amount">
                  Sponsorship Budget (INR / Karma equivalent)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground font-medium">
                    ₹
                  </span>
                  <Input
                    id="funding-amount"
                    type="number"
                    min="1000"
                    step="1000"
                    className="pl-7"
                    value={fundingAmount}
                    onChange={(e) => setFundingAmount(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sponsorship-deliverables">
                  Target Deliverables
                </Label>
                <Input
                  id="sponsorship-deliverables"
                  placeholder="e.g. 5 Tasks, 1 Hackathon, Priority Shortlist"
                  value={deliverables}
                  onChange={(e) => setDeliverables(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="proposal-details">
                  Proposal Scope & Objectives
                </Label>
                <Textarea
                  id="proposal-details"
                  placeholder="Outline your company's domain focus, mentorship commitment, and hiring goals for this interest group..."
                  rows={4}
                  value={proposalDetails}
                  onChange={(e) => setProposalDetails(e.target.value)}
                  required
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsProposalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="gap-1.5 bg-amber-600 hover:bg-amber-700 text-white"
                  disabled={submitProposalMutation.isPending}
                >
                  <Send className="h-4 w-4" />
                  {submitProposalMutation.isPending
                    ? "Submitting..."
                    : "Submit Proposal"}
                </Button>
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
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Learners
              </CardTitle>
              <Users className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {(metrics?.active_learners ?? 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Students actively solving tasks in{" "}
                {metrics?.ig_name || currentIg?.name || "this IG"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Sponsored Tasks
              </CardTitle>
              <Award className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {metrics?.sponsored_tasks_count ?? 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Active company-funded challenges
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Karma Funded
              </CardTitle>
              <Coins className="h-5 w-5 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">
                {(metrics?.total_karma_funded ?? 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Community karma allocated
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Engagement Index
              </CardTitle>
              <Flame className="h-5 w-5 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-rose-600">
                {metrics?.engagement_score ?? 85}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Community velocity & completion rate
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sponsorship Tiers & Corporate Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            Sponsorship Tiers & Benefits
          </CardTitle>
          <CardDescription>
            Choose the level of engagement that aligns with your technical
            hiring and brand awareness goals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {/* Silver Tier */}
            <div className="p-5 border rounded-2xl bg-card space-y-4 relative flex flex-col justify-between">
              <div className="space-y-3">
                <Badge
                  variant="outline"
                  className="border-slate-400 text-slate-700 dark:text-slate-300"
                >
                  Silver Sponsor
                </Badge>
                <div className="text-2xl font-bold">₹25,000 / mo</div>
                <p className="text-xs text-muted-foreground">
                  Perfect for brand visibility and initial talent pipeline
                  discovery.
                </p>
                <ul className="space-y-2 text-xs text-foreground/90 pt-2 border-t">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    Logo featured on IG track page
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    Post up to 3 sponsored micro-tasks
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    Access to quarterly learner radar
                  </li>
                </ul>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-4"
                onClick={() => {
                  setFundingAmount("25000");
                  setIsProposalOpen(true);
                }}
              >
                Select Silver Tier
              </Button>
            </div>

            {/* Gold Tier */}
            <div className="p-5 border-2 border-primary rounded-2xl bg-primary/5 space-y-4 relative flex flex-col justify-between">
              <div className="absolute -top-3 right-4">
                <Badge className="bg-primary text-primary-foreground font-semibold shadow-sm">
                  Recommended
                </Badge>
              </div>
              <div className="space-y-3">
                <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30">
                  Gold Sponsor
                </Badge>
                <div className="text-2xl font-bold">₹50,000 / mo</div>
                <p className="text-xs text-muted-foreground">
                  Direct engagement through challenges, AMAs, and hiring
                  filters.
                </p>
                <ul className="space-y-2 text-xs text-foreground/90 pt-2 border-t">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    Everything in Silver tier
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    Unlimited sponsored task bounties
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    Monthly virtual tech talk & mentor AMA
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    Fast-track recruiter direct shortlisting
                  </li>
                </ul>
              </div>
              <Button
                size="sm"
                className="w-full mt-4 bg-primary text-primary-foreground"
                onClick={() => {
                  setFundingAmount("50000");
                  setIsProposalOpen(true);
                }}
              >
                Select Gold Tier
              </Button>
            </div>

            {/* Platinum Tier */}
            <div className="p-5 border rounded-2xl bg-card space-y-4 relative flex flex-col justify-between">
              <div className="space-y-3">
                <Badge
                  variant="outline"
                  className="border-indigo-400 text-indigo-600 dark:text-indigo-400"
                >
                  Platinum Partner
                </Badge>
                <div className="text-2xl font-bold">₹100,000 / mo</div>
                <p className="text-xs text-muted-foreground">
                  Custom curriculum co-creation, hackathons, and top 1% talent
                  pipeline.
                </p>
                <ul className="space-y-2 text-xs text-foreground/90 pt-2 border-t">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    Everything in Gold tier
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    Exclusive branded flagship hackathon
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    Custom quest line with industry certification
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    Dedicated campus recruitment coordinator
                  </li>
                </ul>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-4"
                onClick={() => {
                  setFundingAmount("100000");
                  setIsProposalOpen(true);
                }}
              >
                Select Platinum Tier
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
