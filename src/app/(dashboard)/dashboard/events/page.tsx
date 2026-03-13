"use client";

import { useState } from "react";
import Loader from "@/app/loading";
import {
  EventsFilters,
  EventsGrid,
  EventsPagination,
  useEventsList,
} from "@/features/events";

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState("active");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("All Category");
  const [_searchQuery, setSearchQuery] = useState("");

  const { data, isLoading } = useEventsList(
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

  return (
    <main className="flex-1 p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Events</h1>
        </div>
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
          <EventsGrid events={events} />
        )}
      </div>

      {pagination && (
        <EventsPagination
          pagination={pagination}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      )}
    </main>
  );
}
