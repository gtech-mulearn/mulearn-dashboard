"use client";

import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle,
  Handshake,
  Plus,
  Radio,
  Search,
  Sparkles,
  Trash2,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  useCancelCollaboration,
  useCollaborations,
  useCreateCollaboration,
  useDiscoverCollaborations,
  useRespondCollaboration,
} from "@/features/company-jobs/hooks";

export function CompanyCollaborationsPageClient() {
  const [activeTab, setActiveTab] = useState("my-collaborations");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [collabType, setCollabType] = useState("HACKATHON");
  const [description, setDescription] = useState("");
  const [partnerCompanyId, setPartnerCompanyId] = useState("");

  const { data: myCollaborations = [], isLoading: isLoadingMy } =
    useCollaborations();
  const { data: discoveredCollaborations = [], isLoading: isLoadingDiscover } =
    useDiscoverCollaborations();

  const createMutation = useCreateCollaboration();
  const respondMutation = useRespondCollaboration();
  const cancelMutation = useCancelCollaboration();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error("Please fill in the proposal title and description.");
      return;
    }
    try {
      await createMutation.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        collaboration_type: collabType,
        partner_company_id: partnerCompanyId.trim() || undefined,
      });
      toast.success("Collaboration proposal created successfully!");
      setTitle("");
      setDescription("");
      setPartnerCompanyId("");
      setCollabType("HACKATHON");
      setIsCreateOpen(false);
    } catch {
      toast.error("Failed to create collaboration proposal.");
    }
  };

  const handleRespond = async (id: string, action: "ACCEPT" | "REJECT") => {
    try {
      await respondMutation.mutateAsync({
        id,
        accept: action === "ACCEPT",
      });
      toast.success(
        action === "ACCEPT"
          ? "Collaboration proposal accepted!"
          : "Collaboration proposal declined.",
      );
    } catch {
      toast.error("Failed to respond to collaboration.");
    }
  };

  const handleCancel = async (id: string, collabTitle: string) => {
    if (!confirm(`Are you sure you want to cancel "${collabTitle}"?`)) return;
    try {
      await cancelMutation.mutateAsync(id);
      toast.success("Collaboration cancelled.");
    } catch {
      toast.error("Failed to cancel collaboration.");
    }
  };

  const incomingProposals = myCollaborations.filter(
    (c) => c.status === "PROPOSED",
  );
  const activeCollaborations = myCollaborations.filter(
    (c) => c.status === "ACCEPTED" || c.status === "OPEN",
  );

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "ACCEPTED":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-medium">
            Active / Accepted
          </Badge>
        );
      case "OPEN":
        return (
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 font-medium">
            Open for Partners
          </Badge>
        );
      case "PROPOSED":
        return (
          <Badge
            variant="secondary"
            className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-medium"
          >
            Pending Review
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge
            variant="outline"
            className="text-muted-foreground font-medium"
          >
            Completed
          </Badge>
        );
      case "REJECTED":
      case "CANCELLED":
        return (
          <Badge variant="destructive" className="font-medium">
            {status}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Handshake className="h-8 w-8 text-primary" />
            Company Collaborations
          </h1>
          <p className="text-muted-foreground mt-1">
            Partner with other industry organizations on hackathons, joint
            hiring drives, and educational task sponsorships.
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shrink-0">
              <Plus className="h-4 w-4" />
              Propose Collaboration
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Propose New Collaboration</DialogTitle>
              <DialogDescription>
                Initiate a joint initiative with industry partners or make an
                open call for corporate co-sponsors.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="collab-title">Initiative Title</Label>
                <Input
                  id="collab-title"
                  placeholder="e.g. AI & Cloud Hackathon 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="collab-type">Collaboration Type</Label>
                <Select value={collabType} onValueChange={setCollabType}>
                  <SelectTrigger id="collab-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HACKATHON">
                      Hackathon / Challenge
                    </SelectItem>
                    <SelectItem value="INTERNSHIP_DRIVE">
                      Joint Internship / Hiring Drive
                    </SelectItem>
                    <SelectItem value="TASK_SPONSORSHIP">
                      Task Bounty Sponsorship
                    </SelectItem>
                    <SelectItem value="WORKSHOP">
                      Technical Workshop Series
                    </SelectItem>
                    <SelectItem value="JOINT_PROJECT">
                      Industry Open Source Project
                    </SelectItem>
                    <SelectItem value="GENERAL">General Partnership</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="partner-id">
                  Specific Partner Company ID (Optional)
                </Label>
                <Input
                  id="partner-id"
                  placeholder="Leave blank for an open community call"
                  value={partnerCompanyId}
                  onChange={(e) => setPartnerCompanyId(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="collab-desc">
                  Proposal & Scope Description
                </Label>
                <Textarea
                  id="collab-desc"
                  placeholder="Describe the initiative goals, expected contributions, target student participants, and timelines..."
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Submitting..." : "Post Proposal"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              My Active Initiatives
            </CardTitle>
            <Handshake className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeCollaborations.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Ongoing joint programs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Incoming Proposals
            </CardTitle>
            <Radio className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {incomingProposals.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting your response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Open Ecosystem Opportunities
            </CardTitle>
            <Sparkles className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {discoveredCollaborations.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Available from partner companies
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="scrollbar-none flex w-full justify-start gap-1 overflow-x-auto h-auto p-1 bg-muted rounded-xl">
          <TabsTrigger
            value="my-collaborations"
            className="shrink-0 whitespace-nowrap py-2.5 px-4 rounded-lg text-xs md:text-sm font-medium gap-2"
          >
            <Building2 className="h-4 w-4" />
            My Initiatives ({myCollaborations.length})
          </TabsTrigger>
          <TabsTrigger
            value="discover"
            className="shrink-0 whitespace-nowrap py-2.5 px-4 rounded-lg text-xs md:text-sm font-medium gap-2"
          >
            <Search className="h-4 w-4" />
            Discover Open Opportunities ({discoveredCollaborations.length})
          </TabsTrigger>
          <TabsTrigger
            value="incoming"
            className="shrink-0 whitespace-nowrap py-2.5 px-4 rounded-lg text-xs md:text-sm font-medium gap-2"
          >
            <Radio className="h-4 w-4" />
            Incoming Proposals ({incomingProposals.length})
          </TabsTrigger>
        </TabsList>

        {/* ─── TAB 1: My Collaborations ─── */}
        <TabsContent
          value="my-collaborations"
          className="space-y-6 focus-visible:outline-none"
        >
          {isLoadingMy ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          ) : myCollaborations.length === 0 ? (
            <div className="text-center py-12 border rounded-lg border-dashed">
              <Handshake className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <h3 className="font-semibold text-foreground text-base">
                No Collaboration Initiatives Yet
              </h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                Propose a new hackathon, task bounty, or joint hiring initiative
                to partner with other companies on µLearn.
              </p>
              <Button
                onClick={() => setIsCreateOpen(true)}
                className="mt-4 gap-2"
                variant="outline"
              >
                <Plus className="h-4 w-4" />
                Propose Collaboration
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {myCollaborations.map((collab) => (
                <Card key={collab.id} className="flex flex-col justify-between">
                  <CardHeader className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="outline" className="text-xs">
                        {collab.collaboration_type}
                      </Badge>
                      {getStatusBadge(collab.status)}
                    </div>
                    <CardTitle className="text-lg font-bold">
                      {collab.title}
                    </CardTitle>
                    <CardDescription className="text-xs flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      Created on{" "}
                      {new Date(collab.created_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-foreground/80 line-clamp-3">
                      {collab.description}
                    </p>
                    {collab.partner_company_name && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1.5 p-2 bg-muted/50 rounded-md">
                        <Building2 className="h-3.5 w-3.5 text-primary" />
                        Partner:{" "}
                        <span className="font-medium text-foreground">
                          {collab.partner_company_name}
                        </span>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-2 border-t flex justify-end gap-2">
                    {collab.status !== "CANCELLED" &&
                      collab.status !== "COMPLETED" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs"
                          onClick={() => handleCancel(collab.id, collab.title)}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                          Cancel
                        </Button>
                      )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ─── TAB 2: Discover Open Opportunities ─── */}
        <TabsContent
          value="discover"
          className="space-y-6 focus-visible:outline-none"
        >
          {isLoadingDiscover ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          ) : discoveredCollaborations.length === 0 ? (
            <div className="text-center py-12 border rounded-lg border-dashed">
              <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <h3 className="font-semibold text-foreground text-base">
                No Open Opportunities Available
              </h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                Open collaboration proposals from other companies will appear
                here.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {discoveredCollaborations.map((collab) => (
                <Card key={collab.id} className="flex flex-col justify-between">
                  <CardHeader className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="outline" className="text-xs">
                        {collab.collaboration_type}
                      </Badge>
                      {getStatusBadge(collab.status)}
                    </div>
                    <CardTitle className="text-lg font-bold">
                      {collab.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5 text-primary" />
                      Initiator:{" "}
                      <span className="font-medium text-foreground">
                        {collab.initiator_company_name}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-foreground/80 line-clamp-3">
                      {collab.description}
                    </p>
                  </CardContent>
                  <CardFooter className="pt-2 border-t flex justify-end">
                    <Button
                      size="sm"
                      className="gap-1 text-xs"
                      onClick={() =>
                        toast.info(
                          `To join "${collab.title}", propose a collaboration targeting ${collab.initiator_company_name}.`,
                        )
                      }
                    >
                      Express Interest
                      <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ─── TAB 3: Incoming Proposals ─── */}
        <TabsContent
          value="incoming"
          className="space-y-6 focus-visible:outline-none"
        >
          {incomingProposals.length === 0 ? (
            <div className="text-center py-12 border rounded-lg border-dashed">
              <Radio className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <h3 className="font-semibold text-foreground text-base">
                No Incoming Proposals
              </h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                When another organization targets your company for a joint
                initiative, their proposal will appear here for review.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {incomingProposals.map((collab) => (
                <Card
                  key={collab.id}
                  className="border-amber-500/20 bg-amber-500/5"
                >
                  <CardHeader className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="outline" className="text-xs">
                        {collab.collaboration_type}
                      </Badge>
                      <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                        Proposal Received
                      </Badge>
                    </div>
                    <CardTitle className="text-lg font-bold">
                      {collab.title}
                    </CardTitle>
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-primary" />
                      From:{" "}
                      <span className="font-medium text-foreground">
                        {collab.initiator_company_name}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground/80">
                      {collab.description}
                    </p>
                  </CardContent>
                  <CardFooter className="pt-2 border-t flex justify-end gap-2">
                    <Button
                      size="sm"
                      className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                      disabled={respondMutation.isPending}
                      onClick={() => handleRespond(collab.id, "ACCEPT")}
                    >
                      <CheckCircle className="h-3.5 w-3.5 mr-1" />
                      Accept Proposal
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 text-rose-600 hover:text-rose-700 text-xs"
                      disabled={respondMutation.isPending}
                      onClick={() => handleRespond(collab.id, "REJECT")}
                    >
                      <XCircle className="h-3.5 w-3.5 mr-1" />
                      Decline
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
