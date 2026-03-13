"use client";

import { MoreVertical } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteEvent } from "../hooks/events.hooks";
import type { Event } from "../types";

interface EventCardProps {
  event: Event;
  onDelete?: () => void;
  onEdit?: (event: Event) => void;
}

export function EventCard({ event, onDelete, onEdit }: EventCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteEventMutation = useDeleteEvent(event.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-pink-100 text-pink-700";
      case "upcoming":
        return "bg-blue-100 text-blue-700";
      case "past":
        return "bg-gray-100 text-gray-700";
      case "request":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await deleteEventMutation.mutateAsync();
      if (!response.hasError) {
        toast.success("Event deleted successfully");
        onDelete?.();
      }
    } catch (_error) {
      toast.error("Failed to delete event");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return "No date";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-200 flex flex-col h-full">
      <div className="w-full" style={{ aspectRatio: "16/9" }}>
        <div className="p-3 h-full flex items-center justify-center overflow-hidden">
          <Image
            src={event.cover_image ?? "/images/fallback.webp"}
            alt={event.name}
            width={100}
            height={100}
            className="w-full h-full object-cover rounded-md"
            style={{ display: "block" }}
          />
        </div>
      </div>

      <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
        <Badge className={`font-medium`}>{event.category || "Event"}</Badge>
        <Badge
          className={`${getStatusColor(event.status)} font-medium capitalize`}
        >
          {event.status}
        </Badge>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="text-xs text-gray-500 mb-2">
          {formatDate(event.event_start_date)} • {event.event_start_time}
        </div>

        <h3 className="font-semibold text-sm mb-1 line-clamp-2 text-gray-900">
          {event.name}
        </h3>

        {event.location_name && (
          <div className="text-xs text-gray-600 mb-3">
            📍 {event.location_name}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between text-sm">
          <span className="text-gray-600 font-medium">
            {parseInt(event.ticket_value, 10) > 0
              ? `₹${event.ticket_value}`
              : "Free"}
          </span>
        </div>
      </div>

      <div className="absolute top-3 right-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit?.(event)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-600"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
