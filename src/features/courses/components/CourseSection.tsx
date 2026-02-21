"use client";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  RefreshCcw,
  Trophy,
  X,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { UnifiedCourse } from "../schemas/courses.schemas";
import { CourseCard } from "./CourseCard";
import { CourseSkeleton } from "./CourseSkeleton";

const DISCORD_SUBMIT_LINK =
  "https://discord.com/channels/771670169691881483/1455593272633458818";

interface CourseSectionProps {
  title: string;
  description?: string;
  courses: UnifiedCourse[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  onEnroll: (id: string) => void;
  isEnrolling: boolean;
}

function parseBoldText(text: string): React.ReactNode[] {
  return text.split(/(\*\*.*?\*\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      // biome-ignore lint/suspicious/noArrayIndexKey: Static text splitting guarantees stable order
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function CourseOverlay({
  course,
  onClose,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
  onEnroll,
  isEnrolling,
}: {
  course: UnifiedCourse;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
  onEnroll: (id: string) => void;
  isEnrolling: boolean;
}) {
  // Lock body scroll when overlay is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && hasNext) onNext();
      if (e.key === "ArrowLeft" && hasPrev) onPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, onNext, onPrev, hasNext, hasPrev]);

  const handleEnroll = () => {
    onEnroll(course.enrollmentId || course.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal + Nav wrapper — keeps buttons adjacent to the card */}
      <div className="relative z-10 flex items-center gap-3 animate-in zoom-in-95 fade-in duration-200">
        {/* Prev button */}
        <button
          type="button"
          onClick={hasPrev ? onPrev : undefined}
          className={`p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background text-foreground shadow-lg transition-all shrink-0 ${
            hasPrev
              ? "hover:scale-110 cursor-pointer"
              : "opacity-0 pointer-events-none"
          }`}
          aria-label="Previous course"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Modal content */}
        <div className="w-[90vw] max-w-lg max-h-[85vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col">
          {/* Sticky header with close button */}
          <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-card/95 backdrop-blur-sm border-b border-border rounded-t-2xl shrink-0">
            <h3 className="text-lg font-bold text-foreground line-clamp-1 pr-4">
              {course.title}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
            {/* Badges row */}
            <div className="flex flex-wrap gap-2">
              {course.duration && (
                <Badge variant="outline" className="gap-1 rounded-lg">
                  <Clock className="w-3 h-3" />
                  {course.duration} hours
                </Badge>
              )}
              {typeof course.karma === "number" && course.karma > 0 && (
                <Badge
                  variant="secondary"
                  className="gap-1 text-yellow-600 rounded-lg"
                >
                  <Trophy className="w-3 h-3" />
                  {course.karma} Karma
                </Badge>
              )}
              {course.hashtags?.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-xs rounded-lg font-normal"
                >
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Full description */}
            <div className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
              {parseBoldText(course.description || "No description available.")}
            </div>
          </div>

          {/* Sticky footer with actions */}
          <div className="sticky bottom-0 z-20 px-6 py-4 bg-card/95 backdrop-blur-sm border-t border-border rounded-b-2xl shrink-0 grid grid-cols-2 gap-3">
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md rounded-xl h-11 col-span-2"
              onClick={handleEnroll}
              disabled={isEnrolling}
            >
              {isEnrolling ? "Enrolling..." : "Enroll Now"}
            </Button>

            {course.source === "wadhwani" && (
              <Button
                variant="outline"
                className="border-border hover:bg-muted text-muted-foreground rounded-xl h-11 col-span-2 mt-[-6px]"
                onClick={() => window.open(DISCORD_SUBMIT_LINK, "_blank")}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Submit Proof
              </Button>
            )}
          </div>
        </div>

        {/* Next button */}
        <button
          type="button"
          onClick={hasNext ? onNext : undefined}
          className={`p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background text-foreground shadow-lg transition-all shrink-0 ${
            hasNext
              ? "hover:scale-110 cursor-pointer"
              : "opacity-0 pointer-events-none"
          }`}
          aria-label="Next course"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export function CourseSection({
  title,
  description,
  courses,
  isLoading,
  isError,
  refetch,
  onEnroll,
  isEnrolling,
}: CourseSectionProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <section className="space-y-6 py-4">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h2>
        {description && (
          <p className="text-muted-foreground text-base">{description}</p>
        )}
      </div>

      {isError ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-8 flex flex-col items-center justify-center gap-4 text-destructive">
          <div className="flex items-center gap-2 font-semibold">
            <AlertCircle className="w-5 h-5" />
            <span>Failed to load courses</span>
          </div>
          <p className="text-sm text-destructive/80 text-center max-w-md">
            We couldn&apos;t fetch the course list at this time. Please check
            your connection or try again.
          </p>
          <Button
            variant="outline"
            onClick={refetch}
            className="border-destructive/20 hover:bg-destructive/10 text-destructive bg-background rounded-xl"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: Static loading skeletons
            <CourseSkeleton key={i} />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/50 p-12 text-center">
          <p className="text-muted-foreground font-medium">
            No courses available at the moment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course, index) => (
            <CourseCard
              key={course.id}
              course={course}
              onEnroll={onEnroll}
              onReadMore={() => setExpandedIndex(index)}
              isEnrolling={isEnrolling}
            />
          ))}
        </div>
      )}

      {/* Overlay */}
      {expandedIndex !== null && courses[expandedIndex] && (
        <CourseOverlay
          course={courses[expandedIndex]}
          onClose={() => setExpandedIndex(null)}
          onPrev={() =>
            setExpandedIndex((prev) =>
              prev !== null && prev > 0 ? prev - 1 : prev,
            )
          }
          onNext={() =>
            setExpandedIndex((prev) =>
              prev !== null && prev < courses.length - 1 ? prev + 1 : prev,
            )
          }
          hasPrev={expandedIndex > 0}
          hasNext={expandedIndex < courses.length - 1}
          onEnroll={onEnroll}
          isEnrolling={isEnrolling}
        />
      )}
    </section>
  );
}
