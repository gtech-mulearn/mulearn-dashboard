/**
 * Mentees Tab
 *
 * 📍 src/features/mentor/profile/components/tabs/mentees-tab.tsx
 *
 * Displays a list of the mentor's mentees.
 */

"use client";

import { Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMentees } from "@/features/mentor/mentees/hooks/use-mentees";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const STATUS_VARIANTS: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  ATTENDED: { label: "Attended", variant: "default" },
  ABSENT: { label: "Absent", variant: "destructive" },
  INVITED: { label: "Invited", variant: "secondary" },
};

export function MenteesTab() {
  const { data, isLoading } = useMentees();
  const mentees = data?.data ?? [];

  return (
    <Card className="rounded-2xl border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Users className="h-4 w-4 text-muted-foreground" />
          Mentees
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : mentees.length === 0 ? (
          <div className="flex min-h-[100px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-muted-foreground py-8">
            <Users className="h-8 w-8 opacity-30" />
            <p className="text-sm">No mentees yet.</p>
          </div>
        ) : (
          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mentee</TableHead>
                  <TableHead>Last Status</TableHead>
                  <TableHead className="text-right">Sessions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mentees.map((mentee) => {
                  const status = mentee.last_attendance_status
                    ? STATUS_VARIANTS[mentee.last_attendance_status]
                    : null;
                  return (
                    <TableRow
                      key={
                        mentee.id ||
                        `${mentee.user_id}-${mentee.last_session_id}`
                      }
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {getInitials(mentee.user_full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {mentee.user_full_name}
                            </p>
                            {mentee.mu_id && (
                              <p className="text-xs text-muted-foreground">
                                {mentee.mu_id}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {status ? (
                          <Badge variant={status.variant}>{status.label}</Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {mentee.session_count}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
