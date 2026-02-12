import { BookOpen, Clock, ExternalLink, Trophy } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { UnifiedCourse } from "../schemas/courses.schemas";

interface CourseCardProps {
  course: UnifiedCourse;
  onEnroll: (id: string) => void;
  isEnrolling?: boolean;
}

export function CourseCard({ course, onEnroll, isEnrolling }: CourseCardProps) {
  const handleEnroll = () => {
    if (course.enrollmentId) {
      onEnroll(course.enrollmentId);
    }
  };

  const handleSubmit = () => {
    // TODO: Move this link to constants or API config if it varies
    window.open("https://discord.com/channels/YOUR_DISCORD_ID", "_blank");
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden group hover:shadow-lg transition-all duration-300 border-border rounded-2xl hover:border-primary/30 bg-card">
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {course.imageUrl ? (
          <Image
            src={course.imageUrl}
            alt={course.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-linear-to-br from-primary/5 to-primary/10 text-primary/30">
            <svg
              role="img"
              aria-label="description"
              className="w-16 h-16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-2">
          {typeof course.karma === "number" && course.karma > 0 && (
            <Badge
              variant="secondary"
              className="bg-background/90 backdrop-blur-sm shadow-sm text-yellow-600 gap-1 border-0 rounded-full px-3 py-1"
            >
              <Trophy className="w-3 h-3" />
              {course.karma} Karma
            </Badge>
          )}
        </div>
      </div>

      <CardHeader className="space-y-2 pb-2">
        <div className="flex justify-between items-start gap-2">
          <Badge
            variant="outline"
            className="text-xs font-normal text-muted-foreground border-border rounded-lg"
          >
            {course.source === "wadhwani" ? "Wadhwani" : "OpenGrad"}
          </Badge>
          <div className="flex gap-2 text-xs text-muted-foreground">
            {course.lessonCount !== undefined && (
              <span className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                {course.lessonCount} Lessons
              </span>
            )}
            {course.duration && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {course.duration}
              </span>
            )}
          </div>
        </div>
        <CardTitle className="line-clamp-2 text-lg font-bold text-foreground group-hover:text-primary transition-colors">
          {course.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-grow space-y-4">
        <CardDescription className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {course.description || "No description available for this course."}
        </CardDescription>

        {course.hashtags && course.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {course.hashtags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2.5 py-1 bg-gray-50 text-gray-500 rounded-full border border-gray-100 font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2 pb-6 grid grid-cols-2 gap-3">
        <Button
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all hover:shadow-lg rounded-xl h-11 col-span-2"
          onClick={handleEnroll}
          disabled={isEnrolling}
        >
          {isEnrolling
            ? "Enrolling..."
            : course.source === "wadhwani"
              ? "Enroll Now"
              : "View Course"}
        </Button>

        {course.source === "wadhwani" && (
          <Button
            variant="outline"
            className="w-full border-border hover:bg-muted text-muted-foreground rounded-xl h-11 col-span-2 mt-[-6px]"
            onClick={handleSubmit}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Submit Proof
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
