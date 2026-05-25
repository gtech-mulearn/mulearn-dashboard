"use client";

import { Activity, Search } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMentees } from "../hooks/use-mentees";
import { ActivityLogSheet } from "./activity-log-sheet";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function MenteesPage() {
  const [search, setSearch] = useState("");
  const [activityLogOpen, setActivityLogOpen] = useState(false);

  const { data, isLoading } = useMentees({
    search: search || undefined,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mentees</h1>
          {data && (
            <p className="text-sm text-muted-foreground">
              {data.totalItems} mentee{data.totalItems !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-56">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search mentees..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={() => setActivityLogOpen(true)}>
            <Activity className="mr-2 h-4 w-4" />
            Activity Log
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : !data || data.data.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-2 text-muted-foreground">
          <p className="text-sm">
            {search ? "No mentees match your search." : "No mentees yet."}
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mentee</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Sessions Attended</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.data.map((mentee) => (
              <TableRow key={mentee.user_id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {getInitials(mentee.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{mentee.full_name}</p>
                      {mentee.muid && (
                        <p className="text-xs text-muted-foreground">
                          {mentee.muid}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {mentee.email || "—"}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {mentee.total_sessions}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <ActivityLogSheet
        open={activityLogOpen}
        onOpenChange={setActivityLogOpen}
      />
    </div>
  );
}
