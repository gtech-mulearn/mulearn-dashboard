"use client";

import {
  BarChart3,
  GraduationCap,
  MapPin,
  Star,
  Trophy,
  UserCheck,
  Users,
} from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Blank } from "@/components/dashboard/table/Blank";
import Pagination from "@/components/dashboard/table/pagination";
import Table, { type Data } from "@/components/dashboard/table/Table";
import TableTop from "@/components/dashboard/table/TableTop";
import THead from "@/components/dashboard/table/Thead";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useCollegeCsvDownload,
  useCollegeDetails,
  useStudentCsvDownload,
  useStudentDetails,
  useStudentLevels,
  useTopDistricts,
  useZoneDetails,
} from "../hooks";

const numberFormatter = new Intl.NumberFormat("en-IN");

// ─────────────────────────────────────────────────────────────────────────────
// Primitives
// ─────────────────────────────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  icon,
  gradientClass,
}: {
  title: string;
  value: string | number;
  icon: ReactNode;
  gradientClass: string;
}) {
  return (
    <Card className={`overflow-hidden border-border/60 ${gradientClass}`}>
      <CardContent className="flex items-center justify-between gap-4 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {title}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
            {value}
          </p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-background/70 text-muted-foreground shadow-sm">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="space-y-1">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────────────────────────────────────

export function ZonalDashboardView() {
  const [studentPage, setStudentPage] = useState(1);
  const [studentPerPage, setStudentPerPage] = useState(20);
  const [studentSearch, setStudentSearch] = useState("");
  const [studentSort, setStudentSort] = useState<
    "karma" | "full_name" | "muid" | "level" | undefined
  >(undefined);

  const [collegePage, setCollegePage] = useState(1);
  const [collegePerPage, setCollegePerPage] = useState(20);
  const [collegeSearch, setCollegeSearch] = useState("");
  const [collegeSort, setCollegeSort] = useState<"title" | "code" | undefined>(
    undefined,
  );

  const { data: details, isLoading: isDetailsLoading } = useZoneDetails();
  const { data: topDistricts = [], isLoading: isTopDistrictsLoading } =
    useTopDistricts();
  const { data: studentLevels = [], isLoading: isStudentLevelsLoading } =
    useStudentLevels();

  const {
    data: studentDetails,
    isLoading: isStudentDetailsLoading,
    isFetching: isStudentDetailsFetching,
  } = useStudentDetails({
    pageIndex: studentPage,
    perPage: studentPerPage,
    search: studentSearch,
    sortBy: studentSort,
  });

  const {
    data: collegeDetails,
    isLoading: isCollegeDetailsLoading,
    isFetching: isCollegeDetailsFetching,
  } = useCollegeDetails({
    pageIndex: collegePage,
    perPage: collegePerPage,
    search: collegeSearch,
    sortBy: collegeSort || undefined,
  });

  const downloadStudentsCsv = useStudentCsvDownload();
  const downloadCollegesCsv = useCollegeCsvDownload();

  const studentRows: Data[] = useMemo(() => {
    if (!studentDetails?.data) return [];
    return studentDetails.data.map((item) => ({
      id: item.user_id,
      full_name: item.full_name,
      muid: item.muid,
      karma: item.karma,
      rank: item.rank,
      level: item.level,
    }));
  }, [studentDetails]);

  const collegeRows: Data[] = useMemo(() => {
    if (!collegeDetails?.data) return [];
    return collegeDetails.data.map(
      (item: {
        id: string;
        title: string;
        code: string;
        level: number | null;
        lead: string | null;
        lead_number: string | null;
      }) => ({
        id: item.id,
        title: item.title,
        code: item.code,
        level: item.level?.toString() ?? "-",
        lead: item.lead ?? "-",
        lead_number: item.lead_number ?? "-",
      }),
    );
  }, [collegeDetails]);

  const studentColumns = [
    { column: "full_name", Label: "Student", isSortable: true, width: "w-56" },
    { column: "muid", Label: "MUID", isSortable: true, width: "w-48" },
    { column: "karma", Label: "Karma", isSortable: true, width: "w-24" },
    { column: "rank", Label: "Rank", isSortable: false, width: "w-24" },
    { column: "level", Label: "Level", isSortable: true, width: "w-36" },
  ];

  const collegeColumns = [
    { column: "title", Label: "College", isSortable: true, width: "w-64" },
    { column: "code", Label: "Campus Code", isSortable: true, width: "w-36" },
    { column: "level", Label: "Level", isSortable: true, width: "w-24" },
    { column: "lead", Label: "Campus Lead", isSortable: false, width: "w-44" },
    { column: "lead_number", Label: "Lead Number", isSortable: false },
  ];

  const studentTotalPages = studentDetails?.pagination?.totalPages ?? 0;
  const studentTotalCount = studentDetails?.pagination?.count ?? 0;

  const collegeTotalPages = collegeDetails?.pagination?.totalPages ?? 0;
  const collegeTotalCount = collegeDetails?.pagination?.count ?? 0;

  const sortedStudentLevels = useMemo(() => {
    return [...studentLevels].sort(
      (a, b) => Number(a.level_order) - Number(b.level_order),
    );
  }, [studentLevels]);

  const handleStudentSort = (column: string) => {
    setStudentPage(1);
    setStudentSort(
      (prev) =>
        (prev === column ? `-${column}` : column) as
          | "karma"
          | "full_name"
          | "muid"
          | "level"
          | undefined,
    );
  };

  const handleCollegeSort = (column: string) => {
    setCollegePage(1);
    setCollegeSort(
      (prev) =>
        (prev === column ? `-${column}` : column) as
          | "title"
          | "code"
          | undefined,
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-primary  sm:text-3xl">
          Zonal Dashboard
        </h1>
      </div>

      {/* Zone Overview */}
      <section className="space-y-4">
        <SectionHeader
          title="Zone Overview"
          subtitle="Live snapshot for your zone leadership view."
        />

        {isDetailsLoading ? (
          <div className="grid gap-4 md:grid-cols-4">
            {["one", "two", "three", "four"].map((key) => (
              <Skeleton key={key} className="h-28 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard
              title="Zone"
              value={details?.zone ?? "-"}
              icon={<MapPin className="h-5 w-5" />}
              gradientClass="gradient-1"
            />
            <StatCard
              title="Rank"
              value={details ? `#${details.rank}` : "-"}
              icon={<Trophy className="h-5 w-5" />}
              gradientClass="gradient-2"
            />
            <StatCard
              title="Total Members"
              value={numberFormatter.format(details?.total_members ?? 0)}
              icon={<Users className="h-5 w-5" />}
              gradientClass="gradient-3"
            />
            <StatCard
              title="Active This Month"
              value={numberFormatter.format(details?.active_members ?? 0)}
              icon={<UserCheck className="h-5 w-5" />}
              gradientClass="gradient-4"
            />
          </div>
        )}

        {!isDetailsLoading && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-border/60">
              <CardContent className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Zonal Lead
                  </p>
                  <p className="mt-1 text-lg font-semibold text-foreground">
                    {details?.zonal_lead ?? "Not Assigned"}
                  </p>
                </div>
                <div className="rounded-xl bg-muted/50 p-2.5 text-muted-foreground">
                  <GraduationCap className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardContent className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Total Karma
                  </p>
                  <p className="mt-1 text-lg font-semibold text-foreground">
                    {numberFormatter.format(details?.karma ?? 0)}
                  </p>
                </div>
                <div className="rounded-xl bg-muted/50 p-2.5 text-muted-foreground">
                  <Star className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardContent className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Active Members
                  </p>
                  <p className="mt-1 text-lg font-semibold text-foreground">
                    {numberFormatter.format(details?.active_members ?? 0)}
                  </p>
                </div>
                <div className="rounded-xl bg-muted/50 p-2.5 text-muted-foreground">
                  <BarChart3 className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </section>

      {/* Charts */}
      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">
              Top Districts
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Highest karma-performing districts in the zone.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {isTopDistrictsLoading ? (
              <div className="space-y-3">
                {["a", "b", "c"].map((key) => (
                  <Skeleton key={key} className="h-44 w-full rounded-xl" />
                ))}
              </div>
            ) : topDistricts.length ? (
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topDistricts}
                    margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="district"
                      axisLine={false}
                      tickLine={false}
                      fontSize={12}
                      tick={{ fill: "var(--color-muted-foreground)" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      fontSize={12}
                      tick={{ fill: "var(--color-muted-foreground)" }}
                      tickFormatter={(value) => numberFormatter.format(value)}
                    />
                    <Tooltip
                      cursor={{ fill: "var(--color-muted)", opacity: 0.2 }}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid var(--color-border)",
                        backgroundColor: "var(--color-card)",
                        color: "var(--color-foreground)",
                      }}
                      formatter={(value: number | undefined) => [
                        numberFormatter.format(Number(value) || 0),
                        "Karma",
                      ]}
                    />
                    <Bar
                      dataKey="karma"
                      name="Karma"
                      fill="var(--color-primary)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={48}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border/70 bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                No district data available yet.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">
              Student Level Distribution
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Count of students across MuLearn levels.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {isStudentLevelsLoading ? (
              <div className="space-y-3">
                {["a", "b", "c", "d"].map((key) => (
                  <Skeleton key={key} className="h-10 w-full rounded-xl" />
                ))}
              </div>
            ) : sortedStudentLevels.length ? (
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={sortedStudentLevels}
                    margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="level_order"
                      axisLine={false}
                      tickLine={false}
                      fontSize={12}
                      tickFormatter={(val) => `Level ${val}`}
                      tick={{ fill: "var(--color-muted-foreground)" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      fontSize={12}
                      tick={{ fill: "var(--color-muted-foreground)" }}
                      tickFormatter={(value) => numberFormatter.format(value)}
                    />
                    <Tooltip
                      cursor={{ fill: "var(--color-muted)", opacity: 0.2 }}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid var(--color-border)",
                        backgroundColor: "var(--color-card)",
                        color: "var(--color-foreground)",
                      }}
                      formatter={(value: number | undefined) => [
                        numberFormatter.format(Number(value) || 0),
                        "Students",
                      ]}
                      labelFormatter={(label) => `Level ${label}`}
                    />
                    <Bar
                      dataKey="students_count"
                      name="Students"
                      fill="var(--color-chart-4)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={48}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border/70 bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                No student level data available.
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Data Tables */}
      <section>
        <SectionHeader
          title="Zone Lists"
          subtitle="Search and export students or colleges for your zone."
        />
        <Tabs defaultValue="students" className="mt-4">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="colleges">Colleges</TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="mt-6 space-y-4">
            <TableTop
              onSearchText={(val) => {
                setStudentPage(1);
                setStudentSearch(val);
              }}
              onPerPageNumber={(val) => {
                setStudentPage(1);
                setStudentPerPage(val);
              }}
              perPage={studentPerPage}
              perPageOptions={[10, 20, 50]}
              CSV="Zone Student Details.csv"
              searchPlaceholder="Search students..."
              searchSize="md"
              searchPosition="right"
              onCsvDownload={async () => {
                await downloadStudentsCsv.download();
              }}
              isCsvDownloading={downloadStudentsCsv.isLoading}
            />

            <Table
              rows={studentRows}
              isloading={isStudentDetailsLoading || isStudentDetailsFetching}
              page={studentPage}
              perPage={studentPerPage}
              columnOrder={studentColumns}
              customCellRender={(column, row) => {
                if (column === "level") {
                  return (
                    <Badge
                      variant="outline"
                      className="border-primary/20 bg-primary/10 text-xs font-semibold text-primary"
                    >
                      {String(row.level ?? "-")}
                    </Badge>
                  );
                }
                return null;
              }}
            >
              <THead
                columnOrder={studentColumns}
                onIconClick={handleStudentSort}
                action={false}
              />

              {!isStudentDetailsLoading && (
                <Pagination
                  currentPage={studentPage}
                  totalPages={studentTotalPages}
                  handleNextClick={() =>
                    setStudentPage((p) =>
                      Math.min(p + 1, studentTotalPages || 1),
                    )
                  }
                  handlePreviousClick={() =>
                    setStudentPage((p) => Math.max(p - 1, 1))
                  }
                  perPage={studentPerPage}
                  totalCount={studentTotalCount}
                />
              )}

              <Blank />
            </Table>
          </TabsContent>

          <TabsContent value="colleges" className="mt-6 space-y-4">
            <TableTop
              onSearchText={(val) => {
                setCollegePage(1);
                setCollegeSearch(val);
              }}
              onPerPageNumber={(val) => {
                setCollegePage(1);
                setCollegePerPage(val);
              }}
              perPage={collegePerPage}
              perPageOptions={[10, 20, 50]}
              CSV="Zone College Details.csv"
              searchPlaceholder="Search colleges..."
              searchSize="md"
              searchPosition="right"
              onCsvDownload={async () => {
                await downloadCollegesCsv.download();
              }}
              isCsvDownloading={downloadCollegesCsv.isLoading}
            />

            <Table
              rows={collegeRows}
              isloading={isCollegeDetailsLoading || isCollegeDetailsFetching}
              page={collegePage}
              perPage={collegePerPage}
              columnOrder={collegeColumns}
              customCellRender={(column, row) => {
                if (column === "level") {
                  return (
                    <Badge
                      variant="outline"
                      className="border-primary/20 bg-primary/10 text-xs font-semibold text-primary"
                    >
                      {String(row.level ?? "-")}
                    </Badge>
                  );
                }
                return null;
              }}
            >
              <THead
                columnOrder={collegeColumns}
                onIconClick={handleCollegeSort}
                action={false}
              />

              {!isCollegeDetailsLoading && (
                <Pagination
                  currentPage={collegePage}
                  totalPages={collegeTotalPages}
                  handleNextClick={() =>
                    setCollegePage((p) =>
                      Math.min(p + 1, collegeTotalPages || 1),
                    )
                  }
                  handlePreviousClick={() =>
                    setCollegePage((p) => Math.max(p - 1, 1))
                  }
                  perPage={collegePerPage}
                  totalCount={collegeTotalCount}
                />
              )}

              <Blank />
            </Table>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
