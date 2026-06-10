"use client";

import {
  Activity,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Flame,
  Gem,
  MoreHorizontal,
  PauseCircle,
  Plus,
  Shield,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";
import { type ReactElement, useState } from "react";
import { toast } from "sonner";
import Pagination from "@/components/dashboard/table/pagination";
import Table, { type Data } from "@/components/dashboard/table/Table";
import TableTop from "@/components/dashboard/table/TableTop";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { MuidSearchInput } from "@/components/ui/muid-search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useDeactivateIntern,
  useExportInterns,
  useGuilds,
  useManageInternsList,
  useManageInternsStatus,
  useOnboardIntern,
  useUpdateIntern,
} from "@/features/intern";

const getStatusBadge = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return (
        <Badge
          variant="outline"
          className="border-success/30 text-success bg-success/10 gap-1.5"
        >
          <CheckCircle2 className="w-3 h-3" /> Active
        </Badge>
      );
    case "AT_RISK":
      return (
        <Badge
          variant="outline"
          className="border-warning/30 text-warning bg-warning/10 gap-1.5"
        >
          <AlertTriangle className="w-3 h-3" /> At Risk
        </Badge>
      );
    case "ON_LEAVE":
      return (
        <Badge
          variant="outline"
          className="border-brand-blue/30 text-brand-blue bg-brand-blue/10 gap-1.5"
        >
          <PauseCircle className="w-3 h-3" /> On Leave
        </Badge>
      );
    case "INACTIVE":
      return (
        <Badge
          variant="outline"
          className="border-muted-foreground/30 text-muted-foreground bg-muted/50 gap-1.5"
        >
          <Shield className="w-3 h-3" /> Inactive
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function ManageInternsPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Onboard State
  const [isOnboardOpen, setIsOnboardOpen] = useState(false);
  const [onboardUser, setOnboardUser] = useState<any>(null);
  const [onboardGuild, setOnboardGuild] = useState("");
  const [onboardStatus, setOnboardStatus] = useState("ACTIVE");

  // Update State
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [updateInternId, setUpdateInternId] = useState<string | null>(null);
  const [updateInternName, setUpdateInternName] = useState("");
  const [updateGuild, setUpdateGuild] = useState("");
  const [updateStatus, setUpdateStatus] = useState("");

  // Deactivate State
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);
  const [deactivateInternId, setDeactivateInternId] = useState<string | null>(
    null,
  );
  const [deactivateInternName, setDeactivateInternName] = useState("");

  // Queries & Mutations
  const { data: statusData } = useManageInternsStatus();
  const { data: listData, isLoading: isListLoading } = useManageInternsList({
    page,
    perPage,
    search: searchText || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const { data: guilds = [] } = useGuilds();
  const defaultGuilds = [
    "DESIGN",
    "FRONTEND",
    "BACKEND",
    "MOBILE",
    "DEVOPS",
    "QA",
    "PM",
  ];
  const guildOptions = guilds.length > 0 ? guilds : defaultGuilds;

  const onboardMutation = useOnboardIntern();
  const updateMutation = useUpdateIntern(updateInternId || "");
  const deactivateMutation = useDeactivateIntern();
  const { mutateAsync: exportCsv, isPending: isExporting } = useExportInterns();

  // Parse stats with robust fallbacks
  const totalInterns =
    statusData?.total ?? statusData?.totalInterns ?? statusData?.TOTAL ?? 0;
  const activeCount = statusData?.ACTIVE ?? statusData?.active ?? 0;
  const atRiskCount =
    statusData?.AT_RISK ?? statusData?.atRisk ?? statusData?.at_risk ?? 0;
  const totalPoints =
    statusData?.total_points ??
    statusData?.totalPointsAwarded ??
    statusData?.points ??
    0;

  const rows = (listData?.data ?? []) as unknown as Data[];
  const totalPages = listData?.pagination?.totalPages ?? 1;
  const totalCount = listData?.pagination?.count ?? 0;

  const tableColumns = [
    {
      column: "full_name",
      Label: "Intern Name",
      isSortable: true,
      wrap: (data: string, _id: string, row: Data) => (
        <div className="flex flex-col">
          <span className="font-bold text-foreground uppercase tracking-tight text-sm">
            {data}
          </span>
          <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest leading-none mt-1">
            {row.muid as string}
          </span>
        </div>
      ),
    },
    {
      column: "guild",
      Label: "Team",
      isSortable: true,
      wrap: (data: string) => (
        <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
          {data}
        </span>
      ),
    },
    {
      column: "status",
      Label: "Status",
      isSortable: true,
      wrap: (data: string) => getStatusBadge(data),
    },
    {
      column: "streak",
      Label: "Streak",
      isSortable: true,
      wrap: (data: string) => (
        <div className="font-mono font-black text-warning flex items-center gap-1">
          {Number(data || 0) > 0 ? (
            <>
              <Flame className="w-3 h-3 fill-warning" /> {data}
            </>
          ) : (
            <span className="text-muted-foreground/40">{data || "0"}</span>
          )}
        </div>
      ),
    },
    {
      column: "score",
      Label: "Gems",
      isSortable: true,
      wrap: (data: string) => (
        <div className="font-mono font-black text-foreground flex items-center gap-1.5">
          <Gem className="w-3.5 h-3.5 text-brand-blue" />
          {Number(data || 0).toLocaleString()}
        </div>
      ),
    },
    {
      column: "rank",
      Label: "Rank",
      isSortable: true,
      wrap: (data: string) => (
        <span className="font-black text-muted-foreground">#{data || "-"}</span>
      ),
    },
  ];

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 max-w-7xl mx-auto w-full bg-background/50">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase flex items-center gap-3">
            <Users className="w-10 h-10 text-primary" />
            Manage Interns
          </h2>
          <p className="text-muted-foreground mt-1 font-medium italic">
            Oversee the realm of active learners and contributors.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={() => setIsOnboardOpen(true)}
            className="gap-2 bg-gradient-to-r from-brand-blue to-brand-purple hover:scale-[1.02] transition-transform text-white font-black uppercase text-[10px] tracking-widest h-10 shadow-lg rounded-xl"
          >
            <Plus className="w-4 h-4" />
            Onboard Intern
          </Button>
          <Link href="/dashboard/management/manage-interns/timesheet-reviews">
            <Button className="gap-2 bg-brand-blue hover:bg-brand-blue/90 text-white font-black uppercase text-[10px] tracking-widest h-10 shadow-lg rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
              Timesheets
            </Button>
          </Link>
          <Link href="/dashboard/management/manage-interns/leave-reviews">
            <Button className="gap-2 bg-warning hover:bg-warning/90 text-warning-foreground font-black uppercase text-[10px] tracking-widest h-10 shadow-lg rounded-xl">
              <Calendar className="w-4 h-4" />
              Leaves
            </Button>
          </Link>
          <Link href="/dashboard/management/manage-interns/intern-report">
            <Button className="gap-2 bg-primary text-primary-foreground font-black uppercase text-[10px] tracking-widest h-10 shadow-lg rounded-xl">
              <Sparkles className="w-4 h-4" />
              Reports
            </Button>
          </Link>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/40 bg-card/40 backdrop-blur-md shadow-xl border-t-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Total Interns
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tighter tabular-nums">
              {totalInterns}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 font-bold uppercase tracking-tight">
              Registered Cohort Members
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/40 backdrop-blur-md shadow-xl border-t-success/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Active Heroes
            </CardTitle>
            <Activity className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tighter tabular-nums text-success">
              {activeCount}
            </div>
            <p className="text-[10px] text-success font-bold mt-2 uppercase tracking-tight">
              Actively submitting quests
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/40 backdrop-blur-md shadow-xl border-t-warning/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              At Risk
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tighter tabular-nums text-warning">
              {atRiskCount}
            </div>
            <p className="text-[10px] text-warning font-bold mt-2 uppercase tracking-tight">
              Action needed soon
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/40 backdrop-blur-md shadow-xl border-t-brand-blue/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Total Points
            </CardTitle>
            <Trophy className="h-4 w-4 text-brand-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black font-mono tracking-tighter tabular-nums text-brand-blue flex items-center gap-2">
              <Gem className="w-6 h-6" />
              {totalPoints.toLocaleString()}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 font-bold uppercase tracking-tight">
              Karma accumulated
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Interns Data Table Section */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black uppercase tracking-widest">
              Intern Directory
            </h3>
            <p className="text-[10px] font-bold uppercase text-muted-foreground/60 tracking-wider">
              Manage profiles and track progress
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[180px] h-10 font-black uppercase text-[10px] tracking-widest border-border/40 bg-card/40">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent className="bg-card/95 backdrop-blur-xl border-border/60">
                <SelectItem
                  value="all"
                  className="font-bold uppercase text-[10px]"
                >
                  All Statuses
                </SelectItem>
                <SelectItem
                  value="ACTIVE"
                  className="font-bold uppercase text-[10px]"
                >
                  Active
                </SelectItem>
                <SelectItem
                  value="AT_RISK"
                  className="font-bold uppercase text-[10px]"
                >
                  At Risk
                </SelectItem>
                <SelectItem
                  value="ON_LEAVE"
                  className="font-bold uppercase text-[10px]"
                >
                  On Leave
                </SelectItem>
                <SelectItem
                  value="INACTIVE"
                  className="font-bold uppercase text-[10px]"
                >
                  Inactive
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TableTop
          onSearchText={(val) => {
            setSearchText(val);
            setPage(1);
          }}
          onPerPageNumber={(val) => {
            setPerPage(val);
            setPage(1);
          }}
          CSV="interns.csv"
          perPage={perPage}
          perPageOptions={[10, 20, 50]}
          searchPlaceholder="Search heroes..."
          searchSize="md"
          searchPosition="left"
          searchWrapperClassName="bg-card/40 border-border/40"
          onCsvDownload={async () => {
            await exportCsv();
          }}
          isCsvDownloading={isExporting}
        />

        <Card className="border-border/40 bg-card/40 backdrop-blur-xl shadow-2xl overflow-hidden">
          <CardContent className="p-0">
            <Table
              rows={rows}
              isloading={isListLoading}
              page={page}
              perPage={perPage}
              columnOrder={tableColumns}
              id={["id"]}
              slNoCellClassName="font-black text-muted-foreground/40 w-16"
              customActionRender={(row) => (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0 hover:bg-muted/50 rounded-lg"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-48 bg-card/95 backdrop-blur-xl border-border/60 font-bold"
                  >
                    <DropdownMenuItem
                      onClick={() => {
                        setUpdateInternId(String(row.id));
                        setUpdateInternName(String(row.full_name));
                        setUpdateGuild(String(row.guild ?? ""));
                        setUpdateStatus(String(row.status ?? "ACTIVE"));
                        setIsUpdateOpen(true);
                      }}
                      className="cursor-pointer uppercase text-[10px] tracking-wider py-3"
                    >
                      Edit Intern
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setDeactivateInternId(String(row.id));
                        setDeactivateInternName(String(row.full_name));
                        setIsDeactivateOpen(true);
                      }}
                      className="cursor-pointer uppercase text-[10px] tracking-wider py-3 text-destructive focus:text-destructive"
                    >
                      Deactivate
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            />

            <div className="p-4 border-t border-border/20">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                perPage={perPage}
                totalCount={totalCount}
                handlePreviousClick={() => setPage((p) => Math.max(1, p - 1))}
                handleNextClick={() =>
                  setPage((p) => Math.min(totalPages, p + 1))
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onboard Intern Dialog */}
      <Dialog open={isOnboardOpen} onOpenChange={setIsOnboardOpen}>
        <DialogContent className="bg-card/95 backdrop-blur-xl border-border/60">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-wider text-foreground">
              Onboard Intern
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Search for a user by MUID and assign their guild and status.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!onboardUser) {
                toast.error("Please select a user");
                return;
              }
              if (!onboardGuild) {
                toast.error("Please select a guild");
                return;
              }
              onboardMutation.mutate(
                {
                  mu_id: onboardUser.muid,
                  user_id: onboardUser.id,
                  guild: onboardGuild,
                  status: onboardStatus,
                },
                {
                  onSuccess: () => {
                    setIsOnboardOpen(false);
                    setOnboardUser(null);
                    setOnboardGuild("");
                    setOnboardStatus("ACTIVE");
                  },
                },
              );
            }}
            className="space-y-4 py-4"
          >
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                Select User (MUID)
              </Label>
              <MuidSearchInput
                keepOpen
                selectedUser={
                  onboardUser
                    ? { muid: onboardUser.muid, name: onboardUser.full_name }
                    : null
                }
                onSelectUser={(user) => setOnboardUser(user)}
                onClear={() => setOnboardUser(null)}
                placeholder="Search by MUID..."
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                Guild
              </Label>
              <Select value={onboardGuild} onValueChange={setOnboardGuild}>
                <SelectTrigger className="w-full h-10 font-bold uppercase text-xs border-border/40 bg-background/50">
                  <SelectValue placeholder="Select Guild" />
                </SelectTrigger>
                <SelectContent className="bg-card/95 backdrop-blur-xl border-border/60">
                  {guildOptions.map((g) => (
                    <SelectItem
                      key={g}
                      value={g}
                      className="font-bold uppercase text-xs"
                    >
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                Initial Status
              </Label>
              <Select value={onboardStatus} onValueChange={setOnboardStatus}>
                <SelectTrigger className="w-full h-10 font-bold uppercase text-xs border-border/40 bg-background/50">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent className="bg-card/95 backdrop-blur-xl border-border/60">
                  <SelectItem
                    value="ACTIVE"
                    className="font-bold uppercase text-xs text-success"
                  >
                    Active
                  </SelectItem>
                  <SelectItem
                    value="AT_RISK"
                    className="font-bold uppercase text-xs text-warning"
                  >
                    At Risk
                  </SelectItem>
                  <SelectItem
                    value="ON_LEAVE"
                    className="font-bold uppercase text-xs text-brand-blue"
                  >
                    On Leave
                  </SelectItem>
                  <SelectItem
                    value="INACTIVE"
                    className="font-bold uppercase text-xs text-muted-foreground"
                  >
                    Inactive
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOnboardOpen(false)}
                disabled={onboardMutation.isPending}
                className="uppercase tracking-widest text-[10px] font-black border-border/50 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={onboardMutation.isPending}
                className="bg-gradient-to-r from-brand-blue to-brand-purple hover:scale-[1.02] transition-transform text-white uppercase tracking-widest text-[10px] font-black shadow-lg rounded-xl"
              >
                {onboardMutation.isPending ? "Onboarding..." : "Onboard"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Update Intern Dialog */}
      <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
        <DialogContent className="bg-card/95 backdrop-blur-xl border-border/60">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-wider text-foreground">
              Edit Intern
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Modify the guild and status for {updateInternName}.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!updateInternId) return;
              updateMutation.mutate(
                {
                  guild: updateGuild,
                  status: updateStatus,
                },
                {
                  onSuccess: () => {
                    setIsUpdateOpen(false);
                    setUpdateInternId(null);
                    setUpdateInternName("");
                    setUpdateGuild("");
                    setUpdateStatus("");
                  },
                },
              );
            }}
            className="space-y-4 py-4"
          >
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                Intern Name
              </Label>
              <div className="h-10 px-3 py-2 rounded-md border border-border/40 bg-muted/20 text-sm font-bold text-muted-foreground uppercase flex items-center">
                {updateInternName}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                Guild
              </Label>
              <Select value={updateGuild} onValueChange={setUpdateGuild}>
                <SelectTrigger className="w-full h-10 font-bold uppercase text-xs border-border/40 bg-background/50">
                  <SelectValue placeholder="Select Guild" />
                </SelectTrigger>
                <SelectContent className="bg-card/95 backdrop-blur-xl border-border/60">
                  {guildOptions.map((g) => (
                    <SelectItem
                      key={g}
                      value={g}
                      className="font-bold uppercase text-xs"
                    >
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                Status
              </Label>
              <Select value={updateStatus} onValueChange={setUpdateStatus}>
                <SelectTrigger className="w-full h-10 font-bold uppercase text-xs border-border/40 bg-background/50">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent className="bg-card/95 backdrop-blur-xl border-border/60">
                  <SelectItem
                    value="ACTIVE"
                    className="font-bold uppercase text-xs text-success"
                  >
                    Active
                  </SelectItem>
                  <SelectItem
                    value="AT_RISK"
                    className="font-bold uppercase text-xs text-warning"
                  >
                    At Risk
                  </SelectItem>
                  <SelectItem
                    value="ON_LEAVE"
                    className="font-bold uppercase text-xs text-brand-blue"
                  >
                    On Leave
                  </SelectItem>
                  <SelectItem
                    value="INACTIVE"
                    className="font-bold uppercase text-xs text-muted-foreground"
                  >
                    Inactive
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsUpdateOpen(false)}
                disabled={updateMutation.isPending}
                className="uppercase tracking-widest text-[10px] font-black border-border/50 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="bg-primary text-primary-foreground uppercase tracking-widest text-[10px] font-black shadow-lg rounded-xl"
              >
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Deactivate Intern Dialog */}
      <ConfirmDialog
        open={isDeactivateOpen}
        onOpenChange={setIsDeactivateOpen}
        title="Deactivate Intern"
        description={`Are you sure you want to deactivate ${deactivateInternName}? This will remove their intern status and set their record to INACTIVE.`}
        confirmLabel="Deactivate"
        variant="destructive"
        isPending={deactivateMutation.isPending}
        onConfirm={() => {
          if (!deactivateInternId) return;
          deactivateMutation.mutate(deactivateInternId, {
            onSuccess: () => {
              setIsDeactivateOpen(false);
              setDeactivateInternId(null);
              setDeactivateInternName("");
            },
          });
        }}
      />
    </div>
  );
}
