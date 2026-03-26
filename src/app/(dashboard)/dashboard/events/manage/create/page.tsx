"use client";

import { useRouter } from "next/navigation";
import { EventModal } from "@/features/events";

export default function CreateEventPage() {
  const router = useRouter();

  return (
    <EventModal open onClose={() => router.push("/dashboard/events/manage")} />
  );
}
