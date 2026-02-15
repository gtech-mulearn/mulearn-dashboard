"use client";

interface ManageUsersEmptyStateProps {
  message?: string;
}

export function ManageUsersEmptyState({
  message = "No users found.",
}: ManageUsersEmptyStateProps) {
  return (
    <div className="border-border bg-card text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm">
      {message}
    </div>
  );
}
