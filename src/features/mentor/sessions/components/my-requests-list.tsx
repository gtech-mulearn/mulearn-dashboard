"use client";

import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMyRequests } from "../hooks/use-student-requests";

function getStatusColor(status: string) {
  switch (status) {
    case "REQUESTED":
      return "secondary";
    case "APPROVED":
    case "SCHEDULED":
      return "default";
    case "REJECTED":
      return "destructive";
    default:
      return "outline";
  }
}

function formatMode(mode: string | null | undefined) {
  if (!mode) return "Unknown";
  return mode.charAt(0).toUpperCase() + mode.slice(1).toLowerCase();
}

function formatSessionType(type: string | undefined) {
  if (!type) return "Global";
  if (type === "campus_session") return "Campus";
  if (type === "company_session") return "Company";
  if (type === "ig_session") return "Interest Group (IG)";
  return type;
}

export function MyRequestsList() {
  const { data, isLoading } = useMyRequests({});

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton list
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  const requests = data?.data ?? [];

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border rounded-lg bg-muted/20">
        <p>You haven't requested any sessions yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Entity</TableHead>
            <TableHead>Mode</TableHead>
            <TableHead>Proposed Time</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((req) => (
            <TableRow key={req.id}>
              <TableCell className="font-medium">
                {req.title}
                {req.description && (
                  <p className="text-xs text-muted-foreground truncate max-w-xs mt-1">
                    {req.description}
                  </p>
                )}
              </TableCell>
              <TableCell>
                {req.entity_name ? (
                  req.entity_name
                ) : (
                  <span className="text-muted-foreground">Global</span>
                )}
                <div className="text-xs text-muted-foreground mt-0.5">
                  {formatSessionType(req.session_type)}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{formatMode(req.mode)}</Badge>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {format(new Date(req.starts_at), "MMM d, yyyy h:mm a")}
                </div>
                <div className="text-xs text-muted-foreground">
                  to {format(new Date(req.ends_at), "h:mm a")}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={getStatusColor(req.status ?? "Pending")}>
                  {req.status}
                </Badge>
                {req.status === "REJECTED" && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Declined by the mentors.
                  </p>
                )}
                {req.status === "SCHEDULED" && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Approved! your session is live.
                  </p>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
