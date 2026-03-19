"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { Button } from "@/components/ui/button";
import { EventModal, useManageEventDetail } from "@/features/events";

interface EditEventPageProps {
  params: Promise<{ id: string }>;
}

export default function EditEventPage(props: EditEventPageProps) {
  const { id } = use(props.params);
  const { data: event, isLoading, error } = useManageEventDetail(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-muted-foreground">
          Failed to load event for editing.
        </p>
        <Button variant="ghost" className="mt-4" asChild>
          <Link href="/dashboard/events/manage">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Manage Events
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <EventModal
      open
      onClose={() => {
        window.location.href = "/dashboard/events/manage";
      }}
      initialData={event}
      isEdit
    />
  );
}
