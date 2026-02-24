import type React from "react";
import Loader from "@/app/loading";
import { useEventsList } from "../hooks/events.hooks";
import type { Event } from "../types/events.types";
import { EventCard } from "./event-card";

const ManageEventsDashboard: React.FC = () => {
  const { data, isLoading, error } = useEventsList(1);

  if (isLoading) return <Loader />;
  if (error) return <div>Error loading events.</div>;

  const events: Event[] = data?.data || [];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Events</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {events.map((event: Event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
};

export default ManageEventsDashboard;
