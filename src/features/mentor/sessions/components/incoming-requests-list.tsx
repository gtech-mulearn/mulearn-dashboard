"use client";

import { format } from "date-fns";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useIncomingRequests } from "../hooks/use-student-requests";
import type { StudentSessionRequest } from "../schemas";
import { VerifyRequestDialog } from "./verify-request-dialog";

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

export function IncomingRequestsList() {
  const { data, isLoading } = useIncomingRequests({});
  const [selectedRequest, setSelectedRequest] =
    useState<StudentSessionRequest | null>(null);

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
        <p>No incoming session requests found.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Requested By</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Proposed Time</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((req) => (
              <TableRow key={req.id}>
                <TableCell>
                  <div className="font-medium">{req.requested_by_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {req.requested_by_muid}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{req.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {formatMode(req.mode)} •{" "}
                    {req.max_participants
                      ? `Max ${req.max_participants} pax`
                      : "No limit"}
                  </div>
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
                  <div className="text-sm">
                    {format(new Date(req.starts_at), "MMM d, yyyy")}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(req.starts_at), "h:mm a")} -{" "}
                    {format(new Date(req.ends_at), "h:mm a")}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {req.status === "REQUESTED" ||
                  req.status === "PENDING_APPROVAL" ? (
                    <Button size="sm" onClick={() => setSelectedRequest(req)}>
                      Review
                    </Button>
                  ) : (
                    <Badge variant="outline">{req.status}</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <VerifyRequestDialog
        request={selectedRequest}
        open={!!selectedRequest}
        onOpenChange={(v) => !v && setSelectedRequest(null)}
      />
    </>
  );
}
