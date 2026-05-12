import {
  Activity,
  AlertTriangle,
  ArrowUpDown,
  CheckCircle2,
  ChevronDown,
  Download,
  Filter,
  Flame,
  MoreHorizontal,
  PauseCircle,
  Search,
  Shield,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Mock Data for Admin Overview
const MOCK_STATS = {
  totalInterns: 142,
  active: 118,
  atRisk: 15,
  onLeave: 5,
  inactive: 4,
  totalPointsAwarded: 125400,
};

const MOCK_INTERNS = [
  {
    id: "int_01",
    name: "Alex Doe",
    email: "alex.doe@example.com",
    team: "Frontend Guild",
    status: "ACTIVE",
    streak: 14,
    points: 1240,
    rank: 3,
  },
  {
    id: "int_02",
    name: "Sarah Smith",
    email: "sarah.s@example.com",
    team: "Backend Guild",
    status: "AT_RISK",
    streak: 0,
    points: 850,
    rank: 42,
  },
  {
    id: "int_03",
    name: "Michael Chen",
    email: "m.chen@example.com",
    team: "Design Guild",
    status: "ACTIVE",
    streak: 28,
    points: 2100,
    rank: 1,
  },
  {
    id: "int_04",
    name: "Emma Wilson",
    email: "emma.w@example.com",
    team: "Frontend Guild",
    status: "ON_LEAVE",
    streak: 0,
    points: 920,
    rank: 35,
  },
  {
    id: "int_05",
    name: "David Kim",
    email: "dkim@example.com",
    team: "Mobile Guild",
    status: "INACTIVE",
    streak: 0,
    points: 120,
    rank: 112,
  },
];

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
  return (
    <div className="flex-1 space-y-8 p-8 pt-6 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Manage Interns
          </h2>
          <p className="text-muted-foreground mt-1">
            Overview, tracking, and management of all active interns.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/intern-report">
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Generate Report
            </Button>
          </Link>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50 bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Interns
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-foreground">
              {MOCK_STATS.totalInterns}
            </div>
            <p className="text-xs text-muted-foreground mt-1">+12 this month</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active
            </CardTitle>
            <Activity className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-foreground">
              {MOCK_STATS.active}
            </div>
            <p className="text-xs text-success font-medium mt-1">
              83% engagement rate
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              At Risk
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-foreground">
              {MOCK_STATS.atRisk}
            </div>
            <p className="text-xs text-warning font-medium mt-1 flex items-center gap-1">
              Missed &gt; 3 timesheets
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Points
            </CardTitle>
            <Trophy className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono tracking-tight text-foreground">
              {MOCK_STATS.totalPointsAwarded.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all cohorts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Interns Data Table Section */}
      <Card className="border-border/50 bg-card">
        <CardHeader className="pb-4">
          <CardTitle>Intern Directory</CardTitle>
          <CardDescription>
            Search and filter interns to view detailed profiles and adjust
            points.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {/* Toolbar */}
          <div className="p-4 border-b border-border/50 flex flex-col sm:flex-row items-center gap-4 bg-muted/20">
            <div className="relative flex-1 w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                className="pl-9 bg-background w-full max-w-sm"
              />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
              <Select defaultValue="all">
                <SelectTrigger className="w-[140px] bg-background">
                  <SelectValue placeholder="Team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  <SelectItem value="frontend">Frontend</SelectItem>
                  <SelectItem value="backend">Backend</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="active">
                <SelectTrigger className="w-[140px] bg-background">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="at_risk">At Risk</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 bg-background"
              >
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-[250px]">Intern Name</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      Streak
                      <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      Points
                      <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Rank</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_INTERNS.map((intern) => (
                  <TableRow key={intern.id} className="hover:bg-muted/20">
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span className="text-foreground">{intern.name}</span>
                        <span className="text-xs text-muted-foreground font-normal">
                          {intern.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {intern.team}
                    </TableCell>
                    <TableCell>{getStatusBadge(intern.status)}</TableCell>
                    <TableCell className="text-right font-mono">
                      {intern.streak > 0 ? (
                        <span className="flex items-center justify-end gap-1.5 text-warning font-medium">
                          <Flame className="w-3 h-3" /> {intern.streak}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          {intern.streak}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium text-foreground">
                      {intern.points.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      #{intern.rank}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem className="cursor-pointer">
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            Adjust Points
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            View Timesheets
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {intern.status !== "ON_LEAVE" ? (
                            <DropdownMenuItem className="cursor-pointer text-brand-blue focus:text-brand-blue">
                              Mark On Leave
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem className="cursor-pointer text-success focus:text-success">
                              Resume Active Status
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
                            Deactivate Intern
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="p-4 border-t border-border/50 flex items-center justify-between text-sm text-muted-foreground bg-muted/10">
            <span>Showing 1 to 5 of 142 entries</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
