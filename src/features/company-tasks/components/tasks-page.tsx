"use client";

import { useCompanyTasks } from "../hooks/use-company-tasks";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CreateTaskModal } from "./create-task-modal";

export function CompanyTasksPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { data, isLoading, error } = useCompanyTasks();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-destructive bg-destructive/10 text-destructive">
        Failed to load tasks.
      </div>
    );
  }

  const tasks = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Company Tasks
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your community tasks and track admin approval.
          </p>
        </div>
        <Button
          className="shrink-0 gap-2"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Create Task
        </Button>
      </div>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center">
          <h3 className="mt-4 text-lg font-semibold">No Tasks Found</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm">
            You haven't created any tasks yet. Tasks allow the community to
            engage with your company.
          </p>
          <Button
            className="mt-6 gap-2"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Create First Task
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tasks.map((task) => (
            <Card key={task.id} className="flex flex-col h-full">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <CardTitle
                      className="text-base line-clamp-1"
                      title={task.title}
                    >
                      {task.title}
                    </CardTitle>
                    <CardDescription className="text-xs font-medium text-primary">
                      {task.hashtag}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      task.approval_status === "approved"
                        ? "default"
                        : task.approval_status === "rejected"
                          ? "destructive"
                          : "secondary"
                    }
                    className="capitalize shrink-0"
                  >
                    {task.approval_status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {task.description}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-auto pt-4 border-t border-border/50">
                  <Badge variant="outline" className="text-xs bg-muted/50">
                    Karma: {task.karma}
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-muted/50">
                    {task.type}
                  </Badge>
                  {task.active && (
                    <Badge
                      variant="outline"
                      className="text-xs bg-green-500/10 text-green-600 border-green-500/20"
                    >
                      Active
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateTaskModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </div>
  );
}
