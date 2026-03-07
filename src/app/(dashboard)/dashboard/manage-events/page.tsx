"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import Loader from "@/app/loading";
import { Button } from "@/components/ui/button";
import {
  EventsFilters,
  EventsGrid,
  EventsPagination,
  useEventsList,
} from "@/features/events";
import EventModal from "@/features/events/components/event-modal";
import type { Event } from "@/features/events/types/events.types";

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState("active");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("All Category");
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<Partial<Event> | null>(null);

  const { data, isLoading, refetch } = useEventsList(
    currentPage,
    activeTab !== "active" ? activeTab : undefined,
    selectedCategory !== "All Category" ? selectedCategory : undefined,
  );

  const events = data?.data ?? [];
  const pagination = data?.pagination;

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEventDeleted = async () => {
    await refetch();
  };

  const handleEventEdit = (event: Event) => {
    setEditEvent(event);
    setModalOpen(true);
  };

  return (
    <main className="flex-1 p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events</h1>
        </div>

        <Button
          className="gap-2 rounded-lg bg-pink-500 hover:bg-pink-600 text-white"
          onClick={() => {
            setEditEvent(null);
            setModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Create Event
        </Button>
      </div>

      <div className="mb-6">
        <EventsFilters
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onSearch={setSearchQuery}
          onCategoryChange={setSelectedCategory}
          selectedCategory={selectedCategory}
        />
      </div>

      <div className="mb-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader />
          </div>
        ) : (
          <EventsGrid
            events={events}
            onEventDeleted={handleEventDeleted}
            onEventEdit={handleEventEdit}
          />
        )}
      </div>

      {pagination && (
        <EventsPagination
          pagination={pagination}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      )}

      <EventModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditEvent(null);
          refetch();
        }}
        initialData={editEvent}
        isEdit={!!editEvent}
      />
    </main>
  );
}
