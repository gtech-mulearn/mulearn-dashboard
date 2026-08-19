"use client";

import {
  Award,
  BarChart3,
  CheckCircle2,
  Globe,
  GraduationCap,
  HeartHandshake,
  MessageSquare,
  MessageSquarePlus,
  Send,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  useCompanyFeedbackList,
  useCompanyImpactReport,
  useSubmitCompanyFeedback,
  useTogglePublishImpactReport,
} from "@/features/company-jobs/hooks";

export function CompanyFeedbackPageClient() {
  const [activeTab, setActiveTab] = useState("impact-report");
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [feedbackType, setFeedbackType] = useState("GENERAL");
  const [comments, setComments] = useState("");

  const { data: impactReport, isLoading: isLoadingImpact } =
    useCompanyImpactReport();
  const { data: feedbackList = [], isLoading: isLoadingFeedback } =
    useCompanyFeedbackList();

  const togglePublishMutation = useTogglePublishImpactReport();
  const submitFeedbackMutation = useSubmitCompanyFeedback();

  const handleTogglePublish = async (checked: boolean) => {
    try {
      await togglePublishMutation.mutateAsync(checked);
      toast.success(
        checked
          ? "Impact report is now published publicly!"
          : "Impact report has been set to private.",
      );
    } catch {
      toast.error("Failed to update impact report publication status.");
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comments.trim()) {
      toast.error("Please enter your comments.");
      return;
    }
    try {
      await submitFeedbackMutation.mutateAsync({
        rating,
        feedback_type: feedbackType,
        comments: comments.trim(),
      });
      toast.success("Feedback submitted successfully. Thank you!");
      setComments("");
      setRating(5);
      setIsSubmitOpen(false);
    } catch {
      toast.error("Failed to submit feedback.");
    }
  };

  const avgRating =
    feedbackList.length > 0
      ? (
          feedbackList.reduce((acc, f) => acc + (f.rating || 0), 0) /
          feedbackList.length
        ).toFixed(1)
      : "5.0";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <HeartHandshake className="h-8 w-8 text-primary" />
            Impact & Community Feedback
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your organization&apos;s ecosystem impact, publish verified
            metrics, and review learner feedback.
          </p>
        </div>

        <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shrink-0">
              <MessageSquarePlus className="h-4 w-4" />
              Submit Feedback
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Platform & Experience Feedback</DialogTitle>
              <DialogDescription>
                Share your experience hiring talent, partnering on gigs, or
                working with µLearn mentors.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitFeedback} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Rating</Label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      className="p-1 rounded hover:scale-110 transition-transform"
                      onClick={() => setRating(star)}
                    >
                      <Star
                        className={`h-7 w-7 ${
                          star <= rating
                            ? "text-amber-500 fill-amber-500"
                            : "text-muted-foreground/40"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-sm font-semibold ml-2">
                    {rating} / 5 Stars
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback-type">Category</Label>
                <Select value={feedbackType} onValueChange={setFeedbackType}>
                  <SelectTrigger id="feedback-type">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GENERAL">General Experience</SelectItem>
                    <SelectItem value="HIRING">Hiring & Candidates</SelectItem>
                    <SelectItem value="GIGS">Gigs & Task Execution</SelectItem>
                    <SelectItem value="CAMPUS">Campus Engagements</SelectItem>
                    <SelectItem value="PLATFORM">Platform & Tools</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback-comments">
                  Comments & Suggestions
                </Label>
                <Textarea
                  id="feedback-comments"
                  placeholder="Tell us what worked well and what could be improved..."
                  rows={4}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  required
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsSubmitOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitFeedbackMutation.isPending}
                  className="gap-1.5"
                >
                  <Send className="h-4 w-4" />
                  {submitFeedbackMutation.isPending
                    ? "Submitting..."
                    : "Submit Feedback"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="scrollbar-none flex w-full justify-start gap-1 overflow-x-auto h-auto p-1 bg-muted rounded-xl">
          <TabsTrigger
            value="impact-report"
            className="shrink-0 whitespace-nowrap py-2.5 px-4 rounded-lg text-xs md:text-sm font-medium gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Impact Report
          </TabsTrigger>
          <TabsTrigger
            value="community-feedback"
            className="shrink-0 whitespace-nowrap py-2.5 px-4 rounded-lg text-xs md:text-sm font-medium gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            Learner Feedback ({feedbackList.length})
          </TabsTrigger>
        </TabsList>

        {/* ─── TAB 1: Impact Report ─── */}
        <TabsContent
          value="impact-report"
          className="space-y-6 focus-visible:outline-none"
        >
          {/* Publication Banner */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl font-bold">
                    Public Impact Report
                  </CardTitle>
                  <Badge
                    className={
                      impactReport?.is_published
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {impactReport?.is_published
                      ? "Published"
                      : "Draft / Private"}
                  </Badge>
                </div>
                <CardDescription>
                  When published, your verified hiring and community stats are
                  showcased on your public company profile and institutional
                  impact leaderboard.
                </CardDescription>
              </div>

              <div className="flex items-center gap-3">
                <Label htmlFor="publish-toggle" className="text-sm font-medium">
                  {impactReport?.is_published ? "Published" : "Publish"}
                </Label>
                <Switch
                  id="publish-toggle"
                  checked={impactReport?.is_published ?? false}
                  disabled={togglePublishMutation.isPending || isLoadingImpact}
                  onCheckedChange={handleTogglePublish}
                />
              </div>
            </CardHeader>
          </Card>

          {/* Metrics Grid */}
          {isLoadingImpact ? (
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
                    Total Hires Completed
                  </CardTitle>
                  <Users className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">
                    {impactReport?.total_hires ?? 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Verified platform placements
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Gigs & Micro-Tasks
                  </CardTitle>
                  <Award className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">
                    {impactReport?.total_gigs ?? 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Industry gigs completed by learners
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Karma Awarded
                  </CardTitle>
                  <Sparkles className="h-5 w-5 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-amber-600">
                    {(impactReport?.total_karma_awarded ?? 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total µLearn karma distributed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Campuses Engaged
                  </CardTitle>
                  <GraduationCap className="h-5 w-5 text-emerald-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">
                    {impactReport?.campuses_engaged ?? 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Partner engineering colleges & institutes
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Impact Milestones Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Ecosystem Engagement Milestones
              </CardTitle>
              <CardDescription>
                Summary of your company&apos;s educational ecosystem
                involvement.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-xl bg-card space-y-2">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h4 className="font-semibold text-foreground">
                    Active Employer
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Your organization is actively recruiting from the top 5%
                    ranked µLearner talent pool across Kerala and South India.
                  </p>
                </div>

                <div className="p-4 border rounded-xl bg-card space-y-2">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <h4 className="font-semibold text-foreground">
                    Campus Outreach
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Engaging directly with students in top tier colleges through
                    challenges and real-world task bounties.
                  </p>
                </div>

                <div className="p-4 border rounded-xl bg-card space-y-2">
                  <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h4 className="font-semibold text-foreground">
                    Community Builder
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Fueling continuous skill development by sponsoring interest
                    group learning tracks and awarding karma.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── TAB 2: Community Feedback ─── */}
        <TabsContent
          value="community-feedback"
          className="space-y-6 focus-visible:outline-none"
        >
          {/* Rating Summary Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <Star className="h-8 w-8 fill-amber-500" />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-extrabold">
                        {avgRating}
                      </span>
                      <span className="text-muted-foreground font-medium">
                        / 5.0
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Based on {feedbackList.length} reviews from candidates &
                      community
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => setIsSubmitOpen(true)}
                  variant="outline"
                  className="gap-2 shrink-0"
                >
                  <MessageSquarePlus className="h-4 w-4" />
                  Write a Review
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Feedback Items Grid */}
          {isLoadingFeedback ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : feedbackList.length === 0 ? (
            <div className="text-center py-12 border rounded-lg border-dashed">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <h3 className="font-semibold text-foreground text-base">
                No Feedback Received Yet
              </h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                Candidate and mentor feedback on your job postings and task
                assignments will appear here.
              </p>
              <Button
                onClick={() => setIsSubmitOpen(true)}
                className="mt-4 gap-2"
                variant="outline"
              >
                <MessageSquarePlus className="h-4 w-4" />
                Submit Company Feedback
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {feedbackList.map((item) => (
                <Card key={item.id} className="flex flex-col justify-between">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {(item.from_user_name || "U")
                              .charAt(0)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm text-foreground">
                            {item.from_user_name || "Anonymous Member"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.created_at
                              ? new Date(item.created_at).toLocaleDateString()
                              : "Recent"}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs font-normal">
                        {item.feedback_type || "GENERAL"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-4 w-4 ${
                            s <= item.rating
                              ? "fill-amber-500 text-amber-500"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed">
                      &ldquo;{item.comments}&rdquo;
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
