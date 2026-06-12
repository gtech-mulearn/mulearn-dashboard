"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskVerificationTable } from "./task-verification-table";

export function TaskVerificationPage() {
  const [roleFilter, setRoleFilter] = useState<
    "mentor" | "company" | "admin" | "all"
  >("all");
  const [activeTab, setActiveTab] = useState<
    "pending" | "approved" | "rejected"
  >("pending");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Task Verification
          </h1>
          <p className="text-sm text-muted-foreground">
            Review and approve tasks submitted by mentors and companies.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={roleFilter}
            onValueChange={(val) => setRoleFilter(val as any)}
          >
            <SelectTrigger className="w-full max-w-[180px] sm:w-[180px] bg-background border-border text-foreground">
              <SelectValue placeholder="Filter by Submitter..." />
            </SelectTrigger>
            <SelectContent className="bg-card text-foreground border border-border">
              <SelectItem value="all">All Submitters</SelectItem>
              <SelectItem value="mentor">Mentors Only</SelectItem>
              <SelectItem value="company">Companies Only</SelectItem>
              <SelectItem value="admin">Admins Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as any)}
        className="w-full"
      >
        <TabsList className="bg-muted border border-border/60">
          <TabsTrigger
            value="pending"
            className="data-[state=active]:bg-background"
          >
            Pending
          </TabsTrigger>
          <TabsTrigger
            value="approved"
            className="data-[state=active]:bg-background"
          >
            Approved
          </TabsTrigger>
          <TabsTrigger
            value="rejected"
            className="data-[state=active]:bg-background"
          >
            Rejected
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          <TaskVerificationTable
            status="pending"
            role={roleFilter === "all" ? undefined : roleFilter}
          />
        </TabsContent>

        <TabsContent value="approved" className="mt-4">
          <TaskVerificationTable
            status="approved"
            role={roleFilter === "all" ? undefined : roleFilter}
          />
        </TabsContent>

        <TabsContent value="rejected" className="mt-4">
          <TaskVerificationTable
            status="rejected"
            role={roleFilter === "all" ? undefined : roleFilter}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
