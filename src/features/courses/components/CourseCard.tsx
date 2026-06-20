import { BookOpen, Clock, ExternalLink, Trophy } from "lucide-react";
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
import { Spinner } from "@/components/ui/spinner";
import { chipColor } from "@/lib/chip-colors";
import type { UnifiedCourse } from "../schemas/courses.schemas";

const DISCORD_SUBMIT_LINK =
  "https://discord.com/channels/771670169691881483/1455593272633458818";

interface CourseCardProps {
  course: UnifiedCourse;
  onEnroll: (id: string) => void;
  onReadMore: () => void;
  isEnrolling?: boolean;
}

function truncateDescription(text: string, maxLen = 120): string {
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen)}...`;
}

function isDirectImageUrl(url: string): boolean {
  try {
    const u = new URL(url);
    const pageHosts = [
      "www.shutterstock.com",
      "shutterstock.com",
      "www.freepik.com",
      "freepik.com",
    ];
    if (pageHosts.some((h) => u.hostname === h)) return false;
    return true;
  } catch {
    return false;
  }
}

export function CourseCard({
  course,
  onEnroll,
  onReadMore,
  isEnrolling,
}: CourseCardProps) {
  const handleEnroll = () => {
    onEnroll(course.enrollmentId || course.id);
  };

  const handleSubmit = () => {
    window.open(DISCORD_SUBMIT_LINK, "_blank");
  };

  const description = course.description || "";
  const isLongDesc = description.length > 120;
  const showImage = course.imageUrl && isDirectImageUrl(course.imageUrl);

  return (
    <Card className="h-full flex flex-col overflow-hidden group hover:shadow-lg transition-all duration-300 border-border rounded-2xl hover:border-primary/30 bg-card">
      {/* Image / Placeholder */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted shrink-0">
        {showImage ? (
          <>
            {/* biome-ignore lint/performance/noImgElement: Dynamic images from sheet need <img> */}
            <img
              src={course.imageUrl}
              alt={course.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </>
        ) : (
          <div className="flex items-center justify-center h-full bg-linear-to-br from-primary/5 to-primary/10 text-primary/30">
            <svg
              role="img"
              aria-label="Course"
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
              className="backdrop-blur-sm shadow-sm gap-1 border-0 rounded-full px-3 py-1"
            >
              <Trophy className="w-3 h-3" />
              {course.karma} Karma
            </Badge>
          )}
        </div>
      </div>

      <CardHeader className="space-y-2 pb-2">
        <div className="flex justify-between items-start gap-2">
          <Badge variant="outline" className="text-xs font-normal rounded-lg">
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
                {course.duration} hours
              </span>
            )}
          </div>
        </div>
        <CardTitle className="line-clamp-2 text-lg font-bold text-foreground group-hover:text-primary transition-colors">
          {course.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-grow space-y-4">
        <CardDescription className="text-sm leading-relaxed text-muted-foreground">
          {truncateDescription(description)}
          {isLongDesc && (
            <Button
              type="button"
              variant="ghost"
              className="ml-1 text-sm font-medium"
              onClick={onReadMore}
            >
              Read More
            </Button>
          )}
        </CardDescription>

        {course.hashtags && course.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {course.hashtags.map((tag) => (
              <span
                key={tag}
                className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${chipColor(tag)}`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2 pb-6 grid grid-cols-2 gap-3 shrink-0">
        <Button
          variant="default"
          className="w-full rounded-xl h-11 col-span-2"
          onClick={handleEnroll}
          disabled={isEnrolling}
        >
          {isEnrolling ? (
            <>
              <Spinner className="h-4 w-4" /> Enrolling...
            </>
          ) : course.source === "wadhwani" ? (
            "Enroll Now"
          ) : (
            "View Course"
          )}
        </Button>

        {course.source === "wadhwani" && (
          <Button
            variant="secondary"
            className="w-full rounded-xl h-11 col-span-2 mt-[-6px]"
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
