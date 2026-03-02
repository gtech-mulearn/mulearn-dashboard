"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { Button } from "@/components/ui/button";
import { EventForm } from "@/features/events";
import { useManageEvent } from "@/features/events/hooks/events.hooks";

interface EditEventPageProps {
  params: Promise<{ id: string }>;
}

export default function EditEventPage(props: EditEventPageProps) {
  const { id } = use(props.params);
  const { data: event, isLoading, error } = useManageEvent(id);

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

  return <EventForm initialData={event} />;
}
